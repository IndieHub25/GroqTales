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
  'https://www.comiccrafts.xyz',
  'https://comiccrafts.xyz',
  'https://groqtales.pages.dev',
  'https://drago.groqtales.pages.dev',
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
 * Uses proper URL parsing and hostname comparison to prevent spoofing attacks
 * (e.g., groqtales.xyz.evil.com, fakevercel.app.attacker.com)
 * 
 * @param {string|undefined} origin - The origin header from the request
 * @param {function} callback - Express cors callback(err, allow)
 */
function corsOriginCallback(origin, callback) {
  // Allow requests with no origin (Swagger UI, curl, server-to-server)
  if (!origin) return callback(null, true);

  try {
    // Parse the origin URL to extract hostname
    const originUrl = new URL(origin);
    const hostname = originUrl.hostname;

    // Check for exact match with allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = normalizeOrigin(allowed);
      const normalizedIncomingOrigin = normalizeOrigin(origin);

      // Exact match (after normalization)
      if (normalizedIncomingOrigin === normalizedAllowed) return true;

      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    // Check for Vercel preview deployments (allow all *.vercel.app)
    // Use proper hostname matching: exact match or subdomain
    if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Check for Cloudflare Pages preview deployments (allow all *.pages.dev)
    // Use proper hostname matching: exact match or subdomain
    if (hostname === 'pages.dev' || hostname.endsWith('.pages.dev')) {
      return callback(null, true);
    }

    // Origin not allowed
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  } catch (err) {
    // Invalid origin URL
    console.warn(`[CORS] Invalid origin URL: ${origin}`);
    return callback(new Error('Invalid origin'), false);
  }
}

module.exports = {
  allowedOrigins,
  corsOriginCallback,
};
