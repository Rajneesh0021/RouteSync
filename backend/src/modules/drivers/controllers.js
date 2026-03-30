const Driver = require('../../models/Driver');
const User = require('../../models/User');

// @desc    Go Online
// @route   POST /drivers/go-online
// @access  Private (Driver)
const goOnline = async (req, res) => {
  try {
    let driver = await Driver.findOne({ userId: req.user._id });

    if (!driver) {
      // Create driver profile if not exists
      driver = await Driver.create({
        userId: req.user._id,
        vehicle: {
          number: req.body.vehicleNumber || 'UP32-PENDING',
          type: req.body.vehicleType || 'auto',
          capacity: req.body.capacity || 3
        },
        availableSeats: req.body.capacity || 3
      });
    }

    if (req.body.liveRoute) {
      driver.liveRoute = {
        start: req.body.liveRoute.start || driver.liveRoute?.start,
        end: req.body.liveRoute.end || driver.liveRoute?.end,
        activePolyline: req.body.liveRoute.activePolyline || []
      };
      
      // Update currentLocation to the start node
      if (req.body.liveRoute.start) {
        driver.currentLocation = {
          type: 'Point',
          coordinates: req.body.liveRoute.start,
          lastUpdatedAt: Date.now()
        };
      }
    }

    if (req.body.availableSeats !== undefined) {
      driver.availableSeats = parseInt(req.body.availableSeats);
    }

    driver.isOnline = true;
    await driver.save();

    res.json({
      success: true,
      message: 'Driver is now online',
      data: driver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Location
// @route   POST /drivers/location/update
// @access  Private (Driver)
const updateLocation = async (req, res) => {
  const { coordinates, heading, speed } = req.body;

  try {
    const driver = await Driver.findOneAndUpdate(
      { userId: req.user._id },
      {
        'currentLocation.coordinates': coordinates, // [lng, lat]
        'currentLocation.heading': heading || 0,
        'currentLocation.speed': speed || 0,
        'currentLocation.lastUpdatedAt': Date.now()
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({
      success: true,
      message: 'Location updated',
      data: driver.currentLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Select Route
// @route   POST /drivers/route/select
// @access  Private (Driver)
const selectRoute = async (req, res) => {
  const { routeId } = req.body;

  try {
    const driver = await Driver.findOneAndUpdate(
      { userId: req.user._id },
      { currentRouteId: routeId },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Route selected successfully',
      data: driver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { goOnline, updateLocation, selectRoute };
