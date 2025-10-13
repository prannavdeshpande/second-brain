const express = require('express');
const { getProfile, updateProfile, getActivity, getStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/activity', protect, getActivity);
router.get('/stats', protect, getStats);

module.exports = router;