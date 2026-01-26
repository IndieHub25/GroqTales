const express = require('express');
const router = express.Router();
const ms = require('ms');
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { refresh } = require('../middleware/auth');

const REFRESH_TIME_MS = ms(process.env.JWT_REFRESH_EXPIRES || '7d');

// POST /api/v1/auth/signup - User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, adminSecret } =
      req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (role === 'admin' && !adminSecret) {
      return res
        .status(400)
        .json({ error: 'Missing admin secret for admin role' });
    }

    const exists = await User.findOne({ email }).exec();
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let assignedRole = 'user';

    if (role === 'admin') {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Invalid admin secret' });
      }
      assignedRole = 'admin';
    }
    const user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: assignedRole,
      walletAddress: walletAddress || null, // Capture wallet if provided
      username: email.split('@')[0],
    });

    await user.save();

    const accessToken = signAccessToken({ id: user._id, role: assignedRole });
    const refreshToken = signRefreshToken({ id: user._id, role: assignedRole });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      path: '/api/v1/auth',
      maxAge: REFRESH_TIME_MS, // 7 days
    });

    return res.json({
      message: 'Signup successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: assignedRole,
        },
        tokens: { accessToken },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res
      .status(500)
      .json({ message: 'Internal Server error' });
  }
});

// POST /api/v1/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const okPw = await user.comparePassword(password);
    if (!okPw) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id, role: user.role });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      path: '/api/v1/auth',
      maxAge: REFRESH_TIME_MS, // 7 days
    });

    return res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens: { accessToken },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal Server error' });
  }
});

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', refresh);

// // POST /api/v1/auth/logout - User logout
// router.post('/logout', async (req, res) => {});

// // get /api/v1/auth/me - Get current user
// router.get('/me', async (req, res) => {});

module.exports = router;
