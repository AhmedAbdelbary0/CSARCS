const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback'); // Import the Feedback model
const { authenticateToken } = require('../middleware/authMiddleware'); // Import the authenticateToken middleware


// Route to fetch all feedback
router.get('/', authenticateToken, (req,res) => {
    Feedback.getAll((err, feedbacks) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching feedback', details: err.message });
        } else {
            res.status(200).json(feedbacks);
        }
    });
});

// Route to create new feedback
router.post('/', authenticateToken, (req, res) => {
    const { task_id, user_id, rating, comments } = req.body;

    // Validate inputs
    if (!task_id || !user_id || !rating) {
        return res.status(400).json({ error: 'task_id, user_id, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    Feedback.create(task_id, user_id, rating, comments, (err, id) => {
        if (err) {
            res.status(500).json({ error: 'Error creating feedback', details: err.message });
        } else {
            res.status(201).json({ message: 'Feedback created successfully', id });
        }
    });
});

// Route to fetch feedback for a specific task
router.get('/task/:task_id',authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.task_id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    Feedback.getByTaskId(taskId, (err, feedbacks) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching feedback', details: err.message });
        } else if (feedbacks.length === 0) {
            res.status(404).json({ error: 'No feedback found for this task' });
        } else {
            res.status(200).json(feedbacks);
        }
    });
});

module.exports = router;
