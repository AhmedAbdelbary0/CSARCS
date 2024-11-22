const { createLogger, format, transports } = require('winston');

// Create a logger instance
const logger = createLogger({
    level: 'info', // Default logging level
    format: format.combine(
        format.timestamp(), // Add timestamps
        format.json()       // Output logs in JSON format
    ),
    transports: [
        // Log to a file
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Errors only
        new transports.File({ filename: 'logs/combined.log' })               // All logs
    ]
});

// If not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(), // Add colors to console logs
            format.simple()    // Simplify console logs
        )
    }));
}

module.exports = logger;
