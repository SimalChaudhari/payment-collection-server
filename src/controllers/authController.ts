import { Request, Response } from 'express';
import { loginUser, sendPasswordResetEmail } from '../services/authService';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await loginUser(email, password);
        // Create a new object without the password field
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};


export const ResetPassword = async (req: Request, res: Response) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
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

        res.status(200).json({ message: 'Password successfully updated' });
    } catch (error) {
        console.log(error);
    }
}

export const RequestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET! as string, {
            expiresIn: '5m',
        });

        // Update the user with the reset token and its expiration time
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // Token valid for 5 minutes
        await user.save();

        await sendPasswordResetEmail(req.body.email, token);
        res.status(200).json({ message: 'Password reset instructions sent to your email' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const ResetNewPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET! as string);
        const user = await User.findOne({
            _id: decoded.userId,
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() } // Check if token is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined; // Clear the reset token
        user.resetTokenExpiry = undefined; // Clear the expiry
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });

    } catch (err: any) {
        if (err.name === 'JsonWebTokenError') {
            // Handle invalid token error
            return res.status(400).json({ message: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            // Handle expired token error
            return res.status(400).json({ message: 'Token has expired' });
        } else {
            // Handle other errors
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    }

};