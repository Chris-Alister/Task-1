const express = require('express');
const router = express.Router();
const {
  login,
  registerTeacher,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login - Login for teachers and admins
router.post('/login', login);

// POST /api/auth/register - Register new teacher (admin only)
router.post('/register', registerTeacher);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authMiddleware, updateProfile);

module.exports = router; 