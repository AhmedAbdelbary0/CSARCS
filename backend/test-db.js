const db = require('./database/db.js');

console.log('Attempting to query the database...');
db.serialize(() => {
    console.log('Querying the database for tables...');
    
    // Fetch table names
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
        if (err) {
            console.error('Error fetching tables:', err.message);
        } else if (!rows || rows.length === 0) {
            console.log('No tables found in the database.');
        } else {
            console.log('Tables in the database:');
            rows.forEach((row, index) => {
                console.log(`${index + 1}: ${row.name}`);
            });
        }
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
