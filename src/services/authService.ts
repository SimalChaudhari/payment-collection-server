import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Register a new user (Salesman or Customer)
export const registerUser = async (userData: IUser) => {
  const { email, password, role } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  userData.password = hashedPassword;

  const newUser = new User({ ...userData, role });
  await newUser.save();
  return newUser;
};

// Login a user (Salesman or Customer)
export const loginUser = async (email: string, password: string) => {
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);


  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  // Generate a token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    'your-secret-key', // Use an environment variable for the secret key
    { expiresIn: '30d' }
  );

  return { token, user };
};



export const sendEmail = async (to: string, password: string) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'Gmail',  // Use your email service
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
    await transporter.sendMail(mailOptions);
};

