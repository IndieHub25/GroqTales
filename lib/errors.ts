/**
 * Custom error classes for different error types
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, true, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}
export class BlockchainError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BLOCKCHAIN_ERROR', 500, true, details);
  }
}

export class IPFSError extends AppError {
  constructor(message: string) {
    super(message, 'IPFS_ERROR', 500);
  }
}
/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Handle async errors in Express middleware
   */
  static catchAsync(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: Error | AppError): void {
    if (error instanceof AppError) {
      if (error.isOperational) {
        console.warn(`[${error.code}] ${error.message}`, {
          statusCode: error.statusCode,
          timestamp: error.timestamp,
          details: error.details,
        });
      } else {
        console.error(`[${error.code}] ${error.message}`, {
          statusCode: error.statusCode,
          timestamp: error.timestamp,
          stack: error.stack,
          details: error.details,
        });
      }
    } else {
      console.error('Unexpected error:', error.message, {
        stack: error.stack,
      });
    }
  }

  /**
   * Convert error to API response format
   */
  static toApiResponse(error: Error | AppError): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
      timestamp: string;
    };
  } {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
          timestamp: error.timestamp.toISOString(),
        },
      };
    }
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An internal error occurred'
            : error.message,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException(error: Error): void {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any): void {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  }
}

/**
 * Error boundary for React components
 */
export class ErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static componentDidCatch(error: Error, errorInfo: any) {
    ErrorHandler.logError(error);

    // Send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }
}

/**
 * Validation helper functions
 */
export class ValidationHelper {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateWalletAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static validateObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

/**
 * Retry mechanism for external API calls
 */
export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw new ExternalServiceError(
            'Retry failed',
            `Failed after ${maxRetries} attempts: ${lastError.message}`
          );
        }
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError!;
  }
}
export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  BlockchainError,
  IPFSError,
  ErrorHandler,
  ErrorBoundary,
  ValidationHelper,
  RetryHandler,
};
