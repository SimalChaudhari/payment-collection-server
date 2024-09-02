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
exports.sendWhatsAppMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const sendWhatsAppMessage = (name, mobile, amount, date, verifyLink) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create the message
        const message = `Hello ${name}, your payment of ₹${amount} on ${date} is recorded. Please verify your payment by logging into your account using the link below:\n${verifyLink}`;
        // URL encode the message
        const encodedMessage = encodeURIComponent(message);
        // Construct the API URL
        const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=66D196BC5F5EF&access_token=66d1968a854f8`;
        // Send the WhatsApp message via the API
        const response = yield axios_1.default.get(apiUrl);
        // Log the response for debugging purposes
        console.log('WhatsApp message sent:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error('Failed to send WhatsApp message');
    }
});
exports.sendWhatsAppMessage = sendWhatsAppMessage;
