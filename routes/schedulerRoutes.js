const express = require('express');
const router = express.Router();
const SchedulerController = require('../controllers/schedulerController');

router.get('/slots', SchedulerController.getSlots);
router.post('/book', SchedulerController.bookSlot);
router.get('/bookings', SchedulerController.getAllBookings);
router.post('/cancel', SchedulerController.cancelBooking);

module.exports = router;