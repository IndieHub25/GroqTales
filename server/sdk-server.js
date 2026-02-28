/**
 * GroqTales SDK Server
 *
 * Dedicated server for SDK endpoints and developer integrations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3002;

// Security and middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/sdk/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GroqTales SDK',
    version: process.env.SDK_VERSION || 'v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GroqTales SDK Service',
    status: 'online',
    version: process.env.SDK_VERSION || 'v1.0.0',
    health: '/sdk/health'
  });
});

// SDK routes
app.use('/sdk/v1', require('./routes/sdk'));

// Start server
app.listen(PORT, () => {
  console.log(`🔧 GroqTales SDK server running on port ${PORT}`);
});
