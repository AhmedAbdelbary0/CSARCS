const logger = require('../utils/logger'); // Assuming you implemented the logger

const errorHandler = (err, req, res, next) => {
    // Log error details using Winston logger
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
        stack: err.stack
    });

    // Set a default status code if none is provided
    const statusCode = err.statusCode || 500;

    // Send a JSON error response
    res.status(statusCode).json({
        error: true,
        message: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'production' ? null : err.stack // Only include stack trace in development
    });
};

module.exports = errorHandler;
