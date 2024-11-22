const express = require('express');
const { param, body, validationResult } = require('express-validator'); // Import express-validator
const router = express.Router();
const Notification = require('../models/notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const AppError = require('../utils/AppError'); // Import custom AppError

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }
    next();
};

// Route to fetch all notifications
router.get(
    '/',
    authenticateToken,
    async (req, res, next) => {
        try {
            const notifications = await new Promise((resolve, reject) =>
                Notification.getAll((err, notifications) => (err ? reject(err) : resolve(notifications)))
            );
            res.status(200).json(notifications);
        } catch (err) {
            next(err); // Pass the error to the centralized error handler
        }
    }
);

// Route to fetch notifications for a specific user
router.get(
    '/user/:user_id',
    authenticateToken,
    [
        param('user_id').isInt().withMessage('User ID must be an integer').toInt(),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const userId = req.params.user_id;

            const notifications = await new Promise((resolve, reject) =>
                Notification.getByUserId(userId, (err, notifications) => (err ? reject(err) : resolve(notifications)))
            );

            if (notifications.length === 0) {
                throw new AppError('No notifications found for this user', 404); // Not Found
            }

            res.status(200).json(notifications);
        } catch (err) {
            next(err); // Pass the error to the centralized error handler
        }
    }
);

// Route to create a notification
router.post(
    '/',
    authenticateToken,
    [
        body('user_id').isInt().withMessage('User ID must be an integer').toInt(),
        body('message').isString().withMessage('Message must be a string').trim().notEmpty().withMessage('Message cannot be empty'),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const { user_id, message } = req.body;

            const notificationId = await new Promise((resolve, reject) =>
                Notification.create(user_id, message, (err, id) => (err ? reject(err) : resolve(id)))
            );

            res.status(201).json({ message: 'Notification created successfully', id: notificationId });
        } catch (err) {
            next(err); // Pass the error to the centralized error handler
        }
    }
);

module.exports = router;
