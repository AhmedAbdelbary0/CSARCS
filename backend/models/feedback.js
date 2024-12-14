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

    static getByTaskId(taskId, callback) {
        const sql = `
            SELECT Feedback.rating, Feedback.comments, Users.username AS reviewer
            FROM Feedback
            INNER JOIN Users ON Feedback.user_id = Users.id
            WHERE Feedback.task_id = ?
        `;
        db.all(sql, [taskId], (err, rows) => {
            callback(err, rows);
        });
    }
    
    static getByUserId(user_id, callback) {
        const sql = `SELECT * FROM Feedback WHERE user_id = ?`;
        db.all(sql, [user_id], (err, rows) => {
            callback(err, rows);
        });
    }

}

module.exports = Feedback;
