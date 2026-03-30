const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    index: true, 
    enum: ['driver_online', 'trip_started', 'passenger_joined', 'passenger_dropped', 'trip_completed', 'trip_cancelled'] 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', index: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
