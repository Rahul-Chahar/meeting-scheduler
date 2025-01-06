const db = require('../config/database');

class Booking {
    // Get all bookings
    static async getAll() {
        const query = `
            SELECT 
                b.id, b.name, b.email, b.slot_id, s.time_slot
            FROM bookings b
            JOIN slots s ON b.slot_id = s.id
            ORDER BY s.time_slot ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    // Create a new booking
    static async create(slotId, name, email) {
        const query = 'INSERT INTO bookings (slot_id, name, email) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [slotId, name, email]);
        return result.insertId; // Return new booking ID
    }

    // Delete a booking
    static async delete(bookingId) {
        const query = 'SELECT slot_id FROM bookings WHERE id = ?';
        const [rows] = await db.query(query, [bookingId]);

        if (!rows[0]) return null; // No booking found

        await db.query('DELETE FROM bookings WHERE id = ?', [bookingId]);
        return rows[0].slot_id; // Return slot ID for updating availability
    }
}

module.exports = Booking;
