const db = require('../database/db'); // Database connection


class LibraryRoom {

    static findAvailableRoom(callback) {
        const sql = `
            SELECT id, room_number 
            FROM LibraryRooms 
            WHERE is_reserved = 0 
            LIMIT 1
        `;
        db.get(sql, [], (err, row) => {
            return callback(err, row);
        });
    }
    
    
    // Reserve the first available room
    static reserveRoom(callback) {
        const sql = `UPDATE LibraryRooms 
                     SET is_reserved = 1 
                     WHERE is_reserved = 0 
                     LIMIT 1 RETURNING id`;

        db.get(sql, [], (err, row) => {
            if (err) return callback(err, null);
            if (row) return callback(null, row.id);
            return callback(new Error("No available rooms"));
        });
    }

    // Free a reserved room
    static freeRoom(roomId, callback) {
        const sql = `UPDATE LibraryRooms 
                     SET is_reserved = 0 
                     WHERE id = ?`;

        db.run(sql, [roomId], (err) => {
            callback(err);
        });
    }
}

module.exports = LibraryRoom;
