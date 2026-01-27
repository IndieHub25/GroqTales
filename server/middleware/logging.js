/**
 * Comprehensive Logging Middleware
 * Logs all HTTP requests and responses with context
 * Works in conjunction with Morgan for detailed metrics
 *
 * Usage:
 *   const loggingMiddleware = require('./middleware/logging');
 *   app.use(loggingMiddleware);
 */

const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  const { id: requestId, method, path, ip } = req;
  const userId = req.user?.id || 'anonymous';

  // Monitor when response is finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      requestId,
      method,
      path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId,
      ip
    });
  });

  next();
};

module.exports = loggingMiddleware;
