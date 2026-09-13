const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../utils/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const admin = await Admin.findOne({ username: cleanUsername });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_certificate_jwt_key_2026';
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication: ' + err.message
    });
  }
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: req.admin
  });
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password_hash = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + err.message
    });
  }
});

module.exports = router;
