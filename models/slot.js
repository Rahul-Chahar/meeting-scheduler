const db = require('../config/database');

class Slot {
    // Get all slots from the database
    static async getAll() {
        try {
            const [slots] = await db.query('SELECT * FROM slots');
            return slots;
        } catch (error) {
            throw new Error('Error fetching slots');
        }
    }

    // Update the availability of a slot by increasing or decreasing available slots
    static async updateAvailability(slotId, isIncrease) {
        try {
            const change = isIncrease ? 1 : -1;
            await db.query(
                'UPDATE slots SET available_slots = available_slots + ? WHERE id = ?',
                [change, slotId]
            );
        } catch (error) {
            throw new Error('Error updating slot availability');
        }
    }

    // Check if a specific slot is available
    static async checkAvailability(slotId) {
        try {
            const [result] = await db.query(
                'SELECT * FROM slots WHERE id = ? AND available_slots > 0',
                [slotId]
            );
            return result[0] || null; // Return the slot if found, otherwise null
        } catch (error) {
            throw new Error('Error checking slot availability');
        }
    }
}

module.exports = Slot;
