const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const Task = require('../models/task');
const Notification = require('../models/notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const AppError = require('../utils/AppError'); // Import custom AppError

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Route to fetch all tasks
router.get(
    '/',
    authenticateToken,
    roleMiddleware(['senior']),
    async (req, res, next) => {
        try {
            const tasks = await new Promise((resolve, reject) =>
                Task.getAll((err, tasks) => (err ? reject(err) : resolve(tasks)))
            );
            res.status(200).json(tasks);
        } catch (err) {
            next(err);
        }
    }
);

// Route to create a new task
router.post(
    '/',
    authenticateToken,
    roleMiddleware(['junior']),
    [
        body('title').isString().trim().notEmpty().withMessage('Title is required'),
        body('status').isIn(['open', 'in_progress', 'completed']).withMessage('Invalid status'),
        body('request_id').isInt().withMessage('Request ID must be an integer'),
    ],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { title, description, status, request_id } = req.body;

            const taskId = await new Promise((resolve, reject) =>
                Task.create(title, description, status, request_id, null, (err, id) => (err ? reject(err) : resolve(id)))
            );

            // Notify senior users
            const message = `A new task titled "${title}" has been created.`;
            Notification.create(request_id, message, (err) => {
                if (err) console.error('Error creating notification:', err.message);
            });

            res.status(201).json({ message: 'Task created successfully', id: taskId });
        } catch (err) {
            next(err);
        }
    }
);

// Route to fetch a task by ID
router.get(
    '/:id',
    authenticateToken,
    [param('id').isInt().withMessage('Task ID must be an integer')],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const taskId = req.params.id;

            const task = await new Promise((resolve, reject) =>
                Task.findById(taskId, (err, task) => (err ? reject(err) : resolve(task)))
            );

            if (!task) {
                throw new AppError('Task not found', 404);
            }

            res.status(200).json(task);
        } catch (err) {
            next(err);
        }
    }
);

// Route to update the status of a task
router.put(
    '/:id/status',
    authenticateToken,
    [
        param('id').isInt().withMessage('Task ID must be an integer'),
        body('status').isIn(['open', 'in_progress', 'completed']).withMessage('Invalid status'),
    ],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const taskId = req.params.id;
            const { status } = req.body;

            const changes = await new Promise((resolve, reject) =>
                Task.updateStatus(taskId, status, (err, changes) => (err ? reject(err) : resolve(changes)))
            );

            if (changes === 0) {
                throw new AppError('Task not found or no changes made', 404);
            }

            res.status(200).json({ message: 'Task status updated successfully' });
        } catch (err) {
            next(err);
        }
    }
);

// Route to approve a task
router.patch(
    '/:id/approve',
    authenticateToken,
    roleMiddleware(['faculty']),
    [param('id').isInt().withMessage('Task ID must be an integer')],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const taskId = req.params.id;

            await new Promise((resolve, reject) =>
                Task.approve(taskId, (err) => (err ? reject(err) : resolve()))
            );

            // Notify junior and senior users
            const message = `Task ID ${taskId} has been approved.`;
            Notification.create(taskId, message, (err) => {
                if (err) console.error('Error creating notification:', err.message);
            });

            res.status(200).json({ message: 'Task approved successfully' });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
