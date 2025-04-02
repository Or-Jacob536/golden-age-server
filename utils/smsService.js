const axios = require('axios');

/**
 * Send SMS using a third-party SMS API
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS message content
 * @returns {Promise} - Promise that resolves when SMS is sent
 */
exports.sendSms = async (options) => {
  try {
    // Example SMS API integration (replace with your preferred SMS provider)
    const response = await axios.post(
      'https://api.sms-provider.com/send',
      {
        to: options.to,
        message: options.message,
        sender: process.env.SMS_SENDER_ID || 'Golden_Age'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send SMS');
  }
};