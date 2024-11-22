const express = require('express');
const { param, body, validationResult } = require('express-validator'); // Import express-validator
const router = express.Router();
const Feedback = require('../models/feedback');
const { authenticateToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Notification = require('../models/notification');
const AppError = require('../utils/AppError'); // Import custom AppError

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }
    next();
};

// Route to fetch all feedback
router.get(
    '/',
    authenticateToken,
    roleMiddleware(['faculty']),
    async (req, res, next) => {
        try {
            const feedbacks = await new Promise((resolve, reject) =>
                Feedback.getAll((err, feedbacks) => (err ? reject(err) : resolve(feedbacks)))
            );
            res.status(200).json(feedbacks);
        } catch (err) {
            next(err); // Pass to centralized error handler
        }
    }
);

// Route to create new feedback
router.post(
    '/',
    authenticateToken,
    roleMiddleware(['junior']),
    [
        body('task_id').isInt().withMessage('Task ID must be an integer').toInt(),
        body('rating')
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be a number between 1 and 5')
            .toInt(),
        body('comments').optional().trim().escape(),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const { task_id, rating, comments } = req.body;

            // Create feedback
            const feedbackId = await new Promise((resolve, reject) =>
                Feedback.create(task_id, req.user.id, rating, comments, (err, id) => (err ? reject(err) : resolve(id)))
            );

            // Notify the senior user who handled the task
            const message = `Feedback has been submitted for Task ID ${task_id}.`;
            Notification.create(task_id, message, (err) => {
                if (err) {
                    console.error('Error creating notification:', err.message); // Log notification errors
                }
            });

            res.status(201).json({ message: 'Feedback submitted successfully', id: feedbackId });
        } catch (err) {
            next(err); // Pass to centralized error handler
        }
    }
);

// Route to fetch feedback for a specific task
router.get(
    '/task/:task_id',
    authenticateToken,
    roleMiddleware(['faculty']),
    [
        param('task_id').isInt().withMessage('Task ID must be an integer').toInt(),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const taskId = req.params.task_id;

            const feedbacks = await new Promise((resolve, reject) =>
                Feedback.getByTaskId(taskId, (err, feedbacks) => (err ? reject(err) : resolve(feedbacks)))
            );

            if (feedbacks.length === 0) {
                throw new AppError('No feedback found for this task', 404);
            }

            res.status(200).json(feedbacks);
        } catch (err) {
            next(err); // Pass to centralized error handler
        }
    }
);

// Route to fetch feedback for a specific user
router.get(
    '/user/:user_id',
    authenticateToken,
    roleMiddleware(['faculty']),
    [
        param('user_id').isInt().withMessage('User ID must be an integer').toInt(),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const userId = req.params.user_id;

            const feedbacks = await new Promise((resolve, reject) =>
                Feedback.getByUserId(userId, (err, feedbacks) => (err ? reject(err) : resolve(feedbacks)))
            );

            if (feedbacks.length === 0) {
                throw new AppError('No feedback found for this user', 404);
            }

            res.status(200).json(feedbacks);
        } catch (err) {
            next(err); // Pass to centralized error handler
        }
    }
);

module.exports = router;
