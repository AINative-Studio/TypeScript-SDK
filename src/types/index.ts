/**
 * Core type definitions for AINative SDK
 */

export interface ClientConfig {
  /**
   * Base URL for the API
   * @default "https://api.ainative.studio"
   */
  baseUrl?: string;

  /**
   * API Key for authentication
   */
  apiKey?: string;

  /**
   * Organization ID for multi-tenant scenarios
   */
  organizationId?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}

export interface AuthConfig {
  /**
   * API Key for authentication
   */
  apiKey?: string;

  /**
   * API Secret for enhanced security
   */
  apiSecret?: string;

  /**
   * JWT token for Bearer authentication
   */
  token?: string;

  /**
   * Token refresh callback
   */
  onTokenRefresh?: (newToken: string) => void;
}

export interface RequestOptions {
  /**
   * Override timeout for this request
   */
  timeout?: number;

  /**
   * Custom headers for this request
   */
  headers?: Record<string, string>;

  /**
   * Signal for request cancellation
   */
  signal?: AbortSignal;
}

export interface PaginationOptions {
  /**
   * Number of items per page
   * @default 10
   */
  limit?: number;

  /**
   * Offset for pagination
   * @default 0
   */
  offset?: number;

  /**
   * Page number (alternative to offset)
   */
  page?: number;
}

export interface ApiResponse<T = any> {
  /**
   * Response data
   */
  data: T;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Response headers
   */
  headers: Record<string, string>;

  /**
   * Request metadata
   */
  meta?: {
    requestId?: string;
    timestamp?: string;
    duration?: number;
  };
}

export interface ApiError {
  /**
   * Error message
   */
  message: string;

  /**
   * Error code
   */
  code?: string;

  /**
   * HTTP status code
   */
  status?: number;

  /**
   * Additional error details
   */
  details?: any;

  /**
   * Request ID for debugging
   */
  requestId?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}