import { Schema, model, Document } from 'mongoose';

// Interface for the WhatsAppSetting document
interface IWhatsAppSetting extends Document {
    whatsapp_link: string;
    instance_id: string;
    access_token: string;
    is_active: boolean;
}

// Define the WhatsAppSetting schema
const WhatsAppSettingSchema: Schema = new Schema({
    whatsapp_link: {
        type: String,
        required: true,
    },
    instance_id: {
        type: String,
        required: true,
    },
    access_token: {
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true, // Default value set to true (active)
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Create the WhatsAppSetting model
const WhatsAppSetting = model<IWhatsAppSetting>('WhatsAppSetting', WhatsAppSettingSchema);

export default WhatsAppSetting;
