const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); // Import the user routes
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import feedback routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const errorHandler = require('./middleware/errorHandler'); // Import the error handler middleware

// Create the express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes); 
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use((req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // Pass to error handler
});
app.use(errorHandler); // Error handler middleware

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
