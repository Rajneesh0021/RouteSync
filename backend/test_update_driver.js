const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const user = await User.findOne({ email: { address: 'rajneesh@gmail.com' } }) || await User.findOne();
    if (!user) return console.log('no user');
    console.log('User found:', user.name);

    let driver = await Driver.findOne({ userId: user._id });
    
    const vehicleNumber = "ap13v7951";
    const vehicleType = "auto";
    const vehicleModel = "bajaj";
    const capacity = "6";

    if (!driver) {
      driver = new Driver({ userId: user._id, vehicle: { number: vehicleNumber, type: vehicleType, model: vehicleModel, capacity }, availableSeats: capacity || 3 });
    } else {
      if (vehicleNumber) driver.vehicle.number = vehicleNumber;
      if (vehicleType) driver.vehicle.type = vehicleType;
      if (vehicleModel) driver.vehicle.model = vehicleModel;
      if (capacity) {
        driver.vehicle.capacity = capacity;
        driver.availableSeats = capacity - 1;
      }
    }
    driver.verificationStatus = 'pending';
    
    console.log('Attempting driver.save()...');
    const saved = await driver.save();
    console.log('SUCCESS:', saved);
  } catch (err) {
    console.error('ERROR CAUGHT:', err);
  } finally {
    process.exit(0);
  }
})();
