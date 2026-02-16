import { NextResponse } from 'next/server';

import type { ApiResponse, ApiError, PaginationMetadata } from '@/types/api';

import { AppError, ErrorHandler } from './errors';
import { logger } from './logger';

export class ResponseBuilder {
  static success<T>(
    data: T,
    message?: string,
    pagination?: PaginationMetadata,
    statusCode: number = 200
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      ...(pagination && { pagination }),
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    return NextResponse.json(response, { status: statusCode });
  }
  static error(
    error: string | Error | AppError,
    statusCode?: number,
    details?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    let apiError: ApiError;
    let responseStatusCode: number;

    if (error instanceof AppError) {
      apiError = {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp.toISOString(),
        ...(error.details && { details: error.details }),
      };
      responseStatusCode = error.statusCode;
    } else if (error instanceof Error) {
      apiError = {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An internal error occurred'
            : error.message,
        timestamp: new Date().toISOString(),
        ...(details && { details }),
      };
      responseStatusCode = statusCode || 500;
    } else {
      apiError = {
        code: 'GENERIC_ERROR',
        message: error,
        timestamp: new Date().toISOString(),
        ...(details && { details }),
      };
      responseStatusCode = statusCode || 400;
    }
    const response: ApiResponse<never> = {
      success: false,
      error: apiError,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    // Log the error
    if (error instanceof AppError || error instanceof Error) {
      ErrorHandler.logError(error);
    } else {
      logger.error('API Error', new Error(String(error)));
    }
    return NextResponse.json(response, { status: responseStatusCode });
  }
  static paginated<T>(
    data: T[],
    pagination: PaginationMetadata,
    message?: string
  ): NextResponse<ApiResponse<T[]>> {
    return this.success(data, message, pagination);
  }
  static created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return this.success(
      data,
      message || 'Resource created successfully',
      undefined,
      201
    );
  }
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }
  static notFound(
    message: string = 'Resource not found'
  ): NextResponse<ApiResponse<never>> {
    return this.error(message, 404);
  }
  static unauthorized(
    message: string = 'Authentication required'
  ): NextResponse<ApiResponse<never>> {
    return this.error(message, 401);
  }
  static forbidden(
    message: string = 'Insufficient permissions'
  ): NextResponse<ApiResponse<never>> {
    return this.error(message, 403);
  }
  static validationError(
    message: string = 'Validation failed',
    details?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    return this.error(message, 400, details);
  }
  static conflict(
    message: string = 'Resource conflict'
  ): NextResponse<ApiResponse<never>> {
    return this.error(message, 409);
  }
  static rateLimited(
    message: string = 'Rate limit exceeded',
    retryAfter?: number
  ): NextResponse<ApiResponse<never>> {
    const response = this.error(message, 429);

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }
    return response;
  }
}
export class PaginationHelper {
  static calculatePagination(
    page: number,
    limit: number,
    total: number
  ): PaginationMetadata {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      ...(page < totalPages && { nextPage: page + 1 }),
      ...(page > 1 && { prevPage: page - 1 }),
    };
  }
  static parsePaginationParams(searchParams: URLSearchParams): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }
}
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiResponse<never>>> => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error('API Route Error', error as Error);

      if (error instanceof AppError) {
        return ResponseBuilder.error(error);
      }
      return ResponseBuilder.error(
        error instanceof Error ? error : new Error('Unknown error occurred')
      );
    }
  };
}
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      throw error;
    });
  };
}
export class RequestValidator {
  static validateRequired(
    body: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missing = requiredFields.filter(
      (field) =>
        body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        400,
        true,
        { missingFields: missing }
      );
    }
  }
  static validateTypes(
    data: Record<string, unknown>,
    schema: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>
  ): void {
    const errors: string[] = [];

    for (const [field, expectedType] of Object.entries(schema)) {
      const value = data[field];

      if (value === undefined || value === null) {
        continue; // Skip undefined/null values
      }
      let isValidType = false;

      switch (expectedType) {
        case 'string':
          isValidType = typeof value === 'string';
          break;
        case 'number':
          isValidType = typeof value === 'number' && !isNaN(value);
          break;
        case 'boolean':
          isValidType = typeof value === 'boolean';
          break;
        case 'object':
          isValidType = typeof value === 'object' && !Array.isArray(value);
          break;
        case 'array':
          isValidType = Array.isArray(value);
          break;
      }
      if (!isValidType) {
        errors.push(`Field '${field}' must be of type ${expectedType}`);
      }
    }
    if (errors.length > 0) {
      throw new AppError(
        'Type validation failed',
        'VALIDATION_ERROR',
        400,
        true,
        { typeErrors: errors }
      );
    }
  }
  static validateStringLength(
    data: Record<string, unknown>,
    rules: Record<string, { min?: number; max?: number }>
  ): void {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (typeof value !== 'string') {
        continue; // Skip non-string values
      }
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push(
          `Field '${field}' must be at least ${rule.min} characters long`
        );
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push(`Field '${field}' must not exceed ${rule.max} characters`);
      }
    }
    if (errors.length > 0) {
      throw new AppError(
        'String length validation failed',
        'VALIDATION_ERROR',
        400,
        true,
        { lengthErrors: errors }
      );
    }
  }
}
export class RateLimiter {
  private static requests = new Map<
    string,
    { count: number; resetTime: number }
  >();

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const userLimit = this.requests.get(identifier);

    // Clean up expired entries
    this.cleanup();

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }
    if (userLimit.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: userLimit.resetTime,
      };
    }
    // Increment count
    userLimit.count++;

    return {
      allowed: true,
      remaining: maxRequests - userLimit.count,
      resetTime: userLimit.resetTime,
    };
  }

  /**
   * Clean up expired rate limit entries
   */
  private static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
export default {
  ResponseBuilder,
  PaginationHelper,
  RequestValidator,
  RateLimiter,
  withErrorHandling,
  asyncHandler,
};
