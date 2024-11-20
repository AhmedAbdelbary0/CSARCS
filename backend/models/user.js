const db = require('../database/db');
const bcrypt = require('bcrypt');

class User {
    
    static create(username, email, password, role, callback) { 
        const query = `
            INSERT INTO Users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;
        db.run(query, [username, email, password, role], function (err) {
            callback(err, this?.lastID);
        });
    }
    
    static getAll(callback) {
        const query = `SELECT id, username, email, role FROM Users`;
        db.all(query, [], (err, rows) => {
            callback(err, rows);
        });
    }

    static getById(id, callback) {
        const query = `SELECT id, username, email, role FROM Users WHERE id = ?`;
        db.get(query, [id], (err, row) => {
            callback(err, row);
        });
    }

    static deleteById(id, callback) {
        const query = `DELETE FROM Users WHERE id = ?`;
        db.run(query, [id], function (err) {
            callback(err, this?.changes);
        });
    }


    static getByEmail(email, callback) {
        const query = `SELECT id, username, email, password, role FROM Users WHERE email = ?`;
        db.get(query, [email], (err, row) => {
            callback(err, row);
        });
    }
    
    static validatePassword(inputPassword, hashedPassword, callback) {
        bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
            callback(err, isMatch);
        });
    }
}

module.exports = User;
