import { Request, Response } from 'express';
import { loginUser } from '../services/authService';
import User from '../models/User';
import bcrypt from 'bcryptjs';
// Controller for registering a user (Salesman or Customer)

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


export const ResetPassword =  async (req: Request, res: Response) => {
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