const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  googleLogin, 
  requestOTP, 
  resetPassword,
  sendRegistrationOTP,
  getAuthProfile,
  updateAuthProfile
} = require('./controllers');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/send-registration-otp', sendRegistrationOTP);
router.post('/otp/request', requestOTP);
router.post('/password/reset', resetPassword);

router.get('/profile', protect, getAuthProfile);
router.put('/profile', protect, updateAuthProfile);

module.exports = router;
