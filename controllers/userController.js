// File: server/controllers/userController.js
const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const { User } = require('../models');
const AppError = require('../utils/appError');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  res.json(user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;

  // Find user
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  // Save updates
  await user.save();

  // Return updated user (excluding password)
  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  res.json({
    success: true,
    message: 'פרופיל עודכן בהצלחה',
    user: updatedUser
  });
});

/**
 * @desc    Update user password
 * @route   PUT /api/users/password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate request
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400, 'VALIDATION_ERROR');
  }

  // Find user
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Check if current password is correct
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400, 'VALIDATION_ERROR');
  }

  // Update password
  user.password = newPassword; // Password will be hashed in the model's beforeSave hook
  await user.save();

  res.json({
    success: true,
    message: 'סיסמה עודכנה בהצלחה'
  });
});

/**
 * @desc    Update user settings
 * @route   PUT /api/users/settings
 * @access  Private
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  const { languagePreference, darkMode, fontSize } = req.body;

  // Find user
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Update settings
  if (languagePreference && ['he', 'en'].includes(languagePreference)) {
    user.languagePreference = languagePreference;
  }
  
  if (darkMode !== undefined) {
    user.darkMode = darkMode;
  }
  
  if (fontSize && ['small', 'medium', 'large', 'extraLarge'].includes(fontSize)) {
    user.fontSize = fontSize;
  }

  // Save updates
  await user.save();

  // Prepare response message based on language preference
  const message = languagePreference === 'en' 
    ? 'Settings updated successfully' 
    : 'הגדרות עודכנו בהצלחה';

  res.json({
    success: true,
    message,
    settings: {
      languagePreference: user.languagePreference,
      darkMode: user.darkMode,
      fontSize: user.fontSize
    }
  });
});
