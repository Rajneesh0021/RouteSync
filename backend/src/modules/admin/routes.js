const express = require('express');
const { getUsers, getDrivers, verifyDriver, addEmployee } = require('./controllers');
const { protect, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

// All Admin routes require authentication
router.use(protect);

// Dashboard routes (Admin strictly)
router.get('/users', authorize('admin'), getUsers);
router.post('/employees', authorize('admin'), addEmployee);

// Management routes (Admin & Employee)
router.get('/drivers', authorize('admin', 'employee'), getDrivers);
router.put('/drivers/:id/verify', authorize('admin', 'employee'), verifyDriver);

module.exports = router;
