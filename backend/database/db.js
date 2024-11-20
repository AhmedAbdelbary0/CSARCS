const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the database file path
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Open the database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;
