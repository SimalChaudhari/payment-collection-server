import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
    city: string;
    areas: string[]; // Multiple areas within the city
    createdAt: Date;
}

const addressSchema: Schema = new Schema({
    city: { type: String, required: true }, // City field as a string
    areas: { type: [String], required: true }, // Area as an array of strings
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Address = mongoose.model<IAddress>('Address', addressSchema);

export default Address;
