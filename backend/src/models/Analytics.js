const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  totalTrips: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  activeDrivers: { type: Number, default: 0 },
  activePassengers: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
