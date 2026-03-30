const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { getRoutes, createRoute } = require('./controllers');

// Public route to view routes
router.get('/', getRoutes);

// Admin only route to create/manage master data
router.post('/', protect, authorize('admin'), createRoute);

module.exports = router;
