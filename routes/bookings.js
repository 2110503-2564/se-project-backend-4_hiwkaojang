const express = require('express');
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
  getPatientHistory,
  confirmBooking // Add for confirmation page
} = require('../controllers/bookings');

const router = express.Router({mergeParams:true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'user', 'dentist'), getBookings)
  .post(protect, authorize('admin', 'user', 'dentist'), addBooking);

router.route('/:id')
  .get(getBooking) // Make this publicly accessible for confirmation page
  .put(protect, authorize('admin', 'user', 'dentist'), updateBooking)
  .delete(protect, authorize('admin'), deleteBooking);

// Add the new route for confirmation
router.route('/:id/confirm')
  .put(confirmBooking); // Public route, no protection needed as it's accessed via email

router.route('/patientHistory/:userId')
  .get(protect, authorize('dentist'), getPatientHistory);

module.exports = router;