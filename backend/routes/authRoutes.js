const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const JWT_SECRET = 'your_secret_key'; // Replace with a strong secret in production

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    User.getByEmail(email, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user', details: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate password
        User.validatePassword(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate a JWT
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        });
    });
});

// Token Verification Route
router.post('/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        res.status(200).json({ message: 'Token is valid', user: decoded });
    });
});

module.exports = router;
