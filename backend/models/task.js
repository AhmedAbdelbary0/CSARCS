const db = require('../database/db');

class Task {
    static create(title, description, status, request_id, accept_id, callback) {
        const sql = `
            INSERT INTO Tasks (title, description, status, request_id, accept_id, time_created)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `;
        db.run(sql, [title, description, status, request_id, accept_id], function (err) {
            callback(err, this?.lastID);
        });
    }
    static accept(id, accept_id, callback) {
        const sql = `
            UPDATE Tasks
            SET status = 'assigned', accept_id = ?, time_updated = datetime('now')
            WHERE id = ?
        `;
        db.run(sql, [accept_id, id], function (err) {
            callback(err, this?.changes);
        });
    }

    static getAll(callback) {
        const sql = `SELECT * FROM Tasks`;
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    }

    static findById(id, callback) {
        const sql = `SELECT * FROM Tasks WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            callback(err, row);
        });
    }

    static updateStatus(id, status, callback) {
        const sql = `
            UPDATE Tasks
            SET status = ?, time_updated = datetime('now')
            WHERE id = ?
        `;
        db.run(sql, [status, id], function (err) {
            callback(err, this?.changes);
        });
    }

    static getPaginated(limit, offset, callback) {
        const query = `SELECT * FROM Tasks LIMIT ? OFFSET ?`;
        db.all(query, [limit, offset], (err, rows) => {
            callback(err, rows);
        });
    }
    
    static filter(filters, callback) {
        let query = "SELECT * FROM Tasks WHERE 1=1"; // 1=1 makes appending conditions easier
        const params = [];
    
        if (filters.status) {
            query += " AND status = ?";
            params.push(filters.status);
        }
    
        if (filters.request_id) {
            query += " AND request_id = ?";
            params.push(filters.request_id);
        }
    
        if (filters.accept_id) {
            query += " AND accept_id = ?";
            params.push(filters.accept_id);
        }
    
        db.all(query, params, (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, rows);
            }
        });
    }
    static getActiveSessions(seniorId, callback) {
        const sql = `
            SELECT *
            FROM Tasks
            WHERE accept_id = ? AND status = 'assigned'
            ORDER BY time_updated DESC
        `;
        db.all(sql, [seniorId], (err, rows) => {
            if (err) {
                console.error("Error fetching active sessions:", err.message);
                return callback(err, null);
            }
            callback(null, rows);
        });
    };
    
}

module.exports = Task;
