/**
 * Tests for AuthManager
 */

import { AuthManager } from '../src/auth';
import { AuthConfig } from '../src/types';

describe('AuthManager', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    authManager = new AuthManager();
  });

  describe('constructor', () => {
    it('should initialize with empty config', () => {
      const manager = new AuthManager();
      expect(manager.isAuthenticated()).toBe(false);
      expect(manager.getAuthType()).toBe('none');
    });

    it('should initialize with provided config', () => {
      const config: AuthConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-secret'
      };
      const manager = new AuthManager(config);
      expect(manager.isAuthenticated()).toBe(true);
      expect(manager.getAuthType()).toBe('api-key');
    });
  });

  describe('getHeaders', () => {
    it('should return empty headers when no auth is configured', () => {
      const headers = authManager.getHeaders();
      expect(headers).toEqual({});
    });

    it('should return API key headers when API key is configured', () => {
      authManager.setApiKey('test-api-key');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'X-API-Key': 'test-api-key'
      });
    });

    it('should return Bearer token headers when token is configured', () => {
      authManager.setToken('test-jwt-token');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'Authorization': 'Bearer test-jwt-token'
      });
    });

    it('should prefer API key over token when both are configured', () => {
      authManager.setApiKey('test-api-key');
      authManager.setToken('test-jwt-token');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'X-API-Key': 'test-api-key'
      });
    });

    it('should include API secret when provided', () => {
      authManager.setApiKey('test-api-key');
      authManager.setApiSecret('test-secret');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'X-API-Key': 'test-api-key',
        'X-API-Secret': 'test-secret'
      });
    });

    it('should include API secret with token auth', () => {
      authManager.setToken('test-jwt-token');
      authManager.setApiSecret('test-secret');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'Authorization': 'Bearer test-jwt-token',
        'X-API-Secret': 'test-secret'
      });
    });

    it('should include only API secret when no primary auth', () => {
      authManager.setApiSecret('test-secret');
      const headers = authManager.getHeaders();
      expect(headers).toEqual({
        'X-API-Secret': 'test-secret'
      });
    });
  });

  describe('setApiKey', () => {
    it('should set API key', () => {
      authManager.setApiKey('new-api-key');
      expect(authManager.isAuthenticated()).toBe(true);
      expect(authManager.getAuthType()).toBe('api-key');
      
      const headers = authManager.getHeaders();
      expect(headers['X-API-Key']).toBe('new-api-key');
    });

    it('should override existing API key', () => {
      authManager.setApiKey('old-key');
      authManager.setApiKey('new-key');
      
      const headers = authManager.getHeaders();
      expect(headers['X-API-Key']).toBe('new-key');
    });
  });

  describe('setApiSecret', () => {
    it('should set API secret', () => {
      authManager.setApiSecret('test-secret');
      const headers = authManager.getHeaders();
      expect(headers['X-API-Secret']).toBe('test-secret');
    });

    it('should override existing API secret', () => {
      authManager.setApiSecret('old-secret');
      authManager.setApiSecret('new-secret');
      
      const headers = authManager.getHeaders();
      expect(headers['X-API-Secret']).toBe('new-secret');
    });
  });

  describe('setToken', () => {
    it('should set JWT token', () => {
      authManager.setToken('jwt-token');
      expect(authManager.isAuthenticated()).toBe(true);
      expect(authManager.getAuthType()).toBe('token');
      
      const headers = authManager.getHeaders();
      expect(headers['Authorization']).toBe('Bearer jwt-token');
    });

    it('should call onTokenRefresh callback when provided', () => {
      const onTokenRefresh = jest.fn();
      const manager = new AuthManager({ onTokenRefresh });
      
      manager.setToken('new-token');
      expect(onTokenRefresh).toHaveBeenCalledWith('new-token');
    });

    it('should not call callback when no onTokenRefresh is configured', () => {
      // Should not throw error
      expect(() => authManager.setToken('token')).not.toThrow();
    });

    it('should override existing token', () => {
      authManager.setToken('old-token');
      authManager.setToken('new-token');
      
      const headers = authManager.getHeaders();
      expect(headers['Authorization']).toBe('Bearer new-token');
    });
  });

  describe('clear', () => {
    it('should clear all authentication', () => {
      authManager.setApiKey('api-key');
      authManager.setApiSecret('api-secret');
      authManager.setToken('token');
      
      expect(authManager.isAuthenticated()).toBe(true);
      
      authManager.clear();
      
      expect(authManager.isAuthenticated()).toBe(false);
      expect(authManager.getAuthType()).toBe('none');
      expect(authManager.getHeaders()).toEqual({});
    });

    it('should clear already empty config', () => {
      authManager.clear();
      expect(authManager.isAuthenticated()).toBe(false);
      expect(authManager.getHeaders()).toEqual({});
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no auth is configured', () => {
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should return true when API key is configured', () => {
      authManager.setApiKey('test-key');
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('should return true when token is configured', () => {
      authManager.setToken('test-token');
      expect(authManager.isAuthenticated()).toBe(true);
    });

    it('should return false when only API secret is configured', () => {
      authManager.setApiSecret('test-secret');
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('should return true when both API key and secret are configured', () => {
      authManager.setApiKey('test-key');
      authManager.setApiSecret('test-secret');
      expect(authManager.isAuthenticated()).toBe(true);
    });
  });

  describe('getAuthType', () => {
    it('should return "none" when no auth is configured', () => {
      expect(authManager.getAuthType()).toBe('none');
    });

    it('should return "api-key" when API key is configured', () => {
      authManager.setApiKey('test-key');
      expect(authManager.getAuthType()).toBe('api-key');
    });

    it('should return "token" when token is configured', () => {
      authManager.setToken('test-token');
      expect(authManager.getAuthType()).toBe('token');
    });

    it('should return "api-key" when both API key and token are configured', () => {
      authManager.setApiKey('test-key');
      authManager.setToken('test-token');
      expect(authManager.getAuthType()).toBe('api-key');
    });

    it('should return "none" when only API secret is configured', () => {
      authManager.setApiSecret('test-secret');
      expect(authManager.getAuthType()).toBe('none');
    });
  });

  describe('complex scenarios', () => {
    it('should handle token refresh callback with error handling', () => {
      const onTokenRefresh = jest.fn().mockImplementation(() => {
        throw new Error('Refresh failed');
      });
      
      const manager = new AuthManager({ onTokenRefresh });
      
      // Should still call the callback but allow errors to propagate
      expect(() => manager.setToken('token')).toThrow('Refresh failed');
      expect(onTokenRefresh).toHaveBeenCalledWith('token');
    });

    it('should handle switching between auth types', () => {
      // Start with API key
      authManager.setApiKey('api-key');
      expect(authManager.getAuthType()).toBe('api-key');
      
      // Switch to token (API key should still take precedence)
      authManager.setToken('token');
      expect(authManager.getAuthType()).toBe('api-key');
      
      // Clear and use only token
      authManager.clear();
      authManager.setToken('token');
      expect(authManager.getAuthType()).toBe('token');
    });

    it('should maintain state consistency across operations', () => {
      // Configure full auth
      authManager.setApiKey('api-key');
      authManager.setApiSecret('api-secret');
      authManager.setToken('token');
      
      const headers1 = authManager.getHeaders();
      const headers2 = authManager.getHeaders();
      
      // Headers should be consistent
      expect(headers1).toEqual(headers2);
      expect(headers1).toEqual({
        'X-API-Key': 'api-key',
        'X-API-Secret': 'api-secret'
      });
    });
  });
});