import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


// Login a user (Salesman or Customer)
export const loginUser = async (mobile: string, password: string) => {
  // Find the user by email
  const user = await User.findOne({ mobile });
  if (!user) {
    throw new Error('Invalid mobile or password');
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);


  if (!isPasswordValid) {
    throw new Error('Invalid mobile or password');
  }

  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  // Generate a token
  const token = jwt.sign(
    { id: user._id, mobile: user.mobile, role: user.role },
    secret, // Use an environment variable for the secret key
    { expiresIn: '30d' }
  );

  return { token, user };
};




export const sendEmail = async (to: string, password: string) => {
  console.log(to,password)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',  // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your New Account Password',
    text: `Your password is: ${password}. Please use this to log in.`,
  };

  // Send email
  await transporter.sendMail(mailOptions);



};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',  // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const resetLink = `${process.env.LINK_URL}/change-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>Hello,</p>

<p>We received a request to reset your password. To proceed, please click the link below:</p>

<p><a href="${resetLink}">Reset Your Password</a></p>

<p>Please note that this link will expire in 5 minutes for security reasons. If you did not request a password reset, please ignore this email.</p>

<p>Thank you!</p>
`,
  };

  await transporter.sendMail(mailOptions);
};

