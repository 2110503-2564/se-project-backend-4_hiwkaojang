// routes/dentists.js
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
    getDentistBookedDates
} = require('../controllers/dentists');

//Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:dentistId/bookings/', bookingRouter);

router.route('/')
    .get(getDentists)
    .post(protect, authorize('admin'), createDentist);

router.route('/:id') 
    .get(getDentist)
    .put(protect, authorize('admin'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

router.route('/reviews/:id')
    .get(getDentistReviews)
    .put(protect, authorize('admin', 'user'), updateDentistReview)
    .delete(protect, authorize('admin', 'user'), removeDentistReview);

router.route('/availibility/:id').get(getDentistBookedDates);
    
module.exports = router;