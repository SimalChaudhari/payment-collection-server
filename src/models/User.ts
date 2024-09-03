import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: 'salesman' | 'customer' | 'admin';
  resetToken?: string; // Add this field for storing the reset token
  resetTokenExpiry?: Date; // Optional: Add an expiry field for the token
  createdAt: Date;
  
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['salesman', 'customer','admin'] },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }, // Optional: To handle token expiration
  createdAt: {
    type: Date,
    default: Date.now,
},
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
