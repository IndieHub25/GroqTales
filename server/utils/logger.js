/**
 * Centralized Winston Logger Configuration
 * Provides structured JSON logging with file rotation and error tracking
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Message', { key: 'value' });
 *   logger.error('Error message', { error: err.message });
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'groqtales-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || 'v1'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
          const requestIdStr = requestId ? ` [${requestId}]` : '';
          const userIdStr = userId ? ` (user: ${userId})` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]${requestIdStr}${userIdStr}: ${message}${metaStr}`;
        })
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxDays: '14d',
      format: winston.format.json()
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '30d',
      format: winston.format.json()
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    })
  ]
});

module.exports = logger;
