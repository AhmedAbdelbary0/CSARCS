const express = require('express');
const router = express.Router();
const Task = require('../models/task'); // Import the Task model
const { authenticateToken } = require('../middleware/authMiddleware'); // Import the authenticateToken middleware

// Route to fetch all tasks
router.get('/',authenticateToken, (req, res) => {
    Task.getAll((err, tasks) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching tasks', details: err.message });
        } else {
            res.status(200).json(tasks);
        }
    });
});

// Route to create a new task
router.post('/',authenticateToken, (req, res) => {
    const { title, description, status, request_id } = req.body;

    // Validate inputs
    if (!title || !status || !request_id) {
        return res.status(400).json({ error: 'Title, status, and request_id are required' });
    }

    Task.create(title, description, status, request_id, null, (err, id) => {
        if (err) {
            res.status(500).json({ error: 'Error creating task', details: err.message });
        } else {
            res.status(201).json({ message: 'Task created successfully', id });
        }
    });
});

// Route to fetch a task by ID
router.get('/:id',authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    Task.findById(taskId, (err, task) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching task', details: err.message });
        } else if (!task) {
            res.status(404).json({ error: 'Task not found' });
        } else {
            res.status(200).json(task);
        }
    });
});

// Route to update the status of a task
router.put('/:id/status',authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    Task.updateStatus(taskId, status, (err, changes) => {
        if (err) {
            res.status(500).json({ error: 'Error updating task status', details: err.message });
        } else if (changes === 0) {
            res.status(404).json({ error: 'Task not found or no changes made' });
        } else {
            res.status(200).json({ message: 'Task status updated successfully' });
        }
    });
});

module.exports = router;
