import axios from 'axios';
import WhatsAppSetting from '../models/WhatsappSetting';

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

    // Fetch instance_id and access_token from the database
    const setting = await WhatsAppSetting.findOne({ is_active: true });
    if (!setting) {
      throw new Error('WhatsApp API settings not found');
    }


    // Construct the API URL using the fetched instance_id and access_token
    const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=${setting.instance_id}&access_token=${setting.access_token}`;


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
  password: string,
  mobile: string
) => {
  try {
    // Create the message
    // Create the WhatsApp message for new account credentials
    const message = `Welcome to our platform! 🎉\n\nHere are your account details:\n\nPassword: ${password}\n\nPlease keep this information safe. You can log in to your account at any time using the credentials above. If you didn't request this account, please contact support immediately.`;
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Fetch instance_id and access_token from the database
    const setting = await WhatsAppSetting.findOne({ is_active: true });
    if (!setting) {
      throw new Error('WhatsApp API settings not found');
    }
    // Construct the API URL using the fetched instance_id and access_token
    const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=${setting.instance_id}&access_token=${setting.access_token}`;
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

export const sendOTP = async (mobile: string, token: string) => {
  try {
    // Create the OTP message
    const message = `Your OTP code is ${token}.If you didn't request this, please ignore this message.`;
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Fetch instance_id and access_token from the database
    const setting = await WhatsAppSetting.findOne({ is_active: true });
    if (!setting) {
      throw new Error('WhatsApp API settings not found');
    }

    // Construct the API URL using the fetched instance_id and access_token
    const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=${setting.instance_id}&access_token=${setting.access_token}`;

    // Send the WhatsApp message via the API
    const response = await axios.get(apiUrl);

    // Log the response for debugging purposes
    console.log('WhatsApp OTP sent:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    throw new Error('Failed to send WhatsApp OTP');
  }
};

export const sendSuccessOTP = async (name: string, mobile: string) => {
  try {
    // Create the success message with formatting
    const message = `
*✅ Password Change Success!*

Hi ${name},

Your password has been successfully changed. If you did not request this change, please contact our support team immediately.

🔐 If you need further assistance, feel free to reach out to us.

Thank you for using our service!
`;
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    // Fetch the WhatsApp API settings from the database
    const setting = await WhatsAppSetting.findOne({ is_active: true });
    if (!setting) {
      throw new Error('WhatsApp API settings not found');
    }
    // Construct the API URL using the fetched instance_id and access_token
    const apiUrl = `https://wp.smartwebsolution.in/api/send?number=91${mobile}&type=text&message=${encodedMessage}&instance_id=${setting.instance_id}&access_token=${setting.access_token}`;
    // Send the WhatsApp message via the API
    const response = await axios.get(apiUrl);
    // Log the response for debugging purposes
    console.log('WhatsApp password change notification sent:', response.data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to send password change notification. Please ensure your WhatsApp API settings are correct and try again.');
  }
};