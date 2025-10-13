const express = require('express');
const { performSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, performSearch);

module.exports = router;