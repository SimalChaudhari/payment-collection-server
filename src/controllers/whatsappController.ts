import { Request, Response } from 'express';
import WhatsAppSetting from '../models/WhatsappSetting';

// Create WhatsApp Setting
export const createWhatsAppSetting = async (req: Request, res: Response) => {
    try {
        const { whatsapp_link, instance_id, access_token, is_active } = req.body;

        // Check if a setting with the same instance_id already exists
        const existingSetting = await WhatsAppSetting.findOne({ instance_id });
        if (existingSetting) {
            return res.status(400).json({ message: 'WhatsApp setting already exists for this instance ID' });
        }

        // Create a new WhatsApp setting
        const newSetting = new WhatsAppSetting({
            whatsapp_link,
            instance_id,
            access_token,
            is_active
        });

        // Save the new setting
        await newSetting.save();

        res.status(201).json({ message: 'WhatsApp setting created successfully', setting: newSetting });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Update WhatsApp Setting
// Update WhatsApp Setting
export const updateWhatsAppSettings = async (req: Request, res: Response) => {
    try {
        const { instance_id, access_token } = req.body; // New instance_id and access_token from the request body

        // Fetch the single WhatsApp setting (assuming there's only one)
        const setting = await WhatsAppSetting.findOne();
        if (!setting) {
            return res.status(404).json({ message: 'WhatsApp setting not found' });
        }

        // Extract the current whatsapp_link
        let whatsappLink = setting.whatsapp_link;

        // Replace instance_id and access_token in the link
        whatsappLink = whatsappLink
            .replace(/instance_id=[^&]+/, `instance_id=${instance_id}`)
            .replace(/access_token=[^&]+/, `access_token=${access_token}`);

        // Update the whatsapp_link field in the database
        setting.whatsapp_link = whatsappLink;

        // Optionally update instance_id and access_token fields directly if they exist in the schema
        setting.instance_id = instance_id;
        setting.access_token = access_token;

        // Save the updated settings
        await setting.save();

        res.status(200).json({ message: 'WhatsApp settings updated successfully', setting });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};



// Function to get all WhatsApp settings
export const getAllWhatsAppSettings = async (req: Request, res: Response) => {
    try {
        const setting = await WhatsAppSetting.findOne();
        if (!setting) {
            return res.status(404).json({ message: 'WhatsApp setting not found' });
        }

        res.status(200).json(setting);

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};