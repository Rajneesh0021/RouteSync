const mongoose = require('mongoose');

const tripHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['driver', 'passenger'], required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  summary: {
    routeName: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    distanceKm: { type: Number },
    fare: { type: Number },
    earnings: { type: Number },
    status: { type: String }
  },
  driver: {
    name: { type: String },
    vehicleNumber: { type: String }
  },
  passenger: {
    name: { type: String }
  },
}, { timestamps: true });

// Index for performance
tripHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('TripHistory', tripHistorySchema);
