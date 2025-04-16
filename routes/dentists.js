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
    getDentistReviews 
} = require('../controllers/dentists');

//Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:dentistId/bookings/', bookingRouter);

// GET /api/v1/dentists/609cbfd6e8a1d8a8d8f8d8f8/reviews
router.route('/:dentistId/reviews').get(getDentistReviews);

router.route('/')
    .get(getDentists)
    .post(protect, authorize('admin'), createDentist);

router.route('/:id') 
    .get(getDentist)
    .put(protect, authorize('admin'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

router.route('/review/:id')
    .put(protect, authorize('admin', 'user'), updateDentistReview)
    .delete(protect, authorize('admin', 'user'), removeDentistReview);
    
module.exports = router;