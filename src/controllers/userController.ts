import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendEmail } from '../services/authService';
import CollectedData from '../models/CollectedData';
import { sendWhatsappCredential } from '../services/whatsappService';
import Address from '../models/Address';
import mongoose, { Types } from 'mongoose';
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
        const { name, email, mobile, address, role } = req.body;
        // Validate role
        if (!['customer', 'salesman'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        // Handle empty email string
        const processedEmail = email?.trim() || undefined;
        // Check if user already exists, only if email is provided
        if (processedEmail) {
            const existingUser = await User.findOne({ email: processedEmail });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
        }

        if (mobile) {
            const existingUser = await User.findOne({ mobile });
            if (existingUser) {
                return res.status(400).json({ message: 'Mobile Number already exists' });
            }
        }
        // Generate and hash a random password
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        // Handle address if provided
        let addressId: Types.ObjectId | null = null;
        if (address) {
            const existingCity = await Address.findOne({ city: address.city });
            if (!existingCity) {
                return res.status(400).json({ message: 'City not found' });
            }

            const validAreas = existingCity.areas;
            if (!validAreas.includes(address.areas)) {
                return res.status(400).json({ message: `Invalid area provided: ${address.areas}` });
            }

            addressId = existingCity._id as Types.ObjectId;
        }
        // Create new user
        const newUser = new User({
            name,
            email: processedEmail,
            mobile,
            password: hashedPassword,
            role,
            address
        });
        // Save user to the database
        await newUser.save();
        // Send email or other credentials
        // await sendEmail(email,randomPassword);
        await sendWhatsappCredential(randomPassword, mobile);
        res.status(201).json({ message: 'User created successfully, password sent via Whatsapp', user: newUser });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



const validateAddress = async (city: string, areas: string): Promise<string | null> => {
    // Check if the city exists
    const existingCity = await Address.findOne({ city });
    if (!existingCity) {
        return 'City not found';
    }

    // Validate the area
    const validAreas = existingCity.areas;
    if (!validAreas.includes(areas)) {
        return `Invalid area provided: ${areas}`;
    }

    return null; // No errors
};


export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, role, address } = req.body;

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

      
        // Check if the new email is provided and is different from the current email
        if (email !== undefined) {
            if (email !== user.email) {
                // If the new email is non-empty, ensure it's not already in use
                if (email !== "") {
                    const existingUser = await User.findOne({ email });
                    if (existingUser) {
                        return res.status(400).json({ message: 'Email is already in use' });
                    }
                    user.email = email;
                } else {
                    // If the email is an empty string, clear the email
                    user.email = undefined;
                }
            }
        }


        // Store the current mobile number
        const oldMobile = user.mobile;

        // Handle mobile change if provided
        if (mobile) {
            if (mobile !== oldMobile) {
                const existingUser = await User.findOne({ mobile });
                if (existingUser) {
                    return res.status(400).json({ message: 'Mobile Number already exists' });
                }
                // Generate and hash a new password
                const newPassword = generateRandomPassword();
                user.password = await bcrypt.hash(newPassword, 10);
                // Send the new password via WhatsApp
                await sendWhatsappCredential(newPassword, mobile);
            }
            user.mobile = mobile;
        }

        // Validate address if provided
        if (address) {
            const validationError = await validateAddress(address.city, address.areas);
            if (validationError) {
                return res.status(400).json({ message: validationError });
            }

            // Update the address fields
            user.address = {
                city: address.city,
                areas: address.areas
            };
        }
        // Update other user fields
        if (name) user.name = name;
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
            { $match: { customerVerify: 'Accepted' } },
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


export const createAddress = async (req: Request, res: Response) => {
    try {
        const { city, areas } = req.body;

        // Validate required fields
        if (!city || !areas || !Array.isArray(areas)) {
            return res.status(400).json({ message: 'City and area are required, and area must be an array.' });
        }

        // Create a new address document
        const newAddress = new Address({
            city,
            areas
        });

        // Save the new address to the database
        const savedAddress = await newAddress.save();

        // Return success response
        return res.status(201).json({
            message: 'Address created successfully',
            address: savedAddress
        });
    } catch (error) {
        console.error('Error creating address:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { city, areas } = req.body;

        // Validate inputs
        if (!city || !areas || !Array.isArray(areas)) {
            return res.status(400).json({ message: 'City and area are required, and area must be an array.' });
        }

        // Find the address by ID and update it
        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { city, areas },
            { new: true } // Return the updated document
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the address by ID and delete it
        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getAddress = async (req: Request, res: Response) => {
    try {
        // Fetch all addresses from the database
        const address = await Address.find();

        res.status(200).json(address);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}