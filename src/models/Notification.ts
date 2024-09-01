import { Schema, model, Document } from 'mongoose';

// Interface for the Notification document
interface INotification extends Document {
    userId: Schema.Types.ObjectId;
    message: string;
    seen: boolean;
    createdAt: Date;
}

// Define the Notification schema
const NotificationSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the Notification model
const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;
