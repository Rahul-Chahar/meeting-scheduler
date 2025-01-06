const db = require('../config/database');

class Booking {
    static async getAllBookings() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    bookings.id,
                    bookings.name,
                    bookings.email,
                    bookings.slot_id,
                    slots.time_slot
                FROM bookings
                JOIN slots ON bookings.slot_id = slots.id
                ORDER BY slots.time_slot ASC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create(slotId, name, email) {
        try {
            const [result] = await db.query(
                'INSERT INTO bookings (slot_id, name, email) VALUES (?, ?, ?)',
                [slotId, name, email]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }


    static async delete(bookingId) {
        try {
            const [rows] = await db.query(
                'SELECT slot_id FROM bookings WHERE id = ?',
                [bookingId]
            );
            
            if (rows[0]) {
                await db.query(
                    'DELETE FROM bookings WHERE id = ?',
                    [bookingId]
                );
                return rows[0].slot_id;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Booking;