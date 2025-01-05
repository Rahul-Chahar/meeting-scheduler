const express = require('express');
const router = express.Router();
const SchedulerController = require('../controllers/schedulerController');

router.get('/slots', SchedulerController.getSlots);
router.get('/booking/:email', SchedulerController.getCurrentBooking);
router.post('/book', SchedulerController.bookSlot);
router.post('/cancel', SchedulerController.cancelBooking);

module.exports = router;