const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', index: true },
  locations: [
    {
      coordinates: { type: [Number], required: true }, // [lng, lat]
      timestamp: { type: Date, default: Date.now },
      speed: { type: Number },
      heading: { type: Number }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
