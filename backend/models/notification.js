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
    static getPaginated(limit, offset, callback) {
        const query = `SELECT * FROM Notifications LIMIT ? OFFSET ?`;
        db.all(query, [limit, offset], (err, rows) => {
            callback(err, rows);
        });
    }

    static filter(filters, callback) {
        let query = "SELECT * FROM Notifications WHERE 1=1"; // Default condition
        const params = [];
    
        if (filters.user_id) {
            query += " AND user_id = ?";
            params.push(filters.user_id);
        }
    
        if (filters.message) {
            query += " AND message LIKE ?";
            params.push(`%${filters.message}%`);
        }
    
        db.all(query, params, (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, rows);
            }
        });

        
    }
    static create(userId, message, callback) {
        const sql = `INSERT INTO Notifications (user_id, message) VALUES (?, ?)`;
        db.run(sql, [userId, message], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.lastID);
        });
    }
    
}

module.exports = Notification;
