const express = require('express');
const { body, validationResult } = require('express-validator'); // Import express-validator
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const AppError = require('../utils/AppError'); // Import custom AppError

const JWT_SECRET = 'your_secret_key'; // Replace with a strong secret in production

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return all validation errors
    }
    next();
};

// Login Route
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Find the user by email
            const user = await new Promise((resolve, reject) =>
                User.getByEmail(email, (err, user) => (err ? reject(err) : resolve(user)))
            );

            if (!user) {
                throw new AppError('User not found', 404); // Not Found
            }

            // Validate password
            const isMatch = await new Promise((resolve, reject) =>
                User.validatePassword(password, user.password, (err, isMatch) => (err ? reject(err) : resolve(isMatch)))
            );

            if (!isMatch) {
                throw new AppError('Invalid credentials', 401); // Unauthorized
            }

            // Generate a JWT
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } catch (err) {
            next(err); // Pass error to centralized error handler
        }
    }
);

// Token Verification Route
router.post(
    '/verify-token',
    [
        body('token').notEmpty().withMessage('Token is required').trim().escape(),
    ],
    handleValidationErrors, // Validate request before proceeding
    async (req, res, next) => {
        try {
            const { token } = req.body;

            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    throw new AppError('Invalid or expired token', 401); // Unauthorized
                }

                res.status(200).json({ message: 'Token is valid', user: decoded });
            });
        } catch (err) {
            next(err); // Pass error to centralized error handler
        }
    }
);

module.exports = router;
