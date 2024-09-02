import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: 'salesman' | 'customer' | 'admin';
  createdAt: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['salesman', 'customer','admin'] },
  createdAt: {
    type: Date,
    default: Date.now,
},
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
