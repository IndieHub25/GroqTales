/**
 * Logger Test Suite
 * Tests for the enhanced logger implementation
 */

import {
  Logger,
  LogLevel,
  createLogger,
  logger,
  apiLogger,
} from '@/lib/logger';

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('Logger instantiation', () => {
    it('should create a logger with default configuration', () => {
      const testLogger = new Logger();
      expect(testLogger).toBeInstanceOf(Logger);
    });

    it('should create a logger with custom configuration', () => {
      const testLogger = new Logger({
        level: LogLevel.DEBUG,
        enableConsole: true,
        format: 'text',
      });
      expect(testLogger).toBeInstanceOf(Logger);
    });

    it('should create a logger with context', () => {
      const testLogger = new Logger({}, 'TestContext');
      testLogger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Log methods', () => {
    let testLogger: Logger;

    beforeEach(() => {
      testLogger = new Logger({
        level: LogLevel.DEBUG,
        enableConsole: true,
        enableFile: false,
        enableRemote: false,
      });
    });

    it('should log error messages', () => {
      testLogger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      testLogger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error messages with metadata', () => {
      testLogger.error('Error message', undefined, { userId: '123' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      testLogger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log warning messages with metadata', () => {
      testLogger.warn('Warning message', { action: 'retry' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      testLogger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log info messages with metadata', () => {
      testLogger.info('Info message', { status: 'success' });
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log HTTP messages', () => {
      testLogger.http('HTTP request received');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      testLogger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('Log levels', () => {
    it('should respect log level - ERROR only', () => {
      const testLogger = new Logger({ level: LogLevel.ERROR });

      testLogger.error('Error');
      testLogger.warn('Warning');
      testLogger.info('Info');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should respect log level - WARN and above', () => {
      const testLogger = new Logger({ level: LogLevel.WARN });

      testLogger.error('Error');
      testLogger.warn('Warning');
      testLogger.info('Info');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should respect log level - INFO and above', () => {
      const testLogger = new Logger({ level: LogLevel.INFO });

      testLogger.error('Error');
      testLogger.warn('Warning');
      testLogger.info('Info');
      testLogger.debug('Debug');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('Child loggers', () => {
    it('should create a child logger with additional context', () => {
      const parentLogger = new Logger({}, 'Parent');
      const childLogger = parentLogger.child('Child');

      childLogger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should inherit parent configuration', () => {
      const parentLogger = new Logger({
        level: LogLevel.WARN,
        enableConsole: true,
      });
      const childLogger = parentLogger.child('Child');

      childLogger.info('Should not log');
      childLogger.warn('Should log');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('Performance logging', () => {
    it('should log performance metrics when enabled', () => {
      const testLogger = new Logger({
        enablePerformanceLogging: true,
      });

      testLogger.performance('test-operation', 150);
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should not log performance metrics when disabled', () => {
      const testLogger = new Logger({
        enablePerformanceLogging: false,
      });

      testLogger.performance('test-operation', 150);
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should time synchronous operations', () => {
      const testLogger = new Logger({
        enablePerformanceLogging: true,
      });

      const result = testLogger.time('sync-op', () => {
        return 42;
      });

      expect(result).toBe(42);
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should time asynchronous operations', async () => {
      const testLogger = new Logger({
        enablePerformanceLogging: true,
      });

      const result = await testLogger.time('async-op', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle errors in timed operations', () => {
      const testLogger = new Logger({
        enablePerformanceLogging: true,
      });

      expect(() => {
        testLogger.time('error-op', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Factory functions', () => {
    it('should create logger with createLogger function', () => {
      const testLogger = createLogger('Test');
      expect(testLogger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom config', () => {
      const testLogger = createLogger('Test', {
        level: LogLevel.DEBUG,
        format: 'text',
      });
      expect(testLogger).toBeInstanceOf(Logger);
    });
  });

  describe('Default loggers', () => {
    it('should export default logger', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should export specialized loggers', () => {
      expect(apiLogger).toBeInstanceOf(Logger);
    });

    it('should use default logger', () => {
      logger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Output format', () => {
    it('should format logs as JSON when configured', () => {
      const testLogger = new Logger({
        format: 'json',
      });

      testLogger.info('Test message', { key: 'value' });
      expect(consoleInfoSpy).toHaveBeenCalled();

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
    });

    it('should format logs as text when configured', () => {
      const testLogger = new Logger({
        format: 'text',
      });

      testLogger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      expect(typeof logOutput).toBe('string');
      expect(logOutput).toContain('Test message');
    });
  });

  describe('Error stack traces', () => {
    it('should include stack traces when enabled', () => {
      const testLogger = new Logger({
        includeStackTrace: true,
        format: 'json',
      });

      const error = new Error('Test error');
      testLogger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.error.stack).toBeDefined();
    });

    it('should exclude stack traces when disabled', () => {
      const testLogger = new Logger({
        includeStackTrace: false,
        format: 'json',
      });

      const error = new Error('Test error');
      testLogger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.error.stack).toBeUndefined();
    });
  });
});
