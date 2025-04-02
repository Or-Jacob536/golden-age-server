// File: server/middleware/errorMiddleware.js
const AppError = require('../utils/appError');

/**
 * Handle errors in development environment with detailed information
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || {},
      stack: err.stack
    }
  });
};

/**
 * Handle errors in production environment with limited information
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        details: err.details || {}
      }
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: {
        code: 'INTERNAL_ERROR',
        details: {}
      }
    });
  }
};

/**
 * Handle known specific errors
 */
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401, 'UNAUTHORIZED');

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const handleSequelizeUniqueConstraintError = (err) => {
  const fields = Object.keys(err.fields || {}).join(', ');
  return new AppError(
    `Duplicate field value: ${fields}. Please use another value.`,
    400,
    'VALIDATION_ERROR',
    { fields: err.fields }
  );
};

const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(e => e.message).join('; ');
  return new AppError(
    `Invalid input data: ${errors}`,
    400,
    'VALIDATION_ERROR',
    { fields: err.errors.reduce((acc, curr) => {
      acc[curr.path] = curr.message;
      return acc;
    }, {}) }
  );
};

/**
 * Global error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.isOperational = err.isOperational;
    error.code = err.code;
    error.details = err.details;

    // Handle specific errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(err);
    if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);

    sendErrorProd(error, res);
  }
};
