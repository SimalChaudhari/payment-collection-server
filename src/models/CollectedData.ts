import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';  // Assuming you have a User model as defined previously

export interface ICollectedData extends Document {
    amount: number;
    date: Date;
    customerName: IUser['_id'];
    salesman: IUser['_id']; // Reference to the salesman who entered the data
    customerVerify: 'Accepted' | 'Rejected' | 'Pending';
    createdAt: Date;
    statusUpdatedAt?: Date; // Optional field for the date when the status was updated
    reason?: string | null; // Allow null as well as string and undefined
}

const collectDataSchema: Schema = new Schema({
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    customerName: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User (salesman)
    salesman: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User (salesman)
    customerVerify: { type: String, required: true, enum: ['Accepted', 'Rejected', 'Pending'], default: 'Pending' },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    statusUpdatedAt: {
        type: Date,
        default: null, // Set default to null if no update has occurred
    },
    reason: {
        type: String,
        default: null, // Optional field with a default value of null
    },
});

const CollectedData = mongoose.model<ICollectedData>('CollectedData', collectDataSchema);

export default CollectedData;
