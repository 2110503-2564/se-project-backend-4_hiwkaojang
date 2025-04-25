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
    .put(protect, authorize('admin', 'dentist'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

// New expertise modification routes
router.route('/:id/expertise')
    .put(protect, authorize('admin','dentist'), addExpertise)
    .delete(protect, authorize('admin','dentist'), removeExpertise);

router.route('/reviews/:id')
    .get(getDentistReviews)
    .put(protect, authorize('admin', 'user'), updateDentistReview)
    .delete(protect, authorize('admin', 'user'), removeDentistReview);

router.route('/availibility/:id')
    .get(getDentistBookedDates);
/**
 * @swagger
 * components:
 *   schemas:
 *     Dentist:
 *       type: object
 *       required:
 *         - year_experience
 *         - area_experience
 *         - name
 *         - StartingPrice
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           desciption: The auto-generated id of the hospital
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name:
 *           type: string
 *           desciption: Dentist name
 *         year_experience:
 *           type: integer
 *           desciption: Dentist Year experience
 *           minimum: 0 
 *         area_expertise:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - Orthodontics
 *               - Endodontics
 *               - Prosthodontics
 *               - Pediatric Dentistry
 *               - Oral Surgery
 *               - Periodontics
 *               - Cosmetic Dentistry
 *               - General Dentistry
 *               - Implant Dentistry
 *           description: expert
 *           example: ["General Dentistry", "Cosmetic Dentistry"]
 *       
 */

module.exports = router;
