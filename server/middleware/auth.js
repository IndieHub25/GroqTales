/**
 * Authentication and Authorization Middleware
 * Handles user authentication and permission checks for comics
 */

const {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} = require('../utils/jwt.js');

const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    // if (!process.env.JWT_SECRET) {
    //   return res
    //     .status(501)
    //     .json({ success: false, error: 'Authentication not configured' });
    // }
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded; // { id, role }
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
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
  const token = req.cookies.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Missing refresh token' });
  }

  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      return res
        .status(501)
        .json({ success: false, error: 'Authentication not configured' });
    }
    const decoded = verifyRefreshToken(token);

    const newAccessToken = signAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
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
