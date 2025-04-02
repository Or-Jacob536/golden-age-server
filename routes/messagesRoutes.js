const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/messages
 * @desc    Get user messages
 * @access  Private
 */
router.get('/', protect, messagesController.getMessages);

/**
 * @route   GET /api/messages/:messageId
 * @desc    Get message details
 * @access  Private
 */
router.get('/:messageId', protect, messagesController.getMessage);

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/', protect, messagesController.sendMessage);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:messageId/read', protect, messagesController.markAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', protect, messagesController.deleteMessage);

/**
 * @route   GET /api/messages/staff
 * @desc    Get list of staff members for messaging
 * @access  Private
 */
router.get('/staff', protect, messagesController.getStaffMembers);

module.exports = router;
