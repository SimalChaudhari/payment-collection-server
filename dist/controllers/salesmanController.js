"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectedCountBySalesman = exports.verifyPayment = exports.getCustomerData = exports.getAllCollection = exports.getCollectedDataBySalesman = exports.deleteCollectedData = exports.updateCollectedData = exports.createCollectedData = void 0;
const CollectedData_1 = __importDefault(require("../models/CollectedData"));
const User_1 = __importDefault(require("../models/User"));
// import { sendWhatsAppMessage } from '../utils/sendWhatsAppMessage';
const whatsappService_1 = require("../services/whatsappService");
const Notification_1 = __importDefault(require("../models/Notification"));
const createCollectedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, date, customerName } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const salesman = req.user; // `req.user` should now be recognized as `IUser`
        // Validate customerName to be a valid User (if necessary)
        const customer = yield User_1.default.findById(customerName);
        if (!customer) {
            return res.status(400).json({ message: 'Invalid customer' });
        }
        // Generate a unique token for verification
        const verifyLink = process.env.LINK_URL;
        const newCollectedData = new CollectedData_1.default({
            amount,
            date,
            customerName: customer._id, // Save only the customer ID
            salesman: salesman._id,
        });
        // Create a notification for the payment pending
        const notification = new Notification_1.default({
            userId: customer._id,
            message: `Payment of Rs.${amount} due on ${date}. Pending`,
            seen: false,
        });
        yield notification.save();
        yield newCollectedData.save();
        // Send WhatsApp message
        yield (0, whatsappService_1.sendWhatsAppMessage)(customer.name, customer.mobile, amount.toString(), date.toString(), verifyLink);
        res.status(201).json(newCollectedData);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createCollectedData = createCollectedData;
const updateCollectedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get the ID of the data to update
        const { amount, date, customerName } = req.body;
        // Validate the input data
        if (!id || !amount || !date || !customerName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Find the collected data entry by ID
        const collectedData = yield CollectedData_1.default.findById(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'CollectedData not found' });
        }
        // Validate customerName to be a valid User (if necessary)
        const customer = yield User_1.default.findById(customerName);
        if (!customer) {
            return res.status(400).json({ message: 'Invalid customer' });
        }
        // Update the fields with new values
        collectedData.amount = amount;
        collectedData.date = date;
        collectedData.customerName = customer._id; // Assuming you store customer ID or reference
        // You can add additional fields as necessary
        // Save the updated entry
        yield collectedData.save();
        // Generate the updated notification message
        const notificationMessage = `Payment pending: ${amount} due on ${date}`;
        // Update the corresponding notification
        let notification = yield Notification_1.default.findOne({ userId: customer._id });
        if (notification) {
            // Update existing notification
            notification.message = notificationMessage;
            notification.seen = false; // Mark as unseen
            notification.createdAt = new Date(); // Update the creation date to reflect the change
            yield notification.save();
        }
        else {
            // If no existing notification, create a new one
            notification = new Notification_1.default({
                userId: customer._id,
                message: notificationMessage,
                type: 'payment_pending',
                seen: false,
            });
            yield notification.save();
        }
        // Send WhatsApp message with the updated details
        const verifyLink = process.env.LINK_URL;
        yield (0, whatsappService_1.sendWhatsAppMessage)(customer.name, customer.mobile, amount.toString(), date.toString(), verifyLink);
        res.status(200).json(collectedData);
    }
    catch (error) {
        console.error('Error updating collected data:', error);
        res.status(400).json({ message: error.message });
    }
});
exports.updateCollectedData = updateCollectedData;
const deleteCollectedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get the ID of the data to delete
        // Validate the ID
        if (!id) {
            return res.status(400).json({ message: 'Missing ID' });
        }
        // Find and delete the collected data entry by ID
        const collectedData = yield CollectedData_1.default.findByIdAndDelete(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'CollectedData not found' });
        }
        res.status(200).json({ message: 'CollectedData deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting collected data:', error);
        res.status(400).json({ message: error.message });
    }
});
exports.deleteCollectedData = deleteCollectedData;
const getCollectedDataBySalesman = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const salesman = req.user; // `req.user` should now be recognized as `IUser`
        const collectedData = yield CollectedData_1.default.find({ salesman: salesman._id })
            .populate('customerName', 'name') // Populate customerName with name field (optional)
            .populate('salesman', 'name'); // Populate salesman with name field (optional)
        ;
        res.status(200).json(collectedData);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getCollectedDataBySalesman = getCollectedDataBySalesman;
const getAllCollection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch all collected data where `customerVerify` is true
        const verifiedData = yield CollectedData_1.default.find()
            .populate('customerName', 'name') // Populate customerName with name field (optional)
            .populate('salesman', 'name'); // Populate salesman with name field (optional)
        if (!verifiedData.length) {
            return res.status(404).json({ message: 'No verified data found' });
        }
        res.status(200).json(verifiedData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllCollection = getAllCollection;
const getCustomerData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerId = req.user;
        // Validate customerId
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }
        // Fetch data for the specific customer
        const customerData = yield CollectedData_1.default.find({ customerName: customerId._id })
            .populate('customerName', 'name') // Populate customerName with name field (optional)
            .populate('salesman', 'name'); // Populate salesman with name field (optional)
        if (!customerData.length) {
            return res.status(404).json({ message: 'No data found for the specified customer' });
        }
        res.status(200).json(customerData);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCustomerData = getCustomerData;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting 'Accepted' or 'Rejected'
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "Accepted" or "Rejected".' });
        }
        const collectedData = yield CollectedData_1.default.findById(id);
        if (!collectedData) {
            return res.status(404).json({ message: 'Collected data not found.' });
        }
        collectedData.customerVerify = status;
        yield collectedData.save();
        res.status(200).json({ message: `Status updated to ${status}`, collectedData });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.verifyPayment = verifyPayment;
// Helper function to get total customer count
const getTotalCustomerCount = (salesmanId) => __awaiter(void 0, void 0, void 0, function* () {
    return CollectedData_1.default.distinct('customerName', { salesman: salesmanId }).countDocuments();
});
// Helper function to get total amount collected
const getTotalAmountCollected = (salesmanId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield CollectedData_1.default.aggregate([
        { $match: { salesman: salesmanId } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalAmount) || 0;
});
const getCollectedCountBySalesman = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const salesman = req.user; // `req.user` should now be recognized as `IUser`
        // Get total customer count and total amount collected
        const [customerCount, totalAmount] = yield Promise.all([
            getTotalCustomerCount(salesman._id),
            getTotalAmountCollected(salesman._id)
        ]);
        // Respond with the collected data, total customer count, and total amount
        res.status(200).json({
            customerCount,
            totalAmount
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getCollectedCountBySalesman = getCollectedCountBySalesman;
