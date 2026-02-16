const express = require('express');
const router = express.Router();
const ms = require('ms');
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');
const { refresh } = require('../middleware/auth');
const logger = require('../utils/logger');

const REFRESH_TIME_MS = ms(process.env.JWT_REFRESH_EXPIRES || '7d');

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User signup
 *     description: Creates a new user account and returns user details with an access token. A refresh token is set in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [user, admin,moderator]
 *                 example: user
 *               adminSecret:
 *                 type: string
 *                 description: Required only if role is admin
 *                 example: adminSecretKey
 *     responses:
 *       200:
 *         description: Signup successful.
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signup successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 65f1c9e2d3a4b567890abc12
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: user@example.com
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         role:
 *                           type: string
 *                           example: user
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing required fields or missing admin secret.
 *       403:
 *         description: Invalid admin secret.
 *       409:
 *         description: Email already registered.
 *       500:
 *         description: Internal server error.
 */

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
      logger.warn(
        'Signup validation failed: missing admin secret for admin role',
        {
          requestId: req.id,
        }
      );
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
    logger.error('Signup failed', {
      requestId: req.id,
      component: 'auth/signup',
      code: error.code,
    });
    console.log(error)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ message: 'Internal Server error' });
  }
});


/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: logs into user account and returns user details with an access token. A refresh token is set in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: Signup successful.
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 65f1c9e2d3a4b567890abc12
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: user@example.com
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         role:
 *                           type: string
 *                           example: user
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Login failed invalid credentials.
 *       500:
 *         description: Internal server error.
 */

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
    const user = await User.findOne({ email }).select('+password');
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
    logger.error('Login failed', {
      requestId: req.id,
      component: 'auth/login',
    });
    console.log(error);
    return res.status(500).json({ message: 'Internal Server error' });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Generates a new access token using the refresh token stored in HTTP-only cookies.
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Missing, invalid, or expired refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid or expired refresh token
 *       501:
 *         description: Authentication not configured (JWT secret missing).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Authentication not configured
 */
// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', refresh);

// // POST /api/v1/auth/logout - User logout
// router.post('/logout', async (req, res) => {});

// // get /api/v1/auth/me - Get current user
// router.get('/me', async (req, res) => {});

module.exports = router;
