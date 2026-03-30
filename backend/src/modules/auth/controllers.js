const User = require('../../models/User');
const { generateToken } = require('../../utils/auth');
const nodemailer = require('nodemailer');
const Driver = require('../../models/Driver');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const registrationOtpStore = new Map(); // In-memory OTP storage for registration


// Placeholder Mailer - Should use real Gmail/Sendgrid credentials in .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendRegistrationOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await User.findOne({ 'email.address': email });
    if (userExists) return res.status(400).json({ success: false, message: 'Terminal record already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    registrationOtpStore.set(email, { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await transporter.sendMail({
      from: '"RouteSync Security" <noreply@routesync.com>',
      to: email,
      subject: 'RouteSync Registration Pin',
      text: `Your Registration Node Pin is: ${otp}. Valid for 10 minutes.`
    });

    res.json({ success: true, message: 'Registration Pin transmitted' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ success: false, message: 'Mail Relay Failure' });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, phone, password, role, otp, vehicleNumber, vehicleModel, vehicleType, capacity } = req.body;
  try {
    // Validate Registration OTP
    const storedOtp = registrationOtpStore.get(email);
    if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
       return res.status(400).json({ success: false, message: 'Invalid or Expired Registration Pin' });
    }

    const userExists = await User.findOne({ $or: [{ 'email.address': email }, { 'phone.number': phone }] });
    if (userExists) return res.status(400).json({ success: false, message: 'Terminal record already exists' });

    const user = await User.create({ name, email: { address: email, isVerified: true }, phone: { number: phone }, password, role });
    registrationOtpStore.delete(email); // clear OTP

    // If driver, instantly initialize Driver Matrix Node
    if (role === 'driver') {
       await Driver.create({
         userId: user._id,
         vehicle: {
           number: vehicleNumber || 'PENDING',
           type: vehicleType || 'auto',
           model: vehicleModel || 'Standard Node',
           capacity: capacity ? parseInt(capacity) : 3
         },
         availableSeats: capacity ? parseInt(capacity) : 3
       });
    }

    res.status(201).json({ success: true, message: 'Profile Initialized', data: { _id: user._id, name: user.name, email: user.email.address, role: user.role, profilePhoto: user.profilePhoto?.url, token: generateToken(user._id) } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 'email.address': email });
    if (user && (await user.comparePassword(password))) {
      res.json({ success: true, message: 'Node unlocked', data: { _id: user._id, name: user.name, email: user.email.address, role: user.role, profilePhoto: user.profilePhoto?.url, token: generateToken(user._id) } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ 'email.address': email });
    if (user) {
      user.googleId = sub;
      user.profilePhoto = { url: picture };
    } else {
      user = await User.create({ name, email: { address: email, isVerified: true }, googleId: sub, profilePhoto: { url: picture }, role: 'passenger' });
    }
    await user.save();
    res.json({ success: true, message: 'Google Link Established', data: { _id: user._id, name: user.name, email: user.email.address, role: user.role, profilePhoto: user.profilePhoto?.url, token: generateToken(user._id) } });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(401).json({ success: false, message: 'Google Link Failure' });
  }
};

exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ 'email.address': email });
    if (!user) return res.status(404).json({ success: false, message: 'Terminal user not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min
    await user.save();

    await transporter.sendMail({
      from: '"RouteSync Security" <noreply@routesync.com>',
      to: email,
      subject: 'Authorization Pin Request',
      text: `Your RouteSync Security Pin is: ${otp}. Valid for 10 minutes.`
    });

    res.json({ success: true, message: 'Secure Pin transmitted' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ success: false, message: 'Mail Relay Failure' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ 'email.address': email });
    if (!user || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or Expired Pin' });
    }
    user.password = newPassword;
    user.otp = undefined;
    await user.save();
    res.json({ success: true, message: 'Secure Pin Updated' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, message: 'Terminal Protocol Failure' });
  }
};

exports.getAuthProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let driverData = null;
    if (user.role === 'driver') {
      driverData = await Driver.findOne({ userId: user._id });
    }
    res.json({ success: true, data: { ...user.toObject(), driverDetails: driverData } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to access Profile Node' });
  }
};

exports.updateAuthProfile = async (req, res) => {
  const { name, phone, role, vehicleNumber, vehicleType, vehicleModel, capacity } = req.body;
  try {
    const user = await User.findById(req.user._id);
    console.log(user)
    if (name) user.name = name;
    if (phone) user.phone = { number: phone, isVerified: user.phone?.isVerified || false };
    if (role && user.role !== 'admin') user.role = role;
    await user.save();

    if (user.role === 'driver') {
       let driver = await Driver.findOne({ userId: user._id });
       if (!driver) {
         driver = new Driver({ userId: user._id, vehicle: { number: vehicleNumber || 'PENDING', type: vehicleType || 'auto', model: vehicleModel || 'Standard', capacity: capacity || 3 }, availableSeats: capacity || 3 });
       } else {
         if (vehicleNumber) driver.vehicle.number = vehicleNumber;
         if (vehicleType) driver.vehicle.type = vehicleType;
         if (vehicleModel) driver.vehicle.model = vehicleModel;
         if (capacity) {
           const parsedCapacity = parseInt(capacity);
           driver.vehicle.capacity = parsedCapacity;
           driver.availableSeats = parsedCapacity > 0 ? parsedCapacity : 3;
         }
       }
       // Reset verification logic if car details physically change
       if (vehicleNumber) driver.verificationStatus = 'pending';
       await driver.save();
    }

    res.json({ success: true, message: 'Profile Matrix Synchronized', data: { _id: user._id, name: user.name, email: user.email.address, role: user.role, profilePhoto: user.profilePhoto?.url, token: generateToken(user._id) } });
  } catch (error) {
    console.error('Driver Update Error:', error);
    res.status(500).json({ success: false, message: 'Profile Sync Failure' });
  }
};
