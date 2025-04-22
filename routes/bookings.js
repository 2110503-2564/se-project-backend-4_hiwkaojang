const express = require('express');
const {getBookings, getBooking, addBooking, updateBooking, deleteBooking , editStatusBooking } = require('../controllers/bookings');

const router = express.Router({mergeParams:true});

const {protect, authorize} = require('../middleware/auth')

router.route('/').get(protect, authorize('admin', 'user', 'dentist'), getBookings).post(protect, authorize('admin', 'user'), addBooking);
router.route('/:id').get(protect, authorize('admin', 'user', 'dentist'), getBooking).put(protect, authorize('admin', 'user'), updateBooking).delete(protect, authorize('admin'), deleteBooking);

module.exports = router;