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
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('./utils/logger');
const requestIdMiddleware = require('./middleware/requestId');
const loggingMiddleware = require('./middleware/logging');
const { connectDB, closeDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

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
            error: { type: 'string', description: 'Error message' },
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

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'https://groqtales.xyz',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
    ],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Middleware
app.use(requestIdMiddleware);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (after request parsing)
app.use(loggingMiddleware);

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Full health check
 *     description: Returns API, database, and runtime health status with diagnostics.
 *     responses:
 *       200:
 *         description: Health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded]
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: v1
 *                 environment:
 *                   type: string
 *                   example: development
 *                 uptime:
 *                   type: string
 *                   example: 1h 23m 45s
 *                 database:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                     connected:
 *                       type: boolean
 *                     readyState:
 *                       type: integer
 *                       description: "0=disconnected, 1=connected, 2=connecting, 3=disconnecting"
 *                     host:
 *                       type: string
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: string
 *                     heapUsed:
 *                       type: string
 *                     heapTotal:
 *                       type: string
 */

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     tags:
 *       - Health
 *     summary: Database health check
 *     description: Returns database connection status. Same response as /api/health.
 *     responses:
 *       200:
 *         description: Database health status
 */

// Helper: format bytes to human-readable
const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' MB';
  return (bytes / 1048576).toFixed(1) + ' GB';
};

// Helper: format uptime
const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
};

// Health check endpoint
app.get(['/api/health', '/api/health/db'], (req, res) => {
  const dbConfigured = !!process.env.MONGODB_URI;
  const dbConnected = mongoose.connection.readyState === 1;
  const mem = process.memoryUsage();

  // If DB was never configured, that's fine — not degraded
  let status = 'healthy';
  if (dbConfigured && !dbConnected) {
    status = 'degraded';
  }

  res.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    uptime: formatUptime(process.uptime()),
    database: {
      configured: dbConfigured,
      connected: dbConnected,
      readyState: mongoose.connection.readyState,
      ...(dbConnected && mongoose.connection.host ? { host: mongoose.connection.host } : {}),
      ...(!dbConfigured ? { note: 'MONGODB_URI not set — running in no-db mode' } : {}),
      ...(dbConfigured && !dbConnected ? { note: 'Database configured but connection failed. Check credentials and IP whitelist.' } : {}),
    },
    memory: {
      rss: formatBytes(mem.rss),
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
    },
    services: {
      api: 'online',
      database: dbConnected ? 'online' : (dbConfigured ? 'offline' : 'not configured'),
      helpbot: process.env.GROQ_API_KEY ? 'online' : 'offline',
    },
  });
});

/**
 * @swagger
 * /api/health/bot:
 *   get:
 *     tags:
 *       - Health
 *     summary: Helpbot health check
 *     description: Returns MADHAVA AI helpbot availability status.
 *     responses:
 *       200:
 *         description: Helpbot health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, down]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: helpbot
 */
app.get('/api/health/bot', (req, res) => {
  const botOnline = !!process.env.GROQ_API_KEY;
  res.json({
    status: botOnline ? 'healthy' : 'down',
    timestamp: new Date().toISOString(),
    service: 'helpbot',
  });
});

// Database health endpoint handled by ['/api/health', '/api/health/db'] above

// Bot health endpoint handled by /api/health/bot above

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GroqTales Backend API',
    status: 'online',
    version: process.env.API_VERSION || 'v1',
    docs: '/api-docs',
    health: '/api/health'
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/stories', require('./routes/stories'));
app.use('/api/v1/comics', require('./routes/comics'));
app.use('/api/v1/nft', require('./routes/nft'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/helpbot', require('./routes/helpbot'));

app.use('/api/feed', require('./routes/feed'));

// Helpbot routes (using either /api/v1/helpbot or /api/helpbot)
// Maintaining both per existing logic but removing the duplicate
app.use('/api/helpbot', require('./routes/helpbot'));
app.use('/api/v1/helpbot', require('./routes/helpbot'));


app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/drafts', require('./routes/drafts'));
app.use('/api/v1/settings/notifications', require('./routes/settings/notifications'));
app.use('/api/v1/settings/privacy', require('./routes/settings/privacy'));
app.use('/api/v1/settings/wallet', require('./routes/settings/wallet'));
app.use('/api/v1/settings/profile', require('./routes/settings/profile'));


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

// Graceful shutdown with database connection cleanup (Issue #166)
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('HTTP server closed');
    }
    await closeDB();
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

// Start server after database connection succeeds
const DB_MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES || '5', 10);
const DB_RETRY_DELAY_MS = parseInt(process.env.DB_RETRY_DELAY_MS || '2000', 10);

connectDB(DB_MAX_RETRIES, DB_RETRY_DELAY_MS)
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`GroqTales Backend API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: ${process.env.PROD_URL || 'http://localhost:' + PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);

    // In development, start server anyway without database
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Starting server in development mode without database...');
      server = app.listen(PORT, () => {
        console.log(
          `GroqTales Backend API server running on port ${PORT} (NO DATABASE)`
        );
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Health check: ${process.env.PROD_URL || 'http://localhost:' + PORT}/api/health`);
      });
    } else {
      process.exit(1);
    }
  });
