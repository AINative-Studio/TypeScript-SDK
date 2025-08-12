/**
 * Custom error classes for AINative SDK
 */

export class AINativeError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;
  public requestId?: string;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.name = 'AINativeError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AINativeError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      requestId: this.requestId,
      stack: this.stack
    };
  }
}

export class NetworkError extends AINativeError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AINativeError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AINativeError {
  constructor(message: string = 'Not authorized') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends AINativeError {
  public retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends AINativeError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 422, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AINativeError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class TimeoutError extends AINativeError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR', 408);
    this.name = 'TimeoutError';
  }
}

export class ServerError extends AINativeError {
  constructor(message: string = 'Internal server error', status: number = 500) {
    super(message, 'SERVER_ERROR', status);
    this.name = 'ServerError';
  }
}