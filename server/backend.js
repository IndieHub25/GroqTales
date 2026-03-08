/**
 * GroqTales Backend API Server
 *
 * Express.js server for handling API requests, SDK endpoints,
 * and backend services for the GroqTales platform.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { corsOriginCallback } = require('./config/cors');
// MongoDB is now required again for Vector Search
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('./utils/logger');
const requestIdMiddleware = require('./middleware/requestId');
const correlationIdMiddleware = require('./middleware/correlation-id');
const loggingMiddleware = require('./middleware/logging');
const { connectDB, closeDB } = require('./config/db');
const { checkSupabaseHealth, SUPABASE_URL } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind Render/Cloudflare load balancers
app.set('trust proxy', 1);

// Super-fast, dependency-free health endpoint for Render liveness probes
app.get('/healthz', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /healthz - 200 OK`);
  res.status(200).send('OK');
});

// Store server reference for graceful shutdown
let server;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GroqTales Backend API',
      version: process.env.API_VERSION || '1.2.0',
      description:
        'Complete REST API for the GroqTales AI-powered storytelling platform. ' +
        'Covers authentication, story management, AI generation, NFT operations, ' +
        'user profiles, helpbot chat, feed proxy, and settings management.',
      contact: {
        name: 'Indie Hub',
        url: 'https://github.com/IndieHub25/GroqTales',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.PROD_URL || 'https://groqtales-backend-api.onrender.com/api',
        description: 'Production',
      },
    ],
    tags: [
      { name: 'Health', description: 'Server & service health checks' },
      { name: 'Authentication', description: 'User signup, login, token refresh, and logout' },
      { name: 'Stories', description: 'Story CRUD, search, and AI generation' },
      { name: 'AI', description: 'AI-powered content generation and analysis' },
      { name: 'Users', description: 'User profiles and account management' },
      { name: 'Feed', description: 'Public story feed (proxied from Cloudflare D1)' },
      { name: 'Helpbot', description: 'MADHAVA AI help bot chat (proxied to CF Worker)' },
      { name: 'Settings', description: 'User settings: profile, notifications, privacy, wallet' },
      { name: 'NFT', description: 'NFT minting, marketplace, and royalty operations' },
      { name: 'Wallets', description: 'User wallet management, balances, and CRAFTS transfers' },
      { name: 'Marketplace', description: 'NFT marketplace — list, buy, cancel, and browse listings in CRAFTS' },
      { name: 'Comics', description: 'Comic creation and management' },
      { name: 'SDK', description: 'External SDK integration endpoints' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token obtained from /api/v1/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message', example: 'Something went wrong' },
            code: { type: 'string', description: 'Machine-readable error code', example: 'VALIDATION_ERROR' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            pages: { type: 'integer', example: 5 },
          },
        },
        DatabaseStatus: {
          type: 'object',
          description: 'Real-time database connection diagnostics',
          properties: {
            configured: { type: 'boolean', description: 'Whether MONGODB_URI environment variable is set', example: true },
            connected: { type: 'boolean', description: 'Whether a live connection to MongoDB is active', example: true },
            readyState: { type: 'integer', description: '0=disconnected, 1=connected, 2=connecting, 3=disconnecting', example: 1 },
            host: { type: 'string', description: 'MongoDB host (only shown when connected)', example: 'cluster0-shard-00-00.mongodb.net' },
            note: { type: 'string', description: 'Human-readable explanation of current state', example: 'MONGODB_URI not set — running in no-db mode' },
          },
        },
        MemoryUsage: {
          type: 'object',
          description: 'Node.js process memory breakdown',
          properties: {
            rss: { type: 'string', description: 'Resident Set Size — total memory allocated', example: '54.2 MB' },
            heapUsed: { type: 'string', description: 'V8 heap memory actively in use', example: '28.1 MB' },
            heapTotal: { type: 'string', description: 'Total V8 heap allocated', example: '36.4 MB' },
            external: { type: 'string', description: 'Memory used by C++ objects bound to JS', example: '2.3 MB' },
            arrayBuffers: { type: 'string', description: 'Memory for ArrayBuffers and SharedArrayBuffers', example: '1.1 MB' },
          },
        },
        ServiceStatuses: {
          type: 'object',
          description: 'Availability status of each backend service',
          properties: {
            api: { type: 'string', enum: ['online'], example: 'online' },
            database: { type: 'string', enum: ['online', 'offline', 'not configured'], example: 'online' },
            helpbot: { type: 'string', enum: ['online', 'offline'], example: 'online' },
          },
        },
        HealthResponse: {
          type: 'object',
          description: 'Comprehensive real-time server health diagnostics',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded'], description: 'Overall health verdict', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of this check' },
            version: { type: 'string', description: 'API version identifier', example: 'v1' },
            environment: { type: 'string', description: 'Runtime environment', example: 'production' },
            uptime: { type: 'string', description: 'Human-readable server uptime', example: '2h 14m 33s' },
            pid: { type: 'integer', description: 'Process ID of the running server', example: 12345 },
            hostname: { type: 'string', description: 'Machine hostname', example: 'groqtales-api-01' },
            nodeVersion: { type: 'string', description: 'Node.js runtime version', example: 'v20.18.0' },
            platform: { type: 'string', description: 'Operating system platform', example: 'linux' },
            arch: { type: 'string', description: 'CPU architecture', example: 'x64' },
            cpuUsage: {
              type: 'object',
              description: 'Cumulative CPU time consumed by the process',
              properties: {
                user: { type: 'string', description: 'User CPU time', example: '1.24s' },
                system: { type: 'string', description: 'System CPU time', example: '0.31s' },
              },
            },
            database: { $ref: '#/components/schemas/DatabaseStatus' },
            memory: { $ref: '#/components/schemas/MemoryUsage' },
            services: { $ref: '#/components/schemas/ServiceStatuses' },
            rateLimit: {
              type: 'object',
              description: 'Current API rate limiting configuration',
              properties: {
                windowMs: { type: 'integer', description: 'Rate limit window in milliseconds', example: 900000 },
                maxRequestsPerWindow: { type: 'integer', description: 'Max requests allowed per window per IP', example: 100 },
              },
            },
          },
        },
        BotHealthResponse: {
          type: 'object',
          description: 'MADHAVA AI helpbot availability and configuration',
          properties: {
            status: { type: 'string', enum: ['healthy', 'down'], description: 'Bot availability status', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp' },
            service: { type: 'string', description: 'Service name', example: 'madhava-helpbot' },
            provider: { type: 'string', description: 'AI inference provider', example: 'Groq' },
            model: { type: 'string', description: 'Configured AI model identifier', example: 'llama-3.3-70b-versatile' },
            configuredEndpoint: { type: 'boolean', description: 'Whether the Cloudflare Worker URL is configured', example: true },
            responseTimeMs: { type: 'integer', description: 'Time taken to perform this health check (ms)', example: 3 },
          },
        },
        WelcomeResponse: {
          type: 'object',
          description: 'API landing page — overview and navigation',
          properties: {
            name: { type: 'string', example: 'GroqTales Backend API' },
            description: { type: 'string', example: 'AI-powered Web3 storytelling platform — REST API' },
            status: { type: 'string', enum: ['operational', 'degraded', 'maintenance'], example: 'operational' },
            version: { type: 'string', example: 'v1' },
            timestamp: { type: 'string', format: 'date-time' },
            environment: { type: 'string', example: 'production' },
            uptime: { type: 'string', example: '2h 14m 33s' },
            endpoints: {
              type: 'object',
              description: 'Available API endpoint groups',
            },
            links: {
              type: 'object',
              properties: {
                documentation: { type: 'string', example: '/api/docs' },
                health: { type: 'string', example: '/api/health' },
                github: { type: 'string', example: 'https://github.com/IndieHub25/GroqTales' },
              },
            },
            contact: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Indie Hub' },
                url: { type: 'string', example: 'https://github.com/IndieHub25/GroqTales' },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'routes', '**', '*.js'),
    path.join(__dirname, 'backend.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

// Swagger UI setup — available at both /api-docs and /api/docs
const swaggerSetup = swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    withCredentials: true,
  },
  customCss: `
    .curl-command { display: none !important; }
    .request-url { display: none !important; }
    .response-col_links { display: none !important; }
  `,
  customSiteTitle: 'GroqTales API Documentation',
});

// JSON endpoint for the OpenAPI spec (must be before swagger UI middleware)
app.get('/api/docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('/api-docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerSetup);
app.use('/api/docs', swaggerUi.serve, swaggerSetup);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// CORS configuration — imported from shared config
app.use(
  cors({
    origin: corsOriginCallback,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
    ],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  })
);

// Helper: format bytes to human-readable
const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' MB';
  return (bytes / 1048576).toFixed(1) + ' GB';
};

// Helper: format uptime
const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  return `${h}h ${m}m ${s}s`;
};

// Helper: format microseconds to seconds string
const formatMicroseconds = (us) => (us / 1e6).toFixed(2) + 's';

// Health check endpoint — comprehensive real-time diagnostics
app.get(['/api/health', '/api/health/db'], async (req, res) => {
  const supabaseConfigured = !!SUPABASE_URL;
  const supabaseHealth = supabaseConfigured ? await checkSupabaseHealth() : { connected: false, note: 'Supabase not configured' };
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();

  // Check AI service availability
  const groqConfigured = !!process.env.GROQ_API_KEY;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;

  // Determine overall system status
  let status = 'operational';
  const criticalServicesDown = supabaseConfigured && !supabaseHealth.connected;
  if (criticalServicesDown) {
    status = 'degraded';
  }
  if (!supabaseConfigured) {
    status = 'degraded'; // Database is critical
  }

  res.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    uptime: formatUptime(process.uptime()),
    pid: process.pid,
    hostname: os.hostname(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuUsage: {
      user: formatMicroseconds(cpu.user),
      system: formatMicroseconds(cpu.system),
    },
    database: {
      type: 'Supabase PostgreSQL',
      status: supabaseHealth.connected ? 'ok' : 'error',
      configured: supabaseConfigured,
      connected: supabaseHealth.connected,
      latency_ms: supabaseHealth.latency_ms || null,
      ...(supabaseHealth.error ? { error: supabaseHealth.error } : {}),
      ...(supabaseHealth.note ? { note: supabaseHealth.note } : {}),
    },
    ai_services: {
      groq: {
        status: groqConfigured ? 'available' : 'not_configured',
        configured: groqConfigured,
        model: groqConfigured ? (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') : null,
      },
      gemini: {
        status: geminiConfigured ? 'available' : 'not_configured',
        configured: geminiConfigured,
        model: geminiConfigured ? 'gemini-2.0-pro' : null,
      },
    },
    memory: {
      rss: formatBytes(mem.rss),
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
      external: formatBytes(mem.external),
      arrayBuffers: formatBytes(mem.arrayBuffers),
    },
    services: {
      api: 'online',
      database: supabaseHealth.connected ? 'online' : (supabaseConfigured ? 'offline' : 'not configured'),
      ai_generation: groqConfigured || geminiConfigured ? 'online' : 'offline',
      feed_gallery: supabaseHealth.connected ? 'online' : 'offline',
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequestsPerWindow: RATE_LIMIT_MAX,
    },
  });
});

/**
 * @swagger
 * /api/health/bot:
 *   get:
 *     tags:
 *       - Health
 *     summary: MADHAVA helpbot health check
 *     description: |
 *       Returns MADHAVA AI helpbot availability, configured model,
 *       inference provider, and real-time response latency.
 *     responses:
 *       200:
 *         description: Bot health diagnostics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotHealthResponse'
 */
app.get('/api/health/bot', (req, res) => {
  const startMs = Date.now();
  const botOnline = !!process.env.GROQ_API_KEY;
  const workerConfigured = !!process.env.CF_WORKER_URL;

  res.json({
    status: botOnline ? 'healthy' : 'down',
    timestamp: new Date().toISOString(),
    service: 'madhava-helpbot',
    provider: 'Groq',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    configuredEndpoint: workerConfigured,
    responseTimeMs: Date.now() - startMs,
  });
});

/**
 * @swagger
 * /api/health/web3:
 *   get:
 *     tags:
 *       - Health
 *     summary: Web3 / blockchain connectivity check
 *     description: |
 *       Returns Monad testnet connectivity, chain ID, latest block number,
 *       and platform signer status. Use this to verify Web3 infrastructure.
 *     responses:
 *       200:
 *         description: Web3 health diagnostics.
 */
app.get('/api/health/web3', async (req, res) => {
  try {
    const { checkWeb3Health } = require('./services/web3Service');
    const health = await checkWeb3Health();
    res.json({
      status: health.connected ? 'healthy' : (health.configured ? 'degraded' : 'not_configured'),
      timestamp: new Date().toISOString(),
      service: 'monad-testnet',
      ...health,
    });
  } catch (error) {
    res.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'monad-testnet',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: API landing page
 *     description: |
 *       Returns a comprehensive overview of the GroqTales Backend API including
 *       server status, available endpoint groups, useful links, and contact info.
 *       Ideal as a quick-reference for developers exploring the API.
 *     responses:
 *       200:
 *         description: API overview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WelcomeResponse'
 */
app.get('/', (req, res) => {
  const supabaseConfigured = !!SUPABASE_URL;
  let serverStatus = 'operational';
  // Status is always operational when Supabase is configured

  res.json({
    name: 'GroqTales Backend API',
    description: 'AI-powered Web3 storytelling platform — REST API serving authentication, story management, AI generation, NFT operations, and more.',
    status: serverStatus,
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: formatUptime(process.uptime()),
    endpoints: {
      authentication: { path: '/api/v1/auth', description: 'User signup, login, token refresh, and logout' },
      stories: { path: '/api/v1/stories', description: 'Story CRUD, search, and AI generation' },
      comics: { path: '/api/v1/comics', description: 'Comic creation and management' },
      ai: { path: '/api/v1/ai', description: 'AI-powered content generation and analysis' },
      users: { path: '/api/v1/users', description: 'User profiles and account management' },
      nft: { path: '/api/v1/nft', description: 'NFT minting, marketplace, and royalty operations' },
      wallets: { path: '/api/v1/wallets', description: 'User wallet management, balances, and CRAFTS transfers' },
      marketplace: { path: '/api/v1/marketplace', description: 'NFT marketplace — browse, list, buy, cancel in CRAFTS' },
      feed: { path: '/api/feed', description: 'Public story feed (from Supabase)' },
      helpbot: { path: '/api/helpbot', description: 'MADHAVA AI help bot chat' },
      settings: { path: '/api/v1/settings', description: 'User settings: profile, notifications, privacy, wallet' },
      drafts: { path: '/api/v1/drafts', description: 'Story draft management' },
      sdk: { path: '/sdk/v1', description: 'External SDK integration endpoints' },
    },
    links: {
      documentation: '/api/docs',
      documentationAlt: '/api-docs',
      openApiSpec: '/api/docs/json',
      health: '/api/health',
      github: 'https://github.com/IndieHub25/GroqTales',
    },
    contact: {
      name: 'Indie Hub',
      url: 'https://github.com/IndieHub25/GroqTales',
      license: 'MIT',
    },
  });
});


// Rate limiting - increased limits for production use
const RATE_LIMIT_MAX = 1000; // Increased from 100 to 1000 requests per window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: RATE_LIMIT_MAX,
  skip: (req) => {
    const path = req.originalUrl;
    // Never rate limit liveness/readiness probes or the root welcome page
    return path === '/healthz' || path === '/' || path.startsWith('/api/health');
  },
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Middleware
app.use(correlationIdMiddleware); // Generate/track X-Request-ID for logging & tracing
app.use(requestIdMiddleware);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// CSRF protection is not needed for stateless JWT-based REST API.
// The API uses stateless JWT tokens in the Authorization header for authentication.
// CSRF attacks require session cookies to work, so they don't apply here.
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (after request parsing)
app.use(loggingMiddleware);

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Full server health check
 *     description: |
 *       Returns comprehensive real-time diagnostics including API status,
 *       database connectivity, runtime info (PID, Node version, CPU, memory),
 *       and service availability. Use this endpoint for monitoring dashboards
 *       and uptime checks.
 *     responses:
 *       200:
 *         description: Health diagnostics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     tags:
 *       - Health
 *     summary: Database health check
 *     description: |
 *       Returns the same comprehensive diagnostics as /api/health.
 *       Alias provided for semantic clarity when checking DB status specifically.
 *     responses:
 *       200:
 *         description: Database health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/stories', require('./routes/stories'));
app.use('/api/v1/comics', require('./routes/comics'));
app.use('/api/v1/nft', require('./routes/nft'));
app.use('/api/v1/wallets', require('./routes/wallets'));
app.use('/api/v1/marketplace', require('./routes/marketplace'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/ai', require('./routes/ai-generation'));
app.use('/api/helpbot', require('./routes/helpbot'));
app.use('/api/v1/helpbot', require('./routes/helpbot'));

app.use('/api/feed', require('./routes/feed'));
app.use('/api/feeds', require('./routes/notification-feed'));


app.use('/api/groq', require('./routes/groq'));
app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/drafts', require('./routes/drafts'));
app.use('/api/v1/settings/notifications', require('./routes/settings/notifications'));
app.use('/api/v1/settings/privacy', require('./routes/settings/privacy'));
app.use('/api/v1/settings/wallet', require('./routes/settings/wallet'));
app.use('/api/v1/settings/profile', require('./routes/settings/profile'));

// Vector Search Routes
app.use('/api/vector', require('./routes/vector-search'));

// SDK Routes (for future SDK implementations)
app.use('/sdk/v1', require('./routes/sdk'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }
    logger.info('Cleanup completed');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server — Supabase connects on-demand, no blocking init needed
// MongoDB connects in the background
connectDB().catch(err => console.error('Failed to connect to MongoDB on startup:', err.message));

server = app.listen(PORT, () => {
  logger.info(`GroqTales Backend API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Database: Supabase PostgreSQL${SUPABASE_URL ? ' (configured)' : ' (NOT configured)'}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});
