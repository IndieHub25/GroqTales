const express = require('express');
const router = express.Router();
const ms = require('ms');
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { refresh } = require('../middleware/auth');
const logger = require('../utils/logger');

const REFRESH_TIME_MS = ms(process.env.JWT_REFRESH_EXPIRES || '7d');

// POST /api/v1/auth/signup - User signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, adminSecret } =
      req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      logger.warn('Signup validation failed: missing required fields', {
        requestId: req.id,
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (role === 'admin' && !adminSecret) {
      logger.warn('Signup validation failed: missing admin secret for admin role', {
        requestId: req.id,
      });
      return res
        .status(400)
        .json({ error: 'Missing admin secret for admin role' });
    }

    const exists = await User.findOne({ email }).exec();
    if (exists) {
      logger.warn('Signup failed: email already registered', {
        requestId: req.id,
      });
      return res.status(409).json({ error: 'Email already registered' });
    }

    let assignedRole = 'user';

    if (role === 'admin') {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        logger.warn('Signup failed: invalid admin secret', {
          requestId: req.id,
        });
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
    });

    await user.save();

    logger.info('User signup successful', {
      requestId: req.id,
      userId: user._id.toString(),
      email: user.email,
      role: assignedRole,
    });

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
    logger.error('Signup error', {
      requestId: req.id,
      error: error.message,
      code: error.code,
    });
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res
      .status(500)
      .json({ message: 'Internal Server error'});
  }
});

// POST /api/v1/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn('Login validation failed: missing email or password', {
        requestId: req.id,
      });
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: invalid credentials', {
        requestId: req.id,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const okPw = await user.comparePassword(password);
    if (!okPw) {
      logger.warn('Login failed: invalid credentials', {
        requestId: req.id,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    logger.info('User login successful', {
      requestId: req.id,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

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
    logger.error('Login error', {
      requestId: req.id,
      error: error.message,
    });
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
