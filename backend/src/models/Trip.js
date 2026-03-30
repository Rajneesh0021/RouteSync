const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  status: { 
    type: String, 
    enum: ['searching', 'ongoing', 'completed', 'cancelled'], 
    default: 'searching' 
  },
  startTime: { type: Date },
  endTime: { type: Date },
  timeline: [
    {
      event: { type: String, enum: ['trip_started', 'passenger_joined', 'passenger_dropped'] },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }
  ],
  passengers: [
    {
      passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
      pickupLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
      },
      dropLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
      },
      joinedAt: { type: Date, default: Date.now },
      droppedAt: { type: Date },
      fare: { type: Number, default: 0 },
      status: { 
        type: String, 
        enum: ['onboard', 'completed', 'cancelled'], 
        default: 'onboard' 
      }
    }
  ],
  routeSnapshot: {
    polyline: [{ lat: Number, lng: Number }],
    stops: [
      {
        name: { type: String },
        coordinates: { type: [Number] },
        order: { type: Number }
      }
    ]
  },
  distanceTravelledKm: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
}, { timestamps: true });

// Index for status and driverId for quick lookups
tripSchema.index({ status: 1 });
tripSchema.index({ driverId: 1 });

module.exports = mongoose.model('Trip', tripSchema);
