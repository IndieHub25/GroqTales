/**
 * @fileoverview Core application types and interfaces
 * @description Centralized type definitions for the GroqTales application
 * @version 1.0.0
 */

/**
 * Base entity interface that all domain entities extend
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
/**
 * API response wrapper interface
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Error message if any */
  message?: string;
  /** Pagination metadata */
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata for paginated responses
 */
export interface PaginationMetadata {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Application error interface
 */
export interface AppError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Error timestamp */
  timestamp: Date;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  /** Whether currently loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: string | null;
  /** Loading message */
  message?: string;
}

/**
 * File upload interface
 */
export interface FileUpload {
  /** File object */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: 'pending' | 'uploading' | 'completed' | 'error';
  /** Error message if upload failed */
  error?: string;
  /** Uploaded file URL */
  url?: string;
}

/**
 * Search filters interface
 */
export interface SearchFilters {
  /** Search query */
  query?: string;
  /** Category filter */
  category?: string;
  /** Price range filter */
  priceRange?: {
    min: number;
    max: number;
  };
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Sort options */
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export default {};
