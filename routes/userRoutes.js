const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, userController.updateUserProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', protect, userController.updatePassword);

/**
 * @route   PUT /api/users/settings
 * @desc    Update user settings (language, dark mode, etc.)
 * @access  Private
 */
router.put('/settings', protect, userController.updateSettings);

module.exports = router;
