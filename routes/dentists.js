const express = require('express');
const {
    getDentists,
    getDentist,
    createDentist,
    updateDentist,
    deleteDentist,
    updateDentistReview,
    removeDentistReview,
    getDentistReviews,
    getDentistBookedDates,
    addExpertise,
    removeExpertise
} = require('../controllers/dentists');

const bookingRouter = require('./bookings');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use('/:dentistId/bookings/', bookingRouter);

router.route('/')
    .get(getDentists)
    .post(protect, authorize('admin'), createDentist);

router.route('/:id')
    .get(getDentist)
    .put(protect, authorize('admin'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

// New expertise modification routes
router.route('/:id/expertise')
    .put(protect, authorize('admin','dentist'), addExpertise)
    .delete(protect, authorize('admin'), removeExpertise);

router.route('/reviews/:id')
    .get(getDentistReviews)
    .put(protect, authorize('admin', 'user'), updateDentistReview)
    .delete(protect, authorize('admin', 'user'), removeDentistReview);

router.route('/availibility/:id')
    .get(getDentistBookedDates);

module.exports = router;
