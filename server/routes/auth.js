/**
 * Auth Routes — Supabase Authentication
 * Handles user signup, login, and token refresh via Supabase Auth
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');
const { refresh } = require('../middleware/auth');
const crypto = require('crypto');
const { verifyMessage } = require('ethers');

// In-memory challenge nonce store for SIWE-like wallet login
const nonceStore = new Map();

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
/**
 * GET /api/v1/auth/nonce
 * Returns a secure challenge nonce for wallet authentication.
 */
router.get('/nonce', (req, res) => {
  const { address } = req.query;
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const normalizedAddress = address.toLowerCase().trim();
  const nonce = crypto.randomBytes(32).toString('hex');
  nonceStore.set(normalizedAddress, nonce);

  setTimeout(() => {
    if (nonceStore.get(normalizedAddress) === nonce) {
      nonceStore.delete(normalizedAddress);
    }
  }, 5 * 60 * 1000); // 5 minutes expiration

  return res.json({ nonce });
});

// ─── Wallet Login ────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/wallet-login
 * Creates or finds a Supabase user by wallet address, returns session tokens.
 */
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'Signature is required for verification' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const normalizedAddress = address.toLowerCase().trim();

    // Verify signature against nonce
    const nonce = nonceStore.get(normalizedAddress);
    if (!nonce) {
      return res.status(401).json({ error: 'Invalid or expired nonce. Please request a new nonce.' });
    }

    const expectedMessage = `Sign this message to authenticate with Comicraft. Nonce: ${nonce}`;
    let recoveredAddress;
    try {
      recoveredAddress = verifyMessage(expectedMessage, signature);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid signature format' });
    }

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Clear used nonce
    nonceStore.delete(normalizedAddress);

    const walletEmail = `${normalizedAddress}@wallet.comicraft.xyz`;
    // Use a deterministic password derived from the wallet address for Supabase Auth
    const walletPassword = `wallet_${normalizedAddress}_${process.env.JWT_SECRET || 'comicraft'}`;

    // Try to sign in first (existing user)
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (!signInError && signInData?.session) {
      // Existing wallet user — return tokens
      const user = signInData.user;
      logger.info('Wallet login successful (existing)', { userId: user.id, wallet: normalizedAddress });

      return res.json({
        message: 'Wallet login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            walletAddress: normalizedAddress,
            firstName: user.user_metadata?.firstName || 'Wallet',
            lastName: user.user_metadata?.lastName || 'User',
            role: user.user_metadata?.role || 'user',
          },
          tokens: {
            accessToken: signInData.session.access_token,
            refreshToken: signInData.session.refresh_token,
          },
        },
      });
    }

    // User does not exist — create one
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: walletEmail,
      password: walletPassword,
      email_confirm: true,
      user_metadata: {
        walletAddress: normalizedAddress,
        firstName: 'Wallet',
        lastName: 'User',
        name: `Wallet ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
        role: 'user',
        loginMethod: 'wallet',
      },
    });

    if (createError) {
      logger.error('Wallet user creation failed:', createError);
      return res.status(500).json({ error: 'Failed to create wallet user' });
    }

    // Now sign in to get session tokens
    const { data: newSignIn, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (newSignInError || !newSignIn?.session) {
      logger.error('Wallet sign-in after creation failed:', newSignInError);
      return res.status(500).json({ error: 'Wallet user created, but session creation failed. Please try connecting again.' });
    }

    // Create profile entry
    await supabaseAdmin.from('profiles').upsert({
      id: createData.user.id,
      username: `wallet_${normalizedAddress.slice(2, 10)}`,
      display_name: `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
      wallet_address: normalizedAddress,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    logger.info('Wallet login successful (new user)', { userId: createData.user.id, wallet: normalizedAddress });

    return res.json({
      message: 'Wallet login successful',
      data: {
        user: {
          id: createData.user.id,
          email: walletEmail,
          walletAddress: normalizedAddress,
          firstName: 'Wallet',
          lastName: 'User',
          role: 'user',
        },
        tokens: {
          accessToken: newSignIn.session.access_token,
          refreshToken: newSignIn.session.refresh_token,
        },
      },
    });
  } catch (error) {
    logger.error('Wallet login failed:', { error: error.message });
    return res.status(500).json({ error: 'Wallet login failed' });
  }
});

// ─── Login with Username ────────────────────────────────────────────
/**
 * POST /api/v1/auth/login-username
 * Looks up email from username, then authenticates via Supabase.
 */
router.post('/login-username', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    let loginEmail = identifier;
    const isEmail = typeof identifier === 'string' && identifier.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(identifier);

    if (!isEmail) {
      // Look up email from username via profiles table
      const { data: profile, error: lookupError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

      if (lookupError || !profile?.email) {
        return res.status(401).json({ error: 'Invalid login credentials' });
      }
      loginEmail = profile.email;
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const user = data.user;

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
    logger.error('Username login failed:', { error: error.message });
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Get Current User ────────────────────────────────────────────────
/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user's profile.
 */
const { authRequired } = require('../middleware/auth');

router.get('/me', authRequired, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Fetch profile from profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    return res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      walletAddress: req.user.walletAddress,
      profile: profile || null,
      firstName: profile?.first_name || profile?.display_name || req.user.raw?.user_metadata?.firstName || 'Anonymous',
      lastName: profile?.last_name || req.user.raw?.user_metadata?.lastName || '',
      username: profile?.username || null,
      displayName: profile?.display_name || null,
      avatarUrl: profile?.avatar_url || null,
      bio: profile?.bio || null,
    });
  } catch (error) {
    logger.error('Get /me failed:', { error: error.message });
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.post('/refresh', refresh);

module.exports = router;
