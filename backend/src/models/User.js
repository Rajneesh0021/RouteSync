const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  phone: {
    number: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false }
  },
  email: {
    address: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }
  },
  password: { type: String }, // Optional for OAuth users
  role: { 
    type: String, 
    enum: ['admin', 'employee', 'driver', 'passenger'], 
    default: 'passenger' 
  },
  profilePhoto: {
    url: String,
    publicId: String
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  status: { 
    type: String, 
    enum: ['active', 'blocked', 'deleted'], 
    default: 'active' 
  },
  stats: {
    totalTrips: { type: Number, default: 0 },
    totalDistanceKm: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }, // Passenger specific
    totalEarned: { type: Number, default: 0 } // Driver specific
  },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
