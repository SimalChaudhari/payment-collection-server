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


export const sendWhatsappCredential = async (
  email: string,
  password: string,
  mobile:string
) => {
  try {
    // Create the message
      // Create the WhatsApp message for new account credentials
   const message = `Welcome to our platform! 🎉\n\nHere are your account details:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information safe. You can log in to your account at any time using the credentials above. If you didn't request this account, please contact support immediately.`;
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