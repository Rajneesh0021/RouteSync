const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: {
    number: { type: String, required: true },
    type: { type: String, enum: ['auto', 'e-rickshaw', 'van'], required: true },
    model: { type: String },
    capacity: { type: Number, required: true }
  },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere', default: [0, 0] }, // [lng, lat]
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    lastUpdatedAt: { type: Date, default: Date.now }
  },
  currentRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  liveRoute: {
    start: { type: [Number] }, // [lng, lat]
    end: { type: [Number] }, // [lng, lat]
    activePolyline: { type: [[Number]], default: [] } // Array of [lng, lat] coordinates defining exact road path
  },
  currentTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  availableSeats: { type: Number },
  performance: {
    acceptanceRate: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
    onTimePercentage: { type: Number, default: 0 }
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  lastTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
}, { timestamps: true });

// Strictly enforce the Geospatial mathematical engine on the entire object
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
