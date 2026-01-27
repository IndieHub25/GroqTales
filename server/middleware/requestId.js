/**
 * Request ID Middleware
 * Attaches unique correlation IDs to all incoming requests
 * Enables tracing of requests across multiple services
 *
 * Usage:
 *   const requestIdMiddleware = require('./middleware/requestId');
 *   app.use(requestIdMiddleware);
 */

const { v4: uuidv4 } = require('uuid');

const requestIdMiddleware = (req, res, next) => {
  // Check if request already has an ID (from upstream service)
  const incomingId = req.headers['x-request-id'];
  
  // Use existing ID or generate new one
  const requestId = incomingId || uuidv4().substring(0, 13);
  
  // Attach to request object
  req.id = requestId;
  
  // Add to response headers so client can track request
  res.setHeader('X-Request-ID', requestId);
  
  // Record request start time for duration calculations
  req.startTime = Date.now();
  
  next();
};

module.exports = requestIdMiddleware;
