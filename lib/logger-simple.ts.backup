// SIMPLIFIED LOGGER FOR BUILD COMPATIBILITY
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
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: string;
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
 * Simple logger implementation for build compatibility
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

  child(context: string): Logger {
    return new Logger(
      this.config,
      `${this.context ? `${this.context}:` : ''}${context}`
    );
  }

  error(
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>
  ): void {
    console.error(
      `[ERROR] ${this.context ? `[${this.context}] ` : ''}${message}`,
      error,
      metadata
    );
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(
      `[WARN] ${this.context ? `[${this.context}] ` : ''}${message}`,
      metadata
    );
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(
      `[INFO] ${this.context ? `[${this.context}] ` : ''}${message}`,
      metadata
    );
  }

  http(message: string, metadata?: Record<string, unknown>): void {
    console.log(
      `[HTTP] ${this.context ? `[${this.context}] ` : ''}${message}`,
      metadata
    );
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[DEBUG] ${this.context ? `[${this.context}] ` : ''}${message}`,
        metadata
      );
    }
  }

  performance(
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    console.log(`[PERF] ${operation}: ${duration}ms`, metadata);
  }

  time(label: string) {
    const startTime = Date.now();
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.performance(label, duration);
        return duration;
      },
    };
  }

  close(): void {
    // No-op for simplified logger
  }
}

/**
 * Create a logger instance with optional configuration
 */
export function createLogger(
  context?: string,
  config?: Partial<LoggerConfig>
): Logger {
  const defaultConfig: LoggerConfig = {
    level: process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL)
      : LogLevel.INFO,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
    format: 'json',
    includeStackTrace: process.env.NODE_ENV === 'development',
    enablePerformanceLogging: process.env.ENABLE_PERFORMANCE_LOGGING === 'true',
  };

  return new Logger({ ...defaultConfig, ...config }, context);
}

// Default application logger
export const logger = createLogger('GroqTales');

// Specialized loggers
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('Database');
export const blockchainLogger = createLogger('Blockchain');
export const aiLogger = createLogger('AI');

export default logger;
