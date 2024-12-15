const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const Task = require('../models/task');
const Notification = require('../models/notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const User = require('../models/user'); // Adjust the path based on your project structure
const Feedback = require('../models/feedback'); // Adjust the path if necessary

const AppError = require('../utils/AppError'); // Import custom AppError

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation Errors:", errors.array()); // Log validation errors
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


// Route to fetch available tasks
router.get(
    '/available',
    authenticateToken,
    roleMiddleware(['senior']),
    async (req, res, next) => {
        try {
            const tasks = await new Promise((resolve, reject) =>
                Task.getAll((err, tasks) => (err ? reject(err) : resolve(tasks)))
            );

            // Filter tasks with status "open"
            const availableTasks = tasks.filter(task => task.status === 'open');

            res.status(200).json(availableTasks);
        } catch (err) {
            next(err);
        }
    }
);

// Route to fetch active (assigned) tasks
router.get(
    '/active-sessions',
    authenticateToken,
    async (req, res, next) => {
        try {
            const tasks = await new Promise((resolve, reject) =>
                Task.getByStatus('assigned', (err, tasks) => (err ? reject(err) : resolve(tasks)))
            );

            const tasksWithDetails = await Promise.all(
                tasks.map(async (task) => {
                    const junior = await new Promise((resolve, reject) =>
                        User.getById(task.request_id, (err, user) => (err ? reject(err) : resolve(user)))
                    );
                    const senior = await new Promise((resolve, reject) =>
                        User.getById(task.accept_id, (err, user) => (err ? reject(err) : resolve(user)))
                    );

                    return {
                        ...task,
                        junior_name: junior?.username || "Unknown",
                        senior_name: senior?.username || "Unknown",
                    };
                })
            );

            res.status(200).json(tasksWithDetails);
        } catch (err) {
            console.error("Error fetching active sessions:", err);
            next(err);
        }
    }
);




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
    ],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const { title, description, status } = req.body;
            const request_id = req.user.id; // Use logged-in user's ID

            const taskId = await new Promise((resolve, reject) =>
                Task.create(title, description, status, request_id, null, (err, id) => (err ? reject(err) : resolve(id)))
            );

            res.status(201).json({ message: 'Task created successfully', id: taskId });
        } catch (err) {
            next(err);
        }
    }
);


// Route to fetch tasks assigned to the logged-in user
router.get(
    '/active-sessions',
    authenticateToken,
    roleMiddleware(['senior']),
    async (req, res, next) => {
        try {
            const seniorId = req.user.id; // Extract the senior's ID from the token

            // Fetch tasks assigned to this senior
            const tasks = await new Promise((resolve, reject) =>
                Task.getActiveSessions(seniorId, (err, tasks) => (err ? reject(err) : resolve(tasks)))
            );

            res.status(200).json(tasks);
        } catch (err) {
            console.error("Error fetching active sessions:", err.message);
            next(err);
        }
    }
);

// Route to fetch completed tasks assigned to the logged-in user
router.get(
    '/completed-sessions',
    authenticateToken,
    roleMiddleware(['senior']),
    async (req, res, next) => {
        try {
            const seniorId = req.user.id; // Get logged-in senior's ID from the token

            // Fetch tasks with statuses "completed", "approved", and "declined"
            const tasks = await new Promise((resolve, reject) =>
                Task.getSessionsByStatuses(seniorId, ['completed', 'approved', 'declined'], (err, tasks) => {
                    if (err) return reject(err);
                    resolve(tasks);
                })
            );

            // Fetch feedback and handle declined tasks for each task
            const tasksWithDetails = await Promise.all(
                tasks.map(async (task) => {
                    // Fetch feedback
                    const feedback = await new Promise((resolve, reject) =>
                        Feedback.getByTaskId(task.id, (err, feedback) => {
                            if (err) return reject(err);
                            resolve(feedback);
                        })
                    );

                    // Include decline_message for declined tasks
                    return {
                        ...task,
                        feedback,
                        decline_message: task.status === 'declined' ? task.decline_message : null,
                    };
                })
            );

            res.status(200).json(tasksWithDetails);
        } catch (err) {
            console.error("Error fetching completed sessions:", err.message);
            res.status(500).json({ error: "Internal Server Error", details: err.message });
        }
    }
);






// Route to fetch completed sessions for faculty
router.get(
    '/faculty-completed-sessions',
    authenticateToken,
    roleMiddleware(['faculty']),
    async (req, res, next) => {
        try {
            const tasks = await new Promise((resolve, reject) =>
                Task.getByStatus('completed', (err, tasks) => (err ? reject(err) : resolve(tasks)))
            );

            const tasksWithDetails = await Promise.all(
                tasks.map(async (task) => {
                    const junior = await new Promise((resolve, reject) =>
                        User.getById(task.request_id, (err, user) => (err ? reject(err) : resolve(user)))
                    );

                    const senior = await new Promise((resolve, reject) =>
                        User.getById(task.accept_id, (err, user) => (err ? reject(err) : resolve(user)))
                    );

                    const feedback = await new Promise((resolve, reject) =>
                        Feedback.getByTaskId(task.id, (err, feedback) => (err ? reject(err) : resolve(feedback)))
                    );

                    return {
                        ...task,
                        junior_name: junior?.username || "Unknown",
                        senior_name: senior?.username || "Unknown",
                        feedback: feedback || [],
                    };
                })
            );

            res.status(200).json(tasksWithDetails);
        } catch (err) {
            console.error("Error fetching completed sessions:", err);
            next(err);
        }
    }
);





// Route to fetch tasks created by the logged-in user
router.get('/my-requests', authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id; // Get logged-in user's ID
        const tasks = await new Promise((resolve, reject) =>
            Task.getByRequestId(userId, (err, tasks) => (err ? reject(err) : resolve(tasks)))
        );

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found.' });
        }

        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});

router.put(
    '/:taskId/end-session',
    authenticateToken,
    roleMiddleware(['junior']),
    async (req, res, next) => {
        try {
            const taskId = parseInt(req.params.taskId, 10);
            const { feedback, rating } = req.body;

            // Validate inputs
            if (!feedback || !rating || isNaN(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Invalid feedback or rating." });
            }

            // Update task status to "completed"
            const taskUpdated = await new Promise((resolve, reject) =>
                Task.updateStatus(taskId, "completed", (err, changes) =>
                    err ? reject(err) : resolve(changes)
                )
            );

            if (taskUpdated === 0) {
                return res.status(404).json({ message: "Task not found or already completed." });
            }

            // Save feedback
            const feedbackSaved = await new Promise((resolve, reject) =>
                Feedback.create(taskId, req.user.id, rating, feedback, (err, id) =>
                    err ? reject(err) : resolve(id)
                )
            );

            res.status(200).json({ message: "Session ended and feedback saved successfully." });
        } catch (err) {
            console.error("Error ending session:", err);
            next(err);
        }
    }
);


//route to fetch the senior details of an assigned task
router.get(
    '/:id/senior-details',
    authenticateToken,
    async (req, res, next) => {
        try {
            const taskId = parseInt(req.params.id, 10);

            // Get the task details
            const task = await new Promise((resolve, reject) =>
                Task.findById(taskId, (err, task) => (err ? reject(err) : resolve(task)))
            );

            if (!task || !task.accept_id) {
                return res.status(404).json({ message: 'Task not found or not assigned' });
            }

            // Fetch senior details
            const seniorDetails = await new Promise((resolve, reject) =>
                Task.getSeniorDetailsById(task.accept_id, (err, senior) => (err ? reject(err) : resolve(senior)))
            );

            if (!seniorDetails) {
                return res.status(404).json({ message: 'Senior not found' });
            }

            res.status(200).json(seniorDetails);
        } catch (err) {
            console.error('Error fetching senior details:', err);
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
        body('status').isIn(['open', 'assigned', 'completed']).withMessage('Invalid status'),
    ],
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const taskId = parseInt(req.params.id, 10);
            const { status } = req.body;
            const acceptId = req.user.id; // Get logged-in user's ID from the token

            if (status === 'assigned') {
                // Ensure the task is open before assigning
                const task = await new Promise((resolve, reject) =>
                    Task.findById(taskId, (err, task) => (err ? reject(err) : resolve(task)))
                );

                if (!task || task.status !== 'open') {
                    console.error(`Task is not available for assignment: Task ID ${taskId}, Current Status: ${task?.status}`);
                    throw new AppError('Task is not available for assignment', 400);
                }

                // Accept the task
                const changes = await new Promise((resolve, reject) =>
                    Task.accept(taskId, acceptId, (err, changes) => (err ? reject(err) : resolve(changes)))
                );

                if (changes === 0) {
                    console.error(`Task not found or already assigned: Task ID ${taskId}`);
                    throw new AppError('Task not found or already assigned', 404);
                }

                console.log(`Task assigned successfully: Task ID ${taskId}, Assigned To: ${acceptId}`);
                res.status(200).json({ message: 'Task assigned successfully' });
            }else if (status === 'completed') {
                // Ensure the task is assigned to the current user before marking as completed
                const task = await new Promise((resolve, reject) =>
                    Task.findById(taskId, (err, task) => (err ? reject(err) : resolve(task)))
                );

                if (!task) {
                    throw new AppError('Task not found', 404);
                }

                if (task.accept_id !== acceptId) {
                    throw new AppError('You can only complete tasks assigned to you', 403);
                }

                // Mark task as completed
                const changes = await new Promise((resolve, reject) =>
                    Task.updateStatus(taskId, 'completed', (err, changes) => (err ? reject(err) : resolve(changes)))
                );

                if (changes === 0) {
                    throw new AppError('No changes made to the task', 404);
                }

                console.log(`Task marked as completed: Task ID ${taskId}, Completed By: ${acceptId}`);
                res.status(200).json({ message: 'Task marked as completed' });
            }else {
                // Handle other status updates
                const changes = await new Promise((resolve, reject) =>
                    Task.updateStatus(taskId, status, (err, changes) => (err ? reject(err) : resolve(changes)))
                );

                if (changes === 0) {
                    console.error(`Task not found or no changes made: Task ID ${taskId}`);
                    throw new AppError('Task not found or no changes made', 404);
                }

                console.log(`Task status updated successfully: Task ID ${taskId}, New Status: ${status}`);
                res.status(200).json({ message: 'Task status updated successfully' });
            }
        } catch (err) {
            console.error(`Error updating task status: ${err.message}`);
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

router.patch(
    '/:id/decline',
    authenticateToken,
    roleMiddleware(['faculty']),
    async (req, res, next) => {
        try {
            const taskId = req.params.id;
            const { message } = req.body; // Decline message from the request body

            // Update the task's status to 'declined' and save the message
            await new Promise((resolve, reject) =>
                Task.decline(taskId, message, (err) => (err ? reject(err) : resolve()))
            );

            res.status(200).json({ message: 'Task declined successfully' });
        } catch (err) {
            console.error('Error declining task:', err);
            next(err);
        }
    }
);


module.exports = router;
