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
}

module.exports = Task;
