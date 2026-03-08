/**
 * Correlation ID Middleware
 * Generates or extracts X-Request-ID for request tracing across logs
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

function correlationIdMiddleware(req, res, next) {
  // Check for existing correlation ID in header or generate new one
  const correlationId = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request for downstream use
  req.correlationId = correlationId;
  
  // Add to response headers for client tracing
  res.setHeader('X-Request-ID', correlationId);
  
  // Attach to logger context if logger supports it
  if (logger && typeof logger.setMeta === 'function') {
    logger.setMeta({ correlationId, timestamp: new Date().toISOString() });
  }
  
  // Log request start
  logger.info(`[${correlationId}] ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Capture response end for logging
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    logger.info(`[${correlationId}] Response: ${res.statusCode}`, {
      duration: Date.now() - req._startTime,
      size: JSON.stringify(body).length,
    });
    return originalJson(body);
  };
  
  req._startTime = Date.now();
  
  next();
}

module.exports = correlationIdMiddleware;
