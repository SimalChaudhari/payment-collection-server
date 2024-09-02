import { Request, Response } from 'express';
import Notification from '../models/Notification';  // Replace with your actual model import path

export const getSeenNotifications = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get the user ID from the route parameters

        // Validate that userId is provided
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Fetch all notifications for the user where seen is true
        const notifications = await Notification.find({ userId: id, seen: false });
        // Return the notifications
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching seen notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Controller function to mark a notification as seen
export const markNotificationAsSeen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get the notification ID from the route parameters

        // Validate that id is provided
        if (!id) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }

        // Update the notification where _id matches and seen is false to true
        const result = await Notification.updateOne(
            { _id: id, seen: false },
            { $set: { seen: true } }
        );
    


        // Return success message
        res.status(200).json({ message: 'Notification marked as seen' });
    } catch (error) {
        console.error('Error marking notification as seen:', error);
        res.status(500).json({ message: 'Server error' });
    }
};