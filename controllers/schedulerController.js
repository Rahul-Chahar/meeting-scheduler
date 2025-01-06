const Slot = require('../models/slot');
const Booking = require('../models/booking');

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
            const bookings = await Booking.getAll();
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching bookings' });
        }
    }

    static async bookSlot(req, res) {
        const { slotId, name, email } = req.body;

        try {
            // Check if slot is available
            const slot = await Slot.checkAvailability(slotId);
            if (!slot) {
                return res.status(400).json({ message: 'No slots available' });
            }

            // Create a booking and update slot availability
            const bookingId = await Booking.create(slotId, name, email);
            await Slot.updateAvailability(slotId, false);

            res.json({
                message: `Slot is confirmed for ${name}. Please join at ${slot.time_slot}`,
                time: slot.time_slot,
                bookingId,
                success: true
            });
        } catch (error) {
            res.status(500).json({ message: 'Booking failed' });
        }
    }

    static async cancelBooking(req, res) {
        const { bookingId } = req.body;

        try {
            // Delete the booking and update slot availability
            const slotId = await Booking.delete(bookingId);
            if (!slotId) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            await Slot.updateAvailability(slotId, true);

            res.json({ message: 'Booking cancelled successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Cancellation failed' });
        }
    }
}

module.exports = SchedulerController;
