import { Request, Response } from 'express';
import { loginUser } from '../services/authService';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTP, sendSuccessOTP } from '../services/whatsappService';

// Helper function to generate OTP
const generateOTP = (): string => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const login = async (req: Request, res: Response) => {
    try {
        const { mobile, password } = req.body;
        const { token, user } = await loginUser(mobile, password);
        // Create a new object without the password field
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};


export const ResetPassword = async (req: Request, res: Response) => {
    const { mobile, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the current password with the stored password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        sendSuccessOTP(user.name, user.mobile)

        res.status(200).json({ message: 'Password successfully updated' });
    } catch (error) {
        console.log(error);
    }
}

export const RequestPasswordReset = async (req: Request, res: Response) => {
    const { mobile } = req.body;

    try {
        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = generateOTP(); // Implement your OTP generation function
        user.otp = otp;
        await user.save();
        await sendOTP(mobile, otp); // Send OTP via WhatsApp
        res.status(200).json({ message: 'OTP sent to your Mobile' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const VerifyOtp = async (req: Request, res: Response) => {
    const { otp } = req.body;

    try {
        const user = await User.findOne({
            otp: otp
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        res.status(200).json({ otp: user.otp, message: 'Otp verified successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

};

export const ResetNewPassword = async (req: Request, res: Response) => {
    const { otp, newPassword } = req.body;

    try {
        const user = await User.findOne({
            otp: otp
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined; // Clear the reset token
        await user.save();
        sendSuccessOTP(user.name, user.mobile)
        res.status(200).json({ message: 'Password reset successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

};