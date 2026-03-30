const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { goOnline, updateLocation, selectRoute } = require('./controllers');

// All driver routes are protected
router.use(protect);
router.use(authorize('driver'));

router.post('/go-online', goOnline);
router.post('/location/update', updateLocation);
router.post('/route/select', selectRoute);

module.exports = router;
