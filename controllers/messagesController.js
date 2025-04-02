// File: server/controllers/messagesController.js
const { Op } = require('sequelize');
const asyncHandler = require('../middleware/asyncHandler');
const { Message, User } = require('../models');
const AppError = require('../utils/appError');

/**
 * @desc    Get user messages
 * @route   GET /api/messages
 * @access  Private
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get messages where user is sender or recipient
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId },
        { recipientId: userId }
      ]
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'role']
      },
      {
        model: User,
        as: 'recipient',
        attributes: ['id', 'firstName', 'lastName', 'role']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    count: messages.length,
    messages
  });
});

/**
 * @desc    Get message details
 * @route   GET /api/messages/:messageId
 * @access  Private
 */
exports.getMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  // Get message
  const message = await Message.findOne({
    where: {
      id: messageId,
      [Op.or]: [
        { senderId: userId },
        { recipientId: userId }
      ]
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'role']
      },
      {
        model: User,
        as: 'recipient',
        attributes: ['id', 'firstName', 'lastName', 'role']
      }
    ]
  });

  if (!message) {
    throw new AppError('Message not found', 404, 'NOT_FOUND');
  }

  // If user is recipient and message is unread, mark as read
  if (message.recipientId === userId && !message.read) {
    message.read = true;
    message.readAt = new Date();
    await message.save();
  }

  res.json(message);
});

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, subject, content } = req.body;
  const senderId = req.user.id;

  // Validate request
  if (!recipientId) {
    throw new AppError('Recipient is required', 400, 'VALIDATION_ERROR');
  }

  if (!content) {
    throw new AppError('Message content is required', 400, 'VALIDATION_ERROR');
  }

  // Check if recipient exists
  const recipient = await User.findByPk(recipientId);

  if (!recipient) {
    throw new AppError('Recipient not found', 404, 'NOT_FOUND');
  }

  // Create message
  const message = await Message.create({
    senderId,
    recipientId,
    subject: subject || '',
    content,
    read: false
  });

  res.status(201).json({
    success: true,
    message: 'הודעה נשלחה בהצלחה',
    messageId: message.id
  });
});

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:messageId/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  // Get message
  const message = await Message.findOne({
    where: {
      id: messageId,
      recipientId: userId
    }
  });

  if (!message) {
    throw new AppError('Message not found', 404, 'NOT_FOUND');
  }

  // Mark as read
  message.read = true;
  message.readAt = new Date();
  await message.save();

  res.json({
    success: true,
    message: 'הודעה סומנה כנקראה'
  });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  // Get message
  const message = await Message.findOne({
    where: {
      id: messageId,
      [Op.or]: [
        { senderId: userId },
        { recipientId: userId }
      ]
    }
  });

  if (!message) {
    throw new AppError('Message not found', 404, 'NOT_FOUND');
  }

  // Delete message
  await message.destroy();

  res.json({
    success: true,
    message: 'הודעה נמחקה בהצלחה'
  });
});

/**
 * @desc    Get list of staff members for messaging
 * @route   GET /api/messages/staff
 * @access  Private
 */
exports.getStaffMembers = asyncHandler(async (req, res) => {
  // Get staff members
  const staffMembers = await User.findAll({
    where: {
      role: {
        [Op.in]: ['staff', 'admin']
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'role']
  });

  res.json(staffMembers);
});
