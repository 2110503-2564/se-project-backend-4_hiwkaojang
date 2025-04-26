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

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - bookingDate
 *         - user
 *         - dentist
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated unique identifier for the booking
 *           example: 67fde5505a0148bd60617094
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: The date and time of the booking
 *         user:
 *           type: string
 *           format: uuid
 *           description: The ID of the user making the booking
 *         dentist:
 *           type: string
 *           format: uuid
 *           description: The ID of the dentist for the booking
 *         status:
 *           type: string
 *           enum: [upcoming, completed, cancelled, confirmed, blocked]
 *           description: The status of the booking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the booking was created
 *         treatmentDetail:
 *           type: string
 *           description: Details about the treatment
 *       example:
 *         id: 67fde7ded883ed6a5f67590d
 *         bookingDate: 2025-09-01T17:00:00.000+00:00
 *         user: 67fde38d5a0148bd60617086
 *         dentist: 67fde38d5a0148bd60617087
 *         status: completed
 *         createdAt: 2025-04-15T05:00:14.407+00:00
 *         treatmentDetail: "Performed teeth cleaning and fluoride treatment to prevent cavities and maintain oral hygiene."
 */

module.exports = router;