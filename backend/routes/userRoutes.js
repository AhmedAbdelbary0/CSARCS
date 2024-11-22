const express = require('express');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const AppError = require('../utils/AppError');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Route to fetch all users
router.get(
    '/',
    authenticateToken,
    roleMiddleware(['admin']),
    async (req, res, next) => {
        try {
            const users = await new Promise((resolve, reject) =>
                User.getAll((err, users) => (err ? reject(err) : resolve(users)))
            );
            res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    }
);

// Route to register a new user
router.post(
    '/register',
    [
        body('username').isString().trim().notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('role')
            .isIn(['admin', 'junior', 'senior', 'faculty'])
            .withMessage('Invalid role'),
    ],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { username, email, password, role } = req.body;

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Save the user to the database
            const userId = await new Promise((resolve, reject) =>
                User.create(username, email, hashedPassword, role, (err, id) => (err ? reject(err) : resolve(id)))
            );

            res.status(201).json({ message: 'User created successfully', id: userId });
        } catch (err) {
            next(err);
        }
    }
);

// Route to fetch a specific user by ID
router.get(
    '/:id',
    authenticateToken,
    [param('id').isInt().withMessage('User ID must be an integer')],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const userId = req.params.id;

            const user = await new Promise((resolve, reject) =>
                User.getById(userId, (err, user) => (err ? reject(err) : resolve(user)))
            );

            if (!user) {
                throw new AppError('User not found', 404);
            }

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }
);

// Route to delete a user by ID
router.delete(
    '/:id',
    authenticateToken,
    roleMiddleware(['admin']),
    [param('id').isInt().withMessage('User ID must be an integer')],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const userId = req.params.id;

            await new Promise((resolve, reject) =>
                User.deleteById(userId, (err) => (err ? reject(err) : resolve()))
            );
            
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
