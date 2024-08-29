import { StringExpression } from 'mongoose';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

// Initialize WhatsApp client with options
const client = new Client({
  authStrategy: new LocalAuth() // This allows the client to use local authentication
});

// Event listener for QR code generation
client.on('qr', (qr: string) => {
  qrcode.generate(qr, { small: true }); // Generate and display the QR code in the terminal
  console.log('Scan the QR code above to log in to WhatsApp');
});

// Event listener for client readiness
client.on('ready', () => {
  console.log('Client is ready!');
});

// Handle authentication failures
client.on('auth_failure', (message) => {
    console.error('Authentication failure:', message);
});

// Handle client disconnection
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

// Initialize WhatsApp client
client.initialize();

// Function to send a WhatsApp message
export const sendWhatsAppMessage = async (customerPhoneNumber: string, customerName: StringExpression) => {
  try {
    // Ensure the client is ready before sending a message
    if (!client.info || !client.info.wid) {
      throw new Error('WhatsApp client is not ready.');
    }

    // Format the phone number
    const formattedPhoneNumber = `${customerPhoneNumber}@c.us`;

    console.log("🚀 ~ sendWhatsAppMessage ~ formattedPhoneNumber:", formattedPhoneNumber)
    // Format the message
    const message = `Hi ${customerName}, please verify the payment of amount.`;

    // Send the message
    await client.sendMessage(formattedPhoneNumber, message);

    console.log({ message: `Message sent to ${formattedPhoneNumber}: ${message}` });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
};
