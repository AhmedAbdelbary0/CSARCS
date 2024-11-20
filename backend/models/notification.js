const db = require('../database/db');

class Notification {
    // Create a new notification
    static create(user_id, message, callback) {
        const sql = `
            INSERT INTO Notifications (user_id, message, time_created)
            VALUES (?, ?, datetime('now'))
        `;
        db.run(sql, [user_id, message], function (err) {
            callback(err, this?.lastID);
        });
    }
    // Fetch all notifications
    static getAll(callback) {
        const sql = `SELECT * FROM Notifications`;
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    }
    // Fetch notifications for a specific user
    static getByUserId(user_id, callback) {
        const sql = `SELECT * FROM Notifications WHERE user_id = ?`;
        db.all(sql, [user_id], (err, rows) => {
            callback(err, rows);
        });
    }
}

module.exports = Notification;
