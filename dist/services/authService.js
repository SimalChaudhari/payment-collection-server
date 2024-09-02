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
exports.sendEmail = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Register a new user (Salesman or Customer)
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = userData;
    // Check if email already exists
    const existingUser = yield User_1.default.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists');
    }
    // Hash the password before saving
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    userData.password = hashedPassword;
    const newUser = new User_1.default(Object.assign(Object.assign({}, userData), { role }));
    yield newUser.save();
    return newUser;
});
exports.registerUser = registerUser;
// Login a user (Salesman or Customer)
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user by email
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    // Compare the provided password with the stored hashed password
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    // Generate a token
    const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, 'your-secret-key', // Use an environment variable for the secret key
    { expiresIn: '30d' });
    return { token, user };
});
exports.loginUser = loginUser;
const sendEmail = (to, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a transporter object
    const transporter = nodemailer_1.default.createTransport({
        service: 'Gmail', // Use your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // Email options
    const mailOptions = {
        from: 'your-email@example.com',
        to,
        subject: 'Your New Account Password',
        text: `Your password is: ${password}. Please use this to log in.`,
    };
    // Send email
    yield transporter.sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
