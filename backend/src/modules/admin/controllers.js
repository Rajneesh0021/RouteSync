const User = require('../../models/User');
const Driver = require('../../models/Driver');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Dashboard Stats & Lists)
// @route   GET /admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered Drivers & Telemetry
// @route   GET /admin/drivers
// @access  Private (Admin/Employee)
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('userId', 'name email phone status').sort({ createdAt: -1 });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify/Update Driver Hardware Telemetry Status
// @route   PUT /admin/drivers/:id/verify
// @access  Private (Admin/Employee)
const verifyDriver = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    );
    if (!driver) return res.status(404).json({ success: false, message: 'Driver node not found' });
    res.json({ success: true, message: `Driver validation set to ${status}`, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Employee Node
// @route   POST /admin/employees
// @access  Private (Admin)
const addEmployee = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ 'email.address': email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const employee = await User.create({
      name,
      email: { address: email, isVerified: true },
      password,
      role: 'employee'
    });

    res.status(201).json({ success: true, message: 'Employee Node authorized successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getDrivers, verifyDriver, addEmployee };
