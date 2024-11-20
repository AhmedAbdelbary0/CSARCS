const db = require('../database/db');

class Feedback {
    static create(task_id, user_id, rating, comments, callback) {
        const sql = `
            INSERT INTO Feedback (task_id, user_id, rating, comments)
            VALUES (?, ?, ?, ?)
        `;
        db.run(sql, [task_id, user_id, rating, comments], function (err) {
            callback(err, this?.lastID);
        });
    }

    static getAll(callback) {
        const sql = `SELECT * FROM Feedback`;
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    }

    static getByTaskId(task_id, callback) {
        const sql = `SELECT * FROM Feedback WHERE task_id = ?`;
        db.all(sql, [task_id], (err, rows) => {
            callback(err, rows);
        });
    }
}

module.exports = Feedback;
