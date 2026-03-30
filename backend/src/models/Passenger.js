const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
    lastUpdatedAt: { type: Date, default: Date.now }
  },
  destination: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  activeTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  behavior: {
    noShowCount: { type: Number, default: 0 },
    cancellationCount: { type: Number, default: 0 }
  },
  lastTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
}, { timestamps: true });

module.exports = mongoose.model('Passenger', passengerSchema);
