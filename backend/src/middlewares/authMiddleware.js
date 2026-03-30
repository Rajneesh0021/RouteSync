const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || req.user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Node Blocked or Terminated by System Command' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.name);
      // Clean 401 response for frontend to trigger logout if expired/malformed
      return res.status(401).json({ 
        success: false, 
        message: error.name === 'TokenExpiredError' ? 'Terminal session expired' : 'Unauthorized terminal Access' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, No session token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this terminal`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
