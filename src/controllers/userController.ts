import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendEmail } from '../services/authService';
import CollectedData from '../models/CollectedData';

// Generate a random password
const generateRandomPassword = (length: number = 12): string => {
    return randomBytes(length).toString('hex').slice(0, length);
};


export const getAllUsersByRole = async (req: Request, res: Response) => {
    try {
        // Fetch users with the role 'customer'
        const customers = await User.find({ role: 'customer' });
        // Fetch users with the role 'salesman'
        const salesman = await User.find({ role: 'salesman' });
        // Check if both roles are found
        // if (customers.length === 0 && salesman.length === 0) {
        //     return res.status(404).json({ message: 'No customers or salesmen found' });
        // }

        res.status(200).json({
            customers,
            salesman
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, mobile, role } = req.body;

        // Validate role
        if (!['customer', 'salesman'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate and hash a random password
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            role,
        });

        // Save user to the database
        await newUser.save();

        // Send email with password
        await sendEmail(email, randomPassword);

        res.status(201).json({ message: 'User created successfully, password sent via email', user: newUser });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, role } = req.body;

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the new email is provided and is different from the current email
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            // Generate a new password if the email is changed
            const newPassword = generateRandomPassword();
            user.password = await bcrypt.hash(newPassword, 10);

            // Send the new password via email
            await sendEmail(email, newPassword);

            // Update the email field
            user.email = email;
        }

        // Update other user fields
        if (name) user.name = name;
        if (mobile) user.mobile = mobile;
        if (role) user.role = role;

        // Save the updated user
        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find and delete the user by ID
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getCounts = async (req: Request, res: Response) => {
    try {
        // Count the number of salesmen
        const salesmanCount = await User.countDocuments({ role: 'salesman' });

        // Count the number of customers
        const customerCount = await User.countDocuments({ role: 'customer' });

        // Sum the amounts in the CollectionData collection
        const totalAmountData = await CollectedData.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);

        // Extract total amount from the aggregation result
        const totalAmount = totalAmountData.length > 0 ? totalAmountData[0].totalAmount : 0;

        // Send the counts and total amount in the response
        res.status(200).json({
            salesmanCount,
            customerCount,
            totalAmount,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getCustomerVerifyCounts = async (req: Request, res: Response) => {
    try {
        const customerId = req.user; // Assuming req.user contains the logged-in customer's information

        // Validate customerId
        if (!customerId || !customerId._id) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Count the number of verified documents for the specific customer
        const customerVerifySuccessCount = await CollectedData.countDocuments({
            customerName: customerId._id,
            customerVerify: "Accepted"
        });

        // Count the number of pending verification documents for the specific customer
        const customerVerifyRejectedCount = await CollectedData.countDocuments({
            customerName: customerId._id,
            customerVerify: "Rejected"
        });

        const customerVerifyPendingCount = await CollectedData.countDocuments({
            customerName: customerId._id,
            customerVerify: "Pending"
        });

        // Send the counts in the response
        res.status(200).json({
            customerVerifySuccessCount,
            customerVerifyRejectedCount,
            customerVerifyPendingCount
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};