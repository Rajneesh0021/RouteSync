const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  polyline: [{ lat: Number, lng: Number }],
  stops: [
    {
      name: { type: String },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      order: { type: Number, required: true }
    }
  ],
  metrics: {
    avgDemandPerHour: { type: Number, default: 0 },
    avgCompletionTime: { type: Number, default: 0 },
    peakHours: { type: [Number], default: [] },
    popularityScore: { type: Number, default: 0 }
  },
  fare: {
    baseFare: { type: Number, required: true },
    perKm: { type: Number, required: true },
    maxFare: { type: Number, required: true }
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
