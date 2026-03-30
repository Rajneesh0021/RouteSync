const Route = require('../../models/Route');

// @desc    Get All Active Routes
// @route   GET /routes
// @access  Public
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a New Route
// @route   POST /routes
// @access  Private (Admin)
const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRoutes, createRoute };
