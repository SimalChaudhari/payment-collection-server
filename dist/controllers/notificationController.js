"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsSeen = exports.getSeenNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification")); // Replace with your actual model import path
const getSeenNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get the user ID from the route parameters
        // Validate that userId is provided
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Fetch all notifications for the user where seen is true
        const notifications = yield Notification_1.default.find({ userId: id, seen: false });
        // Return the notifications
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error('Error fetching seen notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getSeenNotifications = getSeenNotifications;
// Controller function to mark a notification as seen
const markNotificationAsSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Get the notification ID from the route parameters
        // Validate that id is provided
        if (!id) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }
        // Update the notification where _id matches and seen is false to true
        const result = yield Notification_1.default.updateOne({ _id: id, seen: false }, { $set: { seen: true } });
        // Return success message
        res.status(200).json({ message: 'Notification marked as seen' });
    }
    catch (error) {
        console.error('Error marking notification as seen:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markNotificationAsSeen = markNotificationAsSeen;
