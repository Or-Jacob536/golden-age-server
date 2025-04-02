const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
exports.sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password'
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Golden Age <no-reply@example.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  // Send email
  return await transporter.sendMail(mailOptions);
};

// File: server/utils/smsService.js
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
