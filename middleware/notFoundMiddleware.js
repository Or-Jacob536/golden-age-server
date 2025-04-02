// File: server/middleware/notFoundMiddleware.js
/**
 * Handle 404 errors for routes that don't exist
 */
exports.notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
      error: {
        code: 'NOT_FOUND',
        details: {}
      }
    });
  };
  