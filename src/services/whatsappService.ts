import axios from 'axios';

export const sendWhatsAppMessage = async (
  name: string, 
  mobile: string, 
  amount: string, 
  date: string, 
  verifyLink: string 
) => {
  try {
    // Create the message
    const message = `Hello ${name}, your payment of ₹${amount} on ${date} is recorded. Please verify your payment by logging into your account using the link below:\n${verifyLink}`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Construct the API URL
    const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=${process.env.INSTANCE_ID}&access_token=${process.env.ACCESS_TOKEN}`;
    // Send the WhatsApp message via the API
    const response = await axios.get(apiUrl);
    // Log the response for debugging purposes
    console.log('WhatsApp message sent:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error('Failed to send WhatsApp message');
  }
};
