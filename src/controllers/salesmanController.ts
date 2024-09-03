import { Request, Response } from 'express';
import CollectedData from '../models/CollectedData';
import User from '../models/User';
// import { sendWhatsAppMessage } from '../utils/sendWhatsAppMessage';
import { sendWhatsAppMessage } from '../services/whatsappService';
import Notification from '../models/Notification';

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
        const verifyLink = process.env.LINK_URL as string;

        const newCollectedData = new CollectedData({
            amount,
            date,
            customerName: customer._id,  // Save only the customer ID
            salesman: salesman._id,
        });

        // Create a notification for the payment pending
        const notification = new Notification({
            userId: customer._id,
            message: `Payment of Rs.${amount} due on ${date}. Pending`,
            seen: false,
        });

        await notification.save();
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

        // Validate customerName to be a valid User (if necessary)
        const customer = await User.findById(customerName);
        if (!customer) {
            return res.status(400).json({ message: 'Invalid customer' });
        }

        // Update the fields with new values
        collectedData.amount = amount;
        collectedData.date = date;
        collectedData.customerName = customer._id; // Assuming you store customer ID or reference
        // You can add additional fields as necessary

        // Save the updated entry
        await collectedData.save();

        // Generate the updated notification message
        const notificationMessage = `Payment pending: ${amount} due on ${date}`;

        // Update the corresponding notification
        let notification = await Notification.findOne({ userId: customer._id });
        if (notification) {
            // Update existing notification
            notification.message = notificationMessage;
            notification.seen = false; // Mark as unseen
            notification.createdAt = new Date(); // Update the creation date to reflect the change
            await notification.save();
        } else {
            // If no existing notification, create a new one
            notification = new Notification({
                userId: customer._id,
                message: notificationMessage,
                type: 'payment_pending',
                seen: false,
            });
            await notification.save();
        }
        // Send WhatsApp message with the updated details
        const verifyLink = process.env.LINK_URL as string;
        await sendWhatsAppMessage(customer.name, customer.mobile, amount.toString(), date.toString(), verifyLink);

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
        const customerId = req.user;

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
        const { id } = req.params;
        const { status } = req.body; // Expecting 'Accepted' or 'Rejected'

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "Accepted" or "Rejected".' });
        }

        const collectedData = await CollectedData.findById(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'Collected data not found.' });
        }

        collectedData.customerVerify = status;
        if (status === 'Accepted' || status === 'Rejected') {
            collectedData.statusUpdatedAt = new Date(); // Set the date when status is updated
        }
        
        await collectedData.save();
        res.status(200).json({ message: `Status updated to ${status}`, collectedData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
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