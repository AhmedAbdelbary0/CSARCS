const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user'); // Import the User model
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to fetch all users
router.get('/', async (req, res) => {
    try {
        User.getAll((err, users) => {
            if (err) throw err;
            res.status(200).json(users);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users', details: error.message });
    }
});

// Route to register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate inputs
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        User.create(username, email, hashedPassword, role, (err, id) => {
            if (err) {
                return res.status(500).json({ error: 'Error creating user', details: err.message });
            }
            res.status(201).json({ message: 'User created successfully', id });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
});

// Route to fetch a specific user by ID
router.get('/:id',authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        User.getById(userId, (err, user) => {
            if (err) throw err;
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
});

// Route to delete a user by ID
router.delete('/:id',authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        User.deleteById(userId, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error deleting user', details: err.message });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
});

module.exports = router;
