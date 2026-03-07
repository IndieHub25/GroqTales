/**
 * Auth Routes — Supabase Authentication
 * Handles user signup, login, and token refresh via Supabase Auth
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');
const { refresh } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User signup
 *     description: |
 *       Creates a new user account via Supabase Auth and auto-creates a profile.
 *       Returns user details with access and refresh tokens.
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
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *                 example: user
 *               adminSecret:
 *                 type: string
 *                 description: Required only if role is admin
 *     responses:
 *       200:
 *         description: Signup successful.
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
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Missing required fields or missing admin secret.
 *       403:
 *         description: Invalid admin secret.
 *       409:
 *         description: Email already registered.
 *       500:
 *         description: Internal server error.
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, adminSecret } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Admin role check
    let assignedRole = 'user';
    if (role === 'admin') {
      if (!adminSecret) {
        return res.status(400).json({ error: 'Missing admin secret for admin role' });
      }
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Invalid admin secret' });
      }
      assignedRole = 'admin';
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        firstName: firstName || 'Anonymous',
        lastName: lastName || 'Creator',
        name: `${firstName || 'Anonymous'} ${lastName || 'Creator'}`.trim(),
        role: assignedRole,
      },
    });

    if (authError) {
      if (authError.message?.includes('already') || authError.status === 422) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      logger.error('Supabase signup error:', authError);
      return res.status(500).json({ error: authError.message });
    }

    // Sign in to get tokens
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      logger.error('Supabase sign-in after signup error:', signInError);
      // User created but sign-in failed — still return success
      return res.json({
        message: 'Signup successful. Please log in.',
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
            firstName: firstName || 'Anonymous',
            lastName: lastName || 'Creator',
            role: assignedRole,
          },
        },
      });
    }

    logger.info('User signup successful', { userId: authData.user.id, role: assignedRole });

    return res.json({
      message: 'Signup successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          firstName: firstName || 'Anonymous',
          lastName: lastName || 'Creator',
          role: assignedRole,
        },
        tokens: {
          accessToken: signInData.session?.access_token,
          refreshToken: signInData.session?.refresh_token,
        },
      },
    });
  } catch (error) {
    logger.error('Signup failed', { error: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: |
 *       Authenticates a user via Supabase Auth and returns access + refresh tokens.
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
 *         description: Login successful.
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
 *                     tokens:
 *                       type: object
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Login failed: invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = data.user;
    logger.info('User login successful', { userId: user.id });

    return res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.firstName || user.user_metadata?.name?.split(' ')[0] || 'Anonymous',
          lastName: user.user_metadata?.lastName || '',
          role: user.user_metadata?.role || 'user',
        },
        tokens: {
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
        },
      },
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Token refresh is handled by the Supabase client-side SDK.
 *       This endpoint returns guidance on how to refresh tokens.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       501:
 *         description: Use Supabase client for token refresh.
 */
router.post('/refresh', refresh);

module.exports = router;
