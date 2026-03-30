const Driver = require('../../models/Driver');
const Route = require('../../models/Route');

// @desc    Search for Nearby Drivers on Route
// @route   POST /passengers/search
// @access  Private (Passenger)
const searchDrivers = async (req, res) => {
  const { pickup, drop } = req.body; // [lng, lat]

  try {
    // 1. Find drivers within 15km radius of pickup
    const nearbyDrivers = await Driver.find({
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: pickup },
          $maxDistance: 15000 // 15 km max bounce radius
        }
      },
      availableSeats: { $gt: 0 }
    }).populate('currentRouteId').populate('user', 'name');

    // 2. Filter valid active drivers (either strict static route or new Dynamic Operator arrays)
    const matchedDrivers = nearbyDrivers.filter(driver => {
      // Must have either a valid static DB route or a dynamically traced GPS path active
      if (!driver.currentRouteId && (!driver.liveRoute || !driver.liveRoute.start)) return false;
      return true;
    });

    res.json({
      success: true,
      message: `${matchedDrivers.length} matching drivers found`,
      data: matchedDrivers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { searchDrivers };
