import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;

// Initialize Twilio client
const client = twilio(accountSid, authToken);


// Function to send WhatsApp message
export const sendWhatsAppMessage = async (customerName: string, mobile: string, collectedAmount: string, date: string, verifyLink: string) => {
    const message = `
    Hi ${customerName},
    
    We've received your payment of ₹${collectedAmount} on ${date}.
    
    Please verify your transaction by clicking the button below:
    
    [Verify](${verifyLink})
    
    If you have any questions, reply to this message.
    
    Thank you
        `;
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER, // Twilio Sandbox WhatsApp number
            to: "+916351735093"
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
};
