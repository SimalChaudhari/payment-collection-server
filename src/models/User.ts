import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: 'salesman' | 'customer' | 'admin';
  otp?: string; // Add this field for storing the reset token
  otpExpires?: Date; // Add this field
  createdAt: Date;
  address?: {
    city: string;
    areas: string;
  };
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, default: undefined },

  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['salesman', 'customer', 'admin'] },
  otp: { type: String },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  address: {
    city: { type: String },
    areas: { type: String }
  }
});


const User = mongoose.model<IUser>('User', userSchema);

export default User;
