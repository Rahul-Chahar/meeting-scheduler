const db = require('../config/database');

class Slot {
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM slots');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateAvailability(slotId, increment) {
        try {
            const operator = increment ? '+' : '-';
            await db.query(
                `UPDATE slots SET available_slots = available_slots ${operator} 1 WHERE id = ?`,
                [slotId]
            );
        } catch (error) {
            throw error;
        }
    }

    static async checkAvailability(slotId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM slots WHERE id = ? AND available_slots > 0',
                [slotId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Slot;