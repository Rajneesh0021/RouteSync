require('dotenv').config({ path: '../../.env' }); // Relative from src/utils
const mongoose = require('mongoose');
const User = require('../models/User');

const setupAdmin = async () => {
  try {
    // Determine path simply by relying on env variables configured in script execution
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pkalani:eDVX4YjXJMGE8hvp@com24v1.vbpzj.mongodb.net/routesync');
    
    // Check if admin exists
    const adminExists = await User.findOne({ 'email.address': 'admin@routesync.com' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email.address);
      process.exit(0);
    }
    
    // Create new admin
    const admin = await User.create({
      name: 'System Admin',
      email: { address: 'admin@routesync.com', isVerified: true },
      password: 'password123',
      role: 'admin'
    });
    
    console.log('✅ Default Admin created successfully');
    console.log('-------------------------');
    console.log('Email: admin@routesync.com');
    console.log('Password: password123');
    console.log('-------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up admin:', err);
    process.exit(1);
  }
};

setupAdmin();
