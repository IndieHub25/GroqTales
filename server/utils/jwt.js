const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET_NOT_CONFIGURED');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '1h',
  });
}

function signRefreshToken(payload) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET_NOT_CONFIGURED');
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

function verifyAccessToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET_NOT_CONFIGURED');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET_NOT_CONFIGURED');
  }
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
