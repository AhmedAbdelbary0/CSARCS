const db = require('./database/db.js');
const User = require('./models/user.js');
const Task = require('./models/task.js');
const Feedback = require('./models/feedback.js');
const Notification = require('./models/notification.js');

// Helper function to wrap each test and print results
function runTest(testName, testFn) {
    console.log(`Running test: ${testName}...`);
    testFn(() => console.log(`Test passed: ${testName}\n`));
}

// Test User Model
runTest('Create a User', (done) => {
    User.create('john_doe', 'john@example.com', 'securepassword', 'junior', (err, id) => {
        if (err) {
            console.error('Error creating user:', err.message);
        } else {
            console.log('User created with ID:', id);
        }
        done();
    });
});

runTest('Get All Users', (done) => {
    User.getAll((err, users) => {
        if (err) {
            console.error('Error fetching users:', err.message);
        } else {
            console.log('Users:', users);
        }
        done();
    });
});

// Test Task Model
runTest('Create a Task', (done) => {
    Task.create('Sample Task', 'Task description', 'open', 1, null, (err, id) => {
        if (err) {
            console.error('Error creating task:', err.message);
        } else {
            console.log('Task created with ID:', id);
        }
        done();
    });
});

runTest('Get All Tasks', (done) => {
    Task.getAll((err, tasks) => {
        if (err) {
            console.error('Error fetching tasks:', err.message);
        } else {
            console.log('Tasks:', tasks);
        }
        done();
    });
});

// Test Feedback Model
runTest('Create Feedback', (done) => {
    Feedback.create(1, 1, 5, 'Great work!', (err, id) => {
        if (err) {
            console.error('Error creating feedback:', err.message);
        } else {
            console.log('Feedback created with ID:', id);
        }
        done();
    });
});

runTest('Get All Feedback', (done) => {
    Feedback.getAll((err, feedbacks) => {
        if (err) {
            console.error('Error fetching feedbacks:', err.message);
        } else {
            console.log('Feedbacks:', feedbacks);
        }
        done();
    });
});

// Test Notification Model
runTest('Create Notification', (done) => {
    Notification.create(1, 'This is a test notification.', (err, id) => {
        if (err) {
            console.error('Error creating notification:', err.message);
        } else {
            console.log('Notification created with ID:', id);
        }
        done();
    });
});

runTest('Get All Notifications', (done) => {
    Notification.getAll((err, notifications) => {
        if (err) {
            console.error('Error fetching notifications:', err.message);
        } else {
            console.log('Notifications:', notifications);
        }
        done();
    });
});

// Close the database connection after all tests
runTest('Close Database', (done) => {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        done();
    });
});
