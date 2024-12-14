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

    static approve(taskId, callback) {
    const sql = `UPDATE Tasks SET status = 'approved', time_updated = CURRENT_TIMESTAMP WHERE id = ? AND status = 'completed'`;
    db.run(sql, [taskId], function (err) {
        if (err) {
            return callback(err);
        }
        if (this.changes === 0) {
            return callback(new Error('Task not found or not in a completed state.'));
        }
        callback(null);
    });
    }


    static getByStatus(status, callback) {
        const sql = `SELECT * FROM Tasks WHERE status = ? ORDER BY time_updated DESC`;
        db.all(sql, [status], (err, rows) => {
            callback(err, rows);
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

    static getByRequestId(requestId, callback) {
        const sql = `
            SELECT *
            FROM Tasks
            WHERE request_id = ? AND status IN ('open', 'assigned')
            ORDER BY time_created DESC
        `;
        db.all(sql, [requestId], (err, rows) => {
            callback(err, rows);
        });
    }
    
    static getSeniorDetailsById(seniorId, callback) {
        const sql = `SELECT id, username, email FROM Users WHERE id = ?`;
        db.get(sql, [seniorId], (err, row) => {
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

    static getSessionsByStatuses(seniorId, statuses, callback) {
        const placeholders = statuses.map(() => '?').join(', '); // Create placeholders (?, ?, ...)
        const sql = `
            SELECT * 
            FROM Tasks 
            WHERE accept_id = ? AND status IN (${placeholders}) 
            ORDER BY time_updated DESC
        `;
        db.all(sql, [seniorId, ...statuses], (err, rows) => {
            callback(err, rows);
        });
    }
    
    
}

module.exports = Task;
