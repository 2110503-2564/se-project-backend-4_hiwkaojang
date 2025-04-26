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
 *         picture:
 *           type: string
 *           description: url picture
 *           example: "https://drive.google.com/uc?id=17c5YiQLtTjIU2LKuv39VE-kt40ADahSd"
 *         StartingPrice:
 *           type: number
 *           description: strating price
 *           minimum: 0
 *           example: 1000
 *         rating:
 *           type: array
 *           items: 
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 fromat: objectId
 *                 description: ID user who rating
 *                 example: "6479c2b3d85857001234abcd"
 *               rating:
 *                 type: integer
 *                 description: score
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 description: review
 *                 example: "he is a good Dentist"
 *               createAt:
 *                 type: string
 *                 format: date-time
 *                 description: day of review
 *                 readOnly: true
 *             required:
 *               - user
 *               - reating
 *           description: All review to this Dentist
 *         availability:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Available times
 *                 example: "2025-04-26"
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       description: start time
 *                       example: "09:00"
 *                     end:
 *                       type: string
 *                       description: finish time
 *                       example: "10:00"
 *                   required:
 *                     - start
 *                     - end
 *                 required:
 *                   - date
 *                   - slots
 *             description: avaiable schedule
 *           bookings:
 *             type: array
 *             items:
 *               type: string
 *               format: objectId
 *             description: รายการ Booking ที่เกี่ยวข้อง (Virtual Field)
 *             readOnly: true
 */

module.exports = router;
