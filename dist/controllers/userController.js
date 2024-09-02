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
exports.getCustomerVerifyCounts = exports.getCounts = exports.getUserById = exports.deleteUser = exports.updateUser = exports.createUser = exports.getAllUsersByRole = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const authService_1 = require("../services/authService");
const CollectedData_1 = __importDefault(require("../models/CollectedData"));
// Generate a random password
const generateRandomPassword = (length = 12) => {
    return (0, crypto_1.randomBytes)(length).toString('hex').slice(0, length);
};
const getAllUsersByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch users with the role 'customer'
        const customers = yield User_1.default.find({ role: 'customer' });
        // Fetch users with the role 'salesman'
        const salesman = yield User_1.default.find({ role: 'salesman' });
        // Check if both roles are found
        // if (customers.length === 0 && salesman.length === 0) {
        //     return res.status(404).json({ message: 'No customers or salesmen found' });
        // }
        res.status(200).json({
            customers,
            salesman
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUsersByRole = getAllUsersByRole;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, mobile, role } = req.body;
        // Validate role
        if (!['customer', 'salesman'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Generate and hash a random password
        const randomPassword = generateRandomPassword();
        const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10);
        // Create new user
        const newUser = new User_1.default({
            name,
            email,
            mobile,
            password: hashedPassword,
            role,
        });
        // Save user to the database
        yield newUser.save();
        // Send email with password
        yield (0, authService_1.sendEmail)(email, randomPassword);
        res.status(201).json({ message: 'User created successfully, password sent via email', user: newUser });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, mobile, role } = req.body;
        // Find the user by ID
        const user = yield User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the new email is provided and is different from the current email
        if (email && email !== user.email) {
            const existingUser = yield User_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            // Generate a new password if the email is changed
            const newPassword = generateRandomPassword();
            user.password = yield bcryptjs_1.default.hash(newPassword, 10);
            // Send the new password via email
            yield (0, authService_1.sendEmail)(email, newPassword);
            // Update the email field
            user.email = email;
        }
        // Update other user fields
        if (name)
            user.name = name;
        if (mobile)
            user.mobile = mobile;
        if (role)
            user.role = role;
        // Save the updated user
        yield user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find and delete the user by ID
        const user = yield User_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the user by ID
        const user = yield User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserById = getUserById;
const getCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Count the number of salesmen
        const salesmanCount = yield User_1.default.countDocuments({ role: 'salesman' });
        // Count the number of customers
        const customerCount = yield User_1.default.countDocuments({ role: 'customer' });
        // Sum the amounts in the CollectionData collection
        const totalAmountData = yield CollectedData_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCounts = getCounts;
const getCustomerVerifyCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerId = req.user; // Assuming req.user contains the logged-in customer's information
        // Validate customerId
        if (!customerId || !customerId._id) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }
        // Count the number of verified documents for the specific customer
        const customerVerifySuccessCount = yield CollectedData_1.default.countDocuments({
            customerName: customerId._id,
            customerVerify: "Accepted"
        });
        // Count the number of pending verification documents for the specific customer
        const customerVerifyRejectedCount = yield CollectedData_1.default.countDocuments({
            customerName: customerId._id,
            customerVerify: "Rejected"
        });
        const customerVerifyPendingCount = yield CollectedData_1.default.countDocuments({
            customerName: customerId._id,
            customerVerify: "Pending"
        });
        // Send the counts in the response
        res.status(200).json({
            customerVerifySuccessCount,
            customerVerifyRejectedCount,
            customerVerifyPendingCount
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCustomerVerifyCounts = getCustomerVerifyCounts;
