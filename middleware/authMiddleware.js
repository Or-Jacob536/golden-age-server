const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { User } = require('../models');
const AppError = require('../utils/appError');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token in the Authorization header
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists and has the Bearer format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }
  // Alternatively check if token is in cookies
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // If no token is found, return unauthorized error
  if (!token) {
    throw new AppError('Not authorized to access this route', 401, 'UNAUTHORIZED');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] } // Don't include password in the response
    });

    // If user not found
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401, 'UNAUTHORIZED');
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    } else {
      throw error; // Pass other errors to the error handler
    }
  }
});

/**
 * Middleware to restrict access to admin users only
 * Must be used after the protect middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not found in request', 500, 'INTERNAL_ERROR');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Not authorized to perform this action', 403, 'FORBIDDEN');
    }

    next();
  };
};
