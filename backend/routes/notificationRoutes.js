const express = require('express');
const router = express.Router();
const Notification = require('../models/notification'); // Import the Notification model
const { authenticateToken } = require('../middleware/authMiddleware'); // Import the authenticateToken middleware

// Route to fetch all notifications
router.get('/', (req, res) => {
    Notification.getAll((err, notifications) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching notifications', details: err.message });
        } else {
            res.status(200).json(notifications);
        }
    });
});

// Route to fetch notifications for a specific user
router.get('/user/:user_id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.user_id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    Notification.getByUserId(userId, (err, notifications) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching notifications', details: err.message });
        } else if (notifications.length === 0) {
            res.status(404).json({ error: 'No notifications found for this user' });
        } else {
            res.status(200).json(notifications);
        }
    });
});

// Route to create a notification
router.post('/', authenticateToken, (req, res) => {
    const { user_id, message } = req.body;

    // Validate inputs
    if (!user_id || !message) {
        return res.status(400).json({ error: 'user_id and message are required' });
    }

    Notification.create(user_id, message, (err, id) => {
        if (err) {
            res.status(500).json({ error: 'Error creating notification', details: err.message });
        } else {
            res.status(201).json({ message: 'Notification created successfully', id });
        }
    });
});

module.exports = router;
