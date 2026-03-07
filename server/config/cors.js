/**
 * CORS Configuration
 * Centralized CORS configuration shared by backend.js and sdk-server.js
 * 
 * Exports the allowedOrigins array and corsOriginCallback function
 * to ensure consistent CORS validation across all servers and tests.
 */

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://groqtales-backend-api.onrender.com',
  'https://groqtales.vercel.app',
  'https://groqtales-git-main-indie-hub25s-projects.vercel.app',
  'https://www.groqtales.xyz',
  'https://groqtales.xyz',
  'https://groqtales.pages.dev',
  'https://groqtales.netlify.app',
].filter(Boolean); // Remove undefined/null entries from env vars

/**
 * Normalize an origin string by removing trailing slashes
 * @param {string} origin - The origin to normalize
 * @returns {string} - Normalized origin
 */
function normalizeOrigin(origin) {
  if (!origin) return origin;
  return origin.replace(/\/$/, ''); // Remove trailing slash if present
}

/**
 * CORS origin callback for express-cors
 * Performs exact equality checks after normalization to prevent
 * security issues with startsWith matching (e.g., groqtales.xyz.evil.com)
 * 
 * @param {string|undefined} origin - The origin header from the request
 * @param {function} callback - Express cors callback(err, allow)
 */
function corsOriginCallback(origin, callback) {
  // Allow requests with no origin (Swagger UI, curl, server-to-server)
  if (!origin) return callback(null, true);

  const normalizedIncomingOrigin = normalizeOrigin(origin);

  // Check for exact match with allowed origins
  const isAllowed = allowedOrigins.some(allowed => {
    const normalizedAllowed = normalizeOrigin(allowed);
    
    // Exact match (after normalization)
    if (normalizedIncomingOrigin === normalizedAllowed) return true;
    
    // Check for Vercel preview deployments (allow all *.vercel.app)
    if (origin.includes('vercel.app')) return true;
    
    // Check for Cloudflare Pages preview deployments (allow all *.pages.dev)
    if (origin.includes('pages.dev')) return true;
    
    return false;
  });

  if (isAllowed) {
    return callback(null, true);
  }

  console.warn(`[CORS] Blocked origin: ${origin}`);
  return callback(new Error('Not allowed by CORS'));
}

module.exports = {
  allowedOrigins,
  corsOriginCallback,
};
