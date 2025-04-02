const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const asyncHandler = require('../middleware/asyncHandler');
const { User, RefreshToken } = require('../models');
const { sendEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService');
const AppError = require('../utils/appError');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // Check if user exists
  const userExists = await User.findOne({
    where: {
      [Op.or]: [{ email }, { phoneNumber }]
    }
  });

  if (userExists) {
    throw new AppError('User already exists with this email or phone number', 400);
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password, // Will be hashed in the model's beforeSave hook
    phoneNumber,
    languagePreference: 'he' // Default to Hebrew
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  res.status(201).json({
    success: true,
    message: 'משתמש נרשם בהצלחה',
    userId: user.id,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Check if identifier is email or phone
  const isEmail = identifier.includes('@');
  
  // Find user
  const user = await User.findOne({
    where: isEmail ? { email: identifier } : { phoneNumber: identifier }
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'auth/invalid-credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'auth/invalid-credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Find the refresh token in the database
  const storedToken = await RefreshToken.findOne({
    where: { token: refreshToken, isRevoked: false }
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Verify the refresh token
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find the user
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Implement token rotation - revoke the old token
    await storedToken.update({ isRevoked: true });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    // Revoke the token if it's expired or invalid
    if (storedToken) {
      await storedToken.update({ isRevoked: true });
    }
    
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke the refresh token
    await RefreshToken.update(
      { isRevoked: true },
      { where: { token: refreshToken } }
    );
  }

  res.json({
    success: true,
    message: 'התנתקות בוצעה בהצלחה'
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  // Check if identifier is email or phone
  const isEmail = identifier.includes('@');
  
  // Find user
  const user = await User.findOne({
    where: isEmail ? { email: identifier } : { phoneNumber: identifier }
  });

  if (!user) {
    throw new AppError('User not found with this email or phone number', 404, 'auth/user-not-found');
  }

  // Generate password reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save reset token to user
  await user.update({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: Date.now() + 30 * 60 * 1000 // 30 minutes
  });

  // Send reset instructions based on identifier type
  if (isEmail) {
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'איפוס סיסמה לאפליקציית Golden Age',
      text: `
        שלום ${user.firstName},
        
        לאיפוס הסיסמה שלך, לחץ על הקישור הבא:
        ${process.env.CLIENT_URL}/reset-password/${resetToken}
        
        קישור זה יהיה בתוקף למשך 30 דקות.
        
        אם לא ביקשת לאפס את הסיסמה, אנא התעלם מהודעה זו.
        
        בברכה,
        צוות Golden Age
      `
    });
  } else {
    // Send SMS
    await sendSms({
      to: user.phoneNumber,
      message: `קוד האיפוס שלך לאפליקציית Golden Age: ${resetToken.substring(0, 6)}`
    });
  }

  res.json({
    success: true,
    message: 'הוראות לאיפוס סיסמה נשלחו'
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash the token
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    where: {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = newPassword; // Will be hashed in the model's beforeSave hook
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  // Revoke all refresh tokens for this user
  await RefreshToken.update(
    { isRevoked: true },
    { where: { userId: user.id } }
  );

  res.json({
    success: true,
    message: 'סיסמה שונתה בהצלחה'
  });
});

/**
 * Generate JWT tokens and store refresh token in database
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokens = async (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  // Store refresh token in database
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
    isRevoked: false
  });

  return { accessToken, refreshToken };
};
