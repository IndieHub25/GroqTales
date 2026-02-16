export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  HTTP = 3,
  DEBUG = 4,
}
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  error?: Error | undefined;
  requestId?: string | undefined;
  userId?: string | undefined;
}
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  filename?: string;
  remoteEndpoint?: string;
  format: 'json' | 'text';
  includeStackTrace: boolean;
  enablePerformanceLogging: boolean;
}
/**
 * Professional logger implementation
 */
export class Logger {
  private config: LoggerConfig;
  private context?: string;

  constructor(config: Partial<LoggerConfig> = {}, context?: string) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      format: 'json',
      includeStackTrace: true,
      enablePerformanceLogging: false,
      ...config,
    };
    this.context = context;
  }
  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    return new Logger(
      this.config,
      `${this.context ? `${this.context}:` : ''}${context}`
    );
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error | undefined,
    metadata?: Record<string, unknown> | undefined
  ): void {
    const options: any = {};
    if (error !== undefined) options.error = error;
    if (metadata !== undefined) options.metadata = metadata;
    this.log(LogLevel.ERROR, message, options);
  }
  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown> | undefined): void {
    const options: any = {};
    if (metadata !== undefined) options.metadata = metadata;
    this.log(LogLevel.WARN, message, options);
  }
  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown> | undefined): void {
    const options: any = {};
    if (metadata !== undefined) options.metadata = metadata;
    this.log(LogLevel.INFO, message, options);
  }
  /**
   * Log an HTTP request/response
   */
  http(message: string, metadata?: Record<string, unknown> | undefined): void {
    const options: any = {};
    if (metadata !== undefined) options.metadata = metadata;
    this.log(LogLevel.HTTP, message, options);
  }
  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown> | undefined): void {
    const options: any = {};
    if (metadata !== undefined) options.metadata = metadata;
    this.log(LogLevel.DEBUG, message, options);
  }
  /**
   * Log performance metrics
   */
  performance(
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    if (this.config.enablePerformanceLogging) {
      this.info(`Performance: ${operation}`, {
        duration,
        operation,
        ...metadata,
      });
    }
  }
  /**
   * Time an operation
   */
  time<T>(operation: string, fn: () => T | Promise<T>): T | Promise<T> {
    const start = Date.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then((value) => {
            this.performance(operation, Date.now() - start);
            return value;
          })
          .catch((error) => {
            this.performance(operation, Date.now() - start, { error: true });
            throw error;
          });
      } else {
        this.performance(operation, Date.now() - start);
        return result;
      }
    } catch (error) {
      this.performance(operation, Date.now() - start, { error: true });
      throw error;
    }
  }
  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    options: {
      error?: Error;
      metadata?: Record<string, unknown>;
      requestId?: string;
      userId?: string;
    } = {}
  ): void {
    if (level > this.config.level) {
      return;
    }
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      ...options,
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
    if (this.config.enableFile) {
      this.logToFile(entry);
    }
    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }
  /**
   * Log to console with proper formatting
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';

    let output: string;

    if (this.config.format === 'json') {
      output = JSON.stringify(
        {
          level: levelName,
          timestamp,
          context: entry.context,
          message: entry.message,
          metadata: entry.metadata,
          ...(entry.error && {
            error: {
              name: entry.error.name,
              message: entry.error.message,
              ...(this.config.includeStackTrace && {
                stack: entry.error.stack,
              }),
            },
          }),
        },
        null,
        2
      );
    } else {
      output = `${timestamp} ${levelName} ${context} ${entry.message}`;
      if (entry.metadata) {
        output += ` ${JSON.stringify(entry.metadata)}`;
      }
      if (entry.error) {
        output += `\nError: ${entry.error.message}`;
        if (this.config.includeStackTrace && entry.error.stack) {
          output += `\n${entry.error.stack}`;
        }
      }
    }
    // Use appropriate console method based on log level
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }
  /**
   * Log to file (in Node.js environment)
   */
  private logToFile(entry: LogEntry): void {
    if (typeof window !== 'undefined') {
      return; // Skip file logging in browser
    }
    try {
      const fs = require('fs');
      const path = require('path');

      const filename = this.config.filename || 'app.log';
      const logDir = path.dirname(filename);

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logLine =
        JSON.stringify({
          level: LogLevel[entry.level],
          timestamp: entry.timestamp.toISOString(),
          context: entry.context,
          message: entry.message,
          metadata: entry.metadata,
          ...(entry.error && {
            error: {
              name: entry.error.name,
              message: entry.error.message,
              stack: entry.error.stack,
            },
          }),
        }) + '\n';

      fs.appendFileSync(filename, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
  /**
   * Log to remote endpoint
   */
  private logToRemote(entry: LogEntry): void {
    if (!this.config.remoteEndpoint) {
      return;
    }
    // In a real implementation, you would send this to your logging service
    // This is a placeholder for demonstration
    const payload = {
      level: LogLevel[entry.level],
      timestamp: entry.timestamp.toISOString(),
      context: entry.context,
      message: entry.message,
      metadata: entry.metadata,
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
    };

    // Example: Send to remote logging service
    fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.error('Failed to send log to remote endpoint:', error);
    });
  }
}
/**
 * Request logging middleware
 */
export class RequestLogger {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Express.js middleware for request logging
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const requestId =
        req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9);

      // Add request ID to request object
      req.requestId = requestId;

      // Log incoming request
      this.logger.http('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        requestId,
      });

      // Log response when finished
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.http('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          requestId,
        });
      });

      next();
    };
  }
}
/**
 * Create application loggers

export const createLogger = (context?: string, config?: Partial<LoggerConfig>): Logger => {
  const defaultConfig: Partial<LoggerConfig> = {
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    enableConsole: true,
    enableFile: process.env.NODE_ENV === 'production',
    enableRemote: process.env.NODE_ENV === 'production' && Boolean(process.env.REMOTE_LOG_ENDPOINT),
    filename: process.env.LOG_FILE || './logs/app.log',
    format: process.env.LOG_FORMAT as 'json' | 'text' || 'json',
    includeStackTrace: process.env.NODE_ENV === 'development',
    enablePerformanceLogging: process.env.ENABLE_PERFORMANCE_LOGGING === 'true',
  };

  if (process.env.REMOTE_LOG_ENDPOINT) {
    (defaultConfig as any).remoteEndpoint = process.env.REMOTE_LOG_ENDPOINT;
}
  return new Logger({ ...defaultConfig, ...config }, context);
};

// Default application logger
export const logger = createLogger('GroqTales');

// Specialized loggers
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('Database');
export const blockchainLogger = createLogger('Blockchain');
export const aiLogger = createLogger('AI');

export default logger;
*/
