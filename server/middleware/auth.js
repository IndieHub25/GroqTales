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

module.exports = {
  authRequired,
  refresh,
};
