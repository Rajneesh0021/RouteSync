const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { searchDrivers } = require('./controllers');

// All passenger routes are protected
router.use(protect);
router.use(authorize('passenger'));

router.post('/search', searchDrivers);

module.exports = router;
