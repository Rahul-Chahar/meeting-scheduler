const Slot = require('../models/slot');
const Booking = require('../models/booking');
const db = require('../config/database');

class SchedulerController {
    static async getSlots(req, res) {
        try {
            const slots = await Slot.getAll();
            res.json(slots);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching slots' });
        }
    }

    static async getAllBookings(req, res) {
        try {
            const bookings = await Booking.getAllBookings();
            res.json(bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            res.status(500).json({ message: 'Error fetching bookings' });
        }
    }


    static async bookSlot(req, res) {
    const { slotId, name, email } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check slot availability
        const slot = await Slot.checkAvailability(slotId);
        if (!slot) {
            await connection.rollback();
            return res.status(400).json({ message: 'No slots available' });
        }

        const bookingId = await Booking.create(slotId, name, email);
        await Slot.updateAvailability(slotId, false);

        await connection.commit();
        res.json({ 
            message: `Slot is confirmed ${name}. Please join at ${slot.time_slot}`,
            time: slot.time_slot,
            bookingId: bookingId,
            success: true
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Booking failed' });
    } finally {
        connection.release();
    }
}
    static async cancelBooking(req, res) {
        const { bookingId } = req.body;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const slotId = await Booking.delete(bookingId);
            if (!slotId) {
                await connection.rollback();
                return res.status(404).json({ message: 'Booking not found' });
            }

            await Slot.updateAvailability(slotId, true);

            await connection.commit();
            res.json({ message: 'Booking cancelled successfully' });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({ message: 'Cancellation failed' });
        } finally {
            connection.release();
        }
    }
}

module.exports = SchedulerController;