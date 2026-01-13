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
const mongoose = require('mongoose');

const { connectDB, closeDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Store server reference for graceful shutdown
let server;

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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
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
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbConnected,
      readyState: mongoose.connection.readyState,
    },
  });
});

// API Routes
app.use('/api/v1/stories', require('./routes/stories'));
app.use('/api/v1/nft', require('./routes/nft'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/ai', require('./routes/ai'));

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
  console.error('Global error handler:', err);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Graceful shutdown with database connection cleanup (Issue #166)
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  const shutdownTimeout = setTimeout(() => {
    console.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('HTTP server closed');
    }
    await closeDB();
    console.log('Cleanup completed');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
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
      console.log(`GroqTales Backend API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to database connection error:', err.message);
    process.exit(1);
  });
