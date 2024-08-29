import { Request, Response } from 'express';
import CollectedData from '../models/CollectedData';
import User from '../models/User';
// import { sendWhatsAppMessage } from '../utils/sendWhatsAppMessage';
import { sendWhatsAppMessage } from '../services/whatsappService';
import crypto from 'crypto';

// Function to generate a unique verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const createCollectedData = async (req: Request, res: Response) => {
    try {
        const { amount, date, customerName } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const salesman = req.user;  // `req.user` should now be recognized as `IUser`

        // Validate customerName to be a valid User (if necessary)
        const customer = await User.findById(customerName);
        if (!customer) {
            return res.status(400).json({ message: 'Invalid customer' });
        }
        
        // Generate a unique token for verification
        const verifyToken = generateVerificationToken();
        const verifyLink = `${process.env.BASE_URL}/verify/${verifyToken}`;

        const newCollectedData = new CollectedData({
            amount,
            date,
            customerName: customer._id,  // Save only the customer ID
            salesman: salesman._id,
            token : verifyToken // Store the token in the database
        });

        await newCollectedData.save();

        // Send WhatsApp message
        await sendWhatsAppMessage(customer.name, customer.mobile, amount.toString(), date.toString(), verifyLink);

        res.status(201).json(newCollectedData);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateCollectedData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get the ID of the data to update
        const { amount, date, customerName } = req.body;

        // Validate the input data
        if (!id || !amount || !date || !customerName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the collected data entry by ID
        const collectedData = await CollectedData.findById(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'CollectedData not found' });
        }

        // Update the fields with new values
        collectedData.amount = amount;
        collectedData.date = date;
        collectedData.customerName = customerName; // Assuming you store customer ID or reference
        // You can add additional fields as necessary

        // Save the updated entry
        await collectedData.save();

        res.status(200).json(collectedData);
    } catch (error) {
        console.error('Error updating collected data:', error);
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteCollectedData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get the ID of the data to delete

        // Validate the ID
        if (!id) {
            return res.status(400).json({ message: 'Missing ID' });
        }

        // Find and delete the collected data entry by ID
        const collectedData = await CollectedData.findByIdAndDelete(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'CollectedData not found' });
        }

        res.status(200).json({ message: 'CollectedData deleted successfully' });
    } catch (error) {
        console.error('Error deleting collected data:', error);
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getCollectedDataBySalesman = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const salesman = req.user;  // `req.user` should now be recognized as `IUser`
    
        const collectedData = await CollectedData.find({ salesman: salesman._id })
        .populate('customerName', 'name') // Populate customerName with name field (optional)
        .populate('salesman', 'name'); // Populate salesman with name field (optional)
        ;

        res.status(200).json(collectedData);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};


export const getAllCollection = async (req: Request, res: Response) => {
    try {
        // Fetch all collected data where `customerVerify` is true
        const verifiedData = await CollectedData.find()
            .populate('customerName', 'name') // Populate customerName with name field (optional)
            .populate('salesman', 'name'); // Populate salesman with name field (optional)

        if (!verifiedData.length) {
            return res.status(404).json({ message: 'No verified data found' });
        }

        res.status(200).json(verifiedData);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getCustomerData = async (req: Request, res: Response) => {
    try {
        const customerId =  req.user;

        // Validate customerId
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Fetch data for the specific customer
        const customerData = await CollectedData.find({ customerName: customerId._id })
            .populate('customerName', 'name') // Populate customerName with name field (optional)
            .populate('salesman', 'name'); // Populate salesman with name field (optional)

        if (!customerData.length) {
            return res.status(404).json({ message: 'No data found for the specified customer' });
        }

        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { token } = req.params; // Extract the token from the request parameters

        // Find the collected data entry with the given token
        const collectedData = await CollectedData.findOne({ token: token });
        if (!collectedData) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update the `customerVerify` field
        collectedData.customerVerify = true;
        await collectedData.save();

        res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



// Helper function to get total customer count
const getTotalCustomerCount = async (salesmanId: string) => {
    return CollectedData.distinct('customerName', { salesman: salesmanId }).countDocuments();
};

// Helper function to get total amount collected
const getTotalAmountCollected = async (salesmanId: string) => {
    const result = await CollectedData.aggregate([
        { $match: { salesman: salesmanId } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    return result[0]?.totalAmount || 0;
};

export const getCollectedCountBySalesman = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const salesman = req.user;  // `req.user` should now be recognized as `IUser`

        // Get total customer count and total amount collected
        const [customerCount, totalAmount] = await Promise.all([
            getTotalCustomerCount(salesman._id),
            getTotalAmountCollected(salesman._id)
        ]);

        // Respond with the collected data, total customer count, and total amount
        res.status(200).json({
            customerCount,
            totalAmount
        });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};