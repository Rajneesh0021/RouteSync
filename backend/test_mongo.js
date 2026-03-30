const mongoose = require('mongoose');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('connected');
  const d = await Driver.findOne({ vehicle: { $exists: true } });
  console.log('Driver doc:', d);
  process.exit(0);
}).catch(console.error);
