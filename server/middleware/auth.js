/**
 * Authentication Middleware — Supabase JWT Verification
 * 
 * Verifies Supabase JWT tokens from the Authorization header.
 * Sets req.user with { id, email, role } from the Supabase user.
 */

const { supabaseAdmin } = require('../config/supabase');

const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Authentication service not configured' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Set req.user for downstream handlers
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      walletAddress: user.user_metadata?.walletAddress || null,
      raw: user,
    };

    // Store the token for creating per-user Supabase clients
    req.supabaseToken = token;

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing refresh token' });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Authentication service not configured' });
    }

    // Note: Supabase token refresh is typically done client-side.
    // This endpoint exists for compatibility with the existing frontend flow.
    return res.status(501).json({
      success: false,
      message: 'Token refresh should be done through the Supabase client. Use supabase.auth.refreshSession().',
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded; // { id, role }

      // Specifically check for the hardcoded superadmin email
      const User = require('../models/User'); // Delay require to avoid circular dependency
      const user = await User.findById(req.user.id).select('email isAdmin role');

      if (!user || user.email !== 'indiehubexe@gmail.com') {
        return res.status(403).json({ success: false, error: 'Forbidden. Superadmin access strictly required.' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Superadmin Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
};

module.exports = {
  authRequired,
  refresh,
  isSuperAdmin,
};
