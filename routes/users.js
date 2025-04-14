const express = require('express');
const {getUsers, getUser, updateUserRole} = require('../controllers/users');
const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id').get(protect, authorize('admin'), getUser).put(protect, authorize('admin'), updateUserRole);

module.exports = router;