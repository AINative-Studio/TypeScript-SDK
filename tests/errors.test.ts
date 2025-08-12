/**
 * Tests for custom error classes
 */

import {
  AINativeError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  TimeoutError,
  ServerError
} from '../src/errors';

describe('Error Classes', () => {
  describe('AINativeError', () => {
    it('should create error with message only', () => {
      const error = new AINativeError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AINativeError');
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
      expect(error.details).toBeUndefined();
      expect(error.requestId).toBeUndefined();
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create error with all parameters', () => {
      const details = { field: 'value' };
      const error = new AINativeError(
        'Test error',
        'TEST_CODE',
        400,
        details,
        'req-123'
      );
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AINativeError');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.details).toBe(details);
      expect(error.requestId).toBe('req-123');
    });

    it('should have proper stack trace', () => {
      const error = new AINativeError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AINativeError');
    });

    it('should serialize to JSON properly', () => {
      const details = { validation: 'failed' };
      const error = new AINativeError(
        'Validation error',
        'VALIDATION',
        422,
        details,
        'req-456'
      );
      
      const json = error.toJSON();
      
      expect(json.name).toBe('AINativeError');
      expect(json.message).toBe('Validation error');
      expect(json.code).toBe('VALIDATION');
      expect(json.status).toBe(422);
      expect(json.details).toEqual(details);
      expect(json.requestId).toBe('req-456');
      expect(json.stack).toBeDefined();
    });

    it('should handle undefined values in toJSON', () => {
      const error = new AINativeError('Simple error');
      const json = error.toJSON();
      
      expect(json.name).toBe('AINativeError');
      expect(json.message).toBe('Simple error');
      expect(json.code).toBeUndefined();
      expect(json.status).toBeUndefined();
      expect(json.details).toBeUndefined();
      expect(json.requestId).toBeUndefined();
    });
  });

  describe('NetworkError', () => {
    it('should create network error with default properties', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.status).toBeUndefined();
      expect(error instanceof AINativeError).toBe(true);
      expect(error instanceof NetworkError).toBe(true);
    });

    it('should create network error with details', () => {
      const details = { errno: 'ECONNREFUSED', port: 443 };
      const error = new NetworkError('Connection refused', details);
      
      expect(error.message).toBe('Connection refused');
      expect(error.details).toBe(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.status).toBe(401);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid API key');
      
      expect(error.message).toBe('Invalid API key');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.status).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with default message', () => {
      const error = new AuthorizationError();
      
      expect(error.message).toBe('Not authorized');
      expect(error.name).toBe('AuthorizationError');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.status).toBe(403);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create authorization error with custom message', () => {
      const error = new AuthorizationError('Access denied to resource');
      
      expect(error.message).toBe('Access denied to resource');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.status).toBe(403);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const error = new RateLimitError();
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.status).toBe(429);
      expect(error.retryAfter).toBeUndefined();
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create rate limit error with custom message and retry after', () => {
      const error = new RateLimitError('Too many requests', 60);
      
      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBe(60);
    });

    it('should handle retryAfter as zero', () => {
      const error = new RateLimitError('Rate limited', 0);
      expect(error.retryAfter).toBe(0);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error without details', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(422);
      expect(error.details).toBeUndefined();
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create validation error with details', () => {
      const details = {
        fields: {
          email: 'Invalid email format',
          password: 'Password too short'
        }
      };
      const error = new ValidationError('Validation failed', details);
      
      expect(error.message).toBe('Validation failed');
      expect(error.details).toBe(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create not found error with custom message', () => {
      const error = new NotFoundError('Project not found');
      
      expect(error.message).toBe('Project not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error with default message', () => {
      const error = new TimeoutError();
      
      expect(error.message).toBe('Request timed out');
      expect(error.name).toBe('TimeoutError');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.status).toBe(408);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create timeout error with custom message', () => {
      const error = new TimeoutError('Connection timeout after 30s');
      
      expect(error.message).toBe('Connection timeout after 30s');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.status).toBe(408);
    });
  });

  describe('ServerError', () => {
    it('should create server error with default message and status', () => {
      const error = new ServerError();
      
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('ServerError');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.status).toBe(500);
      expect(error instanceof AINativeError).toBe(true);
    });

    it('should create server error with custom message', () => {
      const error = new ServerError('Database connection failed');
      
      expect(error.message).toBe('Database connection failed');
      expect(error.status).toBe(500);
    });

    it('should create server error with custom status', () => {
      const error = new ServerError('Bad Gateway', 502);
      
      expect(error.message).toBe('Bad Gateway');
      expect(error.status).toBe(502);
    });

    it('should create server error with custom message and status', () => {
      const error = new ServerError('Service Unavailable', 503);
      
      expect(error.message).toBe('Service Unavailable');
      expect(error.status).toBe(503);
      expect(error.code).toBe('SERVER_ERROR');
    });
  });

  describe('Error inheritance and type checking', () => {
    it('should maintain proper instanceof relationships', () => {
      const networkError = new NetworkError('Network issue');
      const authError = new AuthenticationError('Auth failed');
      const validationError = new ValidationError('Invalid data');
      
      // All should be instances of base classes
      expect(networkError instanceof AINativeError).toBe(true);
      expect(networkError instanceof Error).toBe(true);
      expect(authError instanceof AINativeError).toBe(true);
      expect(authError instanceof Error).toBe(true);
      expect(validationError instanceof AINativeError).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      
      // Should maintain specific types
      expect(networkError instanceof NetworkError).toBe(true);
      expect(authError instanceof AuthenticationError).toBe(true);
      expect(validationError instanceof ValidationError).toBe(true);
      
      // Should not be instances of other error types
      expect(networkError instanceof AuthenticationError).toBe(false);
      expect(authError instanceof ValidationError).toBe(false);
      expect(validationError instanceof NetworkError).toBe(false);
    });

    it('should be catchable as base Error', () => {
      const error = new RateLimitError('Rate limited');
      
      try {
        throw error;
      } catch (caught) {
        expect(caught instanceof Error).toBe(true);
        expect(caught instanceof AINativeError).toBe(true);
        expect(caught instanceof RateLimitError).toBe(true);
        expect((caught as RateLimitError).code).toBe('RATE_LIMIT_ERROR');
      }
    });

    it('should preserve error properties through inheritance', () => {
      const baseError = new AINativeError('Base', 'BASE_CODE', 400, { test: true }, 'req-123');
      const json = baseError.toJSON();
      
      expect(json.name).toBe('AINativeError');
      expect(json.code).toBe('BASE_CODE');
      expect(json.status).toBe(400);
      expect(json.details).toEqual({ test: true });
      expect(json.requestId).toBe('req-123');
    });
  });
});