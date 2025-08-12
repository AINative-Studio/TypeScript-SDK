/**
 * Tests for AINative client
 */

import { AINativeClient } from '../src/client';
import { 
  AuthenticationError, 
  NetworkError, 
  RateLimitError,
  ServerError,
  ValidationError,
  NotFoundError,
  TimeoutError,
  AuthorizationError
} from '../src/errors';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('AINativeClient', () => {
  let client: AINativeClient;

  beforeEach(() => {
    client = new AINativeClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://test.api.com'
    });
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultClient = new AINativeClient();
      expect(defaultClient['config'].baseUrl).toBe('https://api.ainative.studio/api/v1');
      expect(defaultClient['config'].timeout).toBe(30000);
    });

    it('should initialize with custom configuration', () => {
      expect(client['config'].apiKey).toBe('test-api-key');
      expect(client['config'].baseUrl).toBe('https://test.api.com/api/v1');
    });

    it('should not add /api/v1 if already present', () => {
      const clientWithApiPath = new AINativeClient({
        baseUrl: 'https://test.api.com/api/v1'
      });
      expect(clientWithApiPath['config'].baseUrl).toBe('https://test.api.com/api/v1');
    });
  });

  describe('setApiKey', () => {
    it('should update API key', () => {
      const newKey = 'new-api-key';
      client.setApiKey(newKey);
      expect(client['config'].apiKey).toBe(newKey);
    });
  });

  describe('setOrganizationId', () => {
    it('should update organization ID', () => {
      const orgId = 'org-123';
      client.setOrganizationId(orgId);
      expect(client['config'].organizationId).toBe(orgId);
    });
  });

  describe('client properties', () => {
    it('should initialize ZeroDB client', () => {
      const zerodb = client.zerodb;
      expect(zerodb).toBeDefined();
      expect(client.zerodb).toBe(zerodb); // Should return same instance
    });

    it('should initialize Agent Swarm client', () => {
      const agentSwarm = client.agentSwarm;
      expect(agentSwarm).toBeDefined();
      expect(client.agentSwarm).toBe(agentSwarm); // Should return same instance
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      // Mock the httpClient.request method
      const mockRequest = client['httpClient'].request as jest.Mock;
      mockRequest.mockImplementation(() => {
        const error: any = new Error('Network error');
        error.response = {
          status: 401,
          data: { message: 'Unauthorized' }
        };
        throw error;
      });
    });

    it('should handle authentication errors', async () => {
      await expect(client.get('/test')).rejects.toThrow(AuthenticationError);
    });
  });

  describe('request helpers', () => {
    beforeEach(() => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      mockRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        headers: {}
      });
    });

    it('should make GET requests', async () => {
      const response = await client.get('/test');
      expect(response.data).toEqual({ success: true });
      expect(response.status).toBe(200);
    });

    it('should make POST requests', async () => {
      const data = { name: 'test' };
      const response = await client.post('/test', data);
      expect(response.data).toEqual({ success: true });
    });

    it('should make PUT requests', async () => {
      const data = { name: 'test' };
      const response = await client.put('/test', data);
      expect(response.data).toEqual({ success: true });
    });

    it('should make DELETE requests', async () => {
      const response = await client.delete('/test');
      expect(response.data).toEqual({ success: true });
    });

    it('should make PATCH requests', async () => {
      const data = { name: 'test' };
      const response = await client.patch('/test', data);
      expect(response.data).toEqual({ success: true });
    });
  });

  describe('healthCheck', () => {
    beforeEach(() => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      mockRequest.mockResolvedValue({
        data: { status: 'healthy', timestamp: '2023-01-01T00:00:00Z' },
        status: 200,
        headers: {}
      });
    });

    it('should perform health check', async () => {
      const response = await client.healthCheck();
      expect(response.data.status).toBe('healthy');
    });
  });

  describe('advanced error handling', () => {
    it('should handle rate limit errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Rate limited');
      error.response = {
        status: 429,
        data: { message: 'Rate limit exceeded' },
        headers: { 'retry-after': '60' }
      };
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(RateLimitError);
    });

    it('should handle server errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Server error');
      error.response = {
        status: 500,
        data: { message: 'Internal server error' }
      };
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(ServerError);
    });

    it('should handle validation errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Validation error');
      error.response = {
        status: 400,
        data: { message: 'Invalid input' }
      };
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(ValidationError);
    });

    it('should handle not found errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Not found');
      error.response = {
        status: 404,
        data: { message: 'Resource not found' }
      };
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(NotFoundError);
    });

    it('should handle authorization errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Forbidden');
      error.response = {
        status: 403,
        data: { message: 'Access forbidden' }
      };
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(AuthorizationError);
    });

    it('should handle timeout errors', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error: any = new Error('Timeout');
      error.code = 'ECONNABORTED';
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(TimeoutError);
    });

    it('should handle network errors without response', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      const error = new Error('Network error');
      mockRequest.mockRejectedValue(error);
      
      await expect(client.get('/test')).rejects.toThrow(NetworkError);
    });
  });

  describe('configuration edge cases', () => {
    it('should handle custom headers', () => {
      const customClient = new AINativeClient({
        apiKey: 'test-key',
        headers: { 'Custom-Header': 'value' }
      });
      expect(customClient['config'].headers).toEqual({ 'Custom-Header': 'value' });
    });

    it('should handle custom timeout', () => {
      const customClient = new AINativeClient({
        timeout: 5000
      });
      expect(customClient['config'].timeout).toBe(5000);
    });

    it('should handle debug mode', () => {
      const customClient = new AINativeClient({
        debug: true
      });
      expect(customClient['config'].debug).toBe(true);
    });

    it('should handle max retries configuration', () => {
      const customClient = new AINativeClient({
        maxRetries: 5
      });
      expect(customClient['config'].maxRetries).toBe(5);
    });

    it('should handle retry delay configuration', () => {
      const customClient = new AINativeClient({
        retryDelay: 2000
      });
      expect(customClient['config'].retryDelay).toBe(2000);
    });
  });

  describe('request configuration', () => {
    it('should handle request with custom config', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      mockRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        headers: {}
      });

      const response = await client.get('/test', { timeout: 1000 });
      expect(response.data).toEqual({ success: true });
      expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
        timeout: 1000
      }));
    });

    it('should handle request with additional headers', async () => {
      const mockRequest = client['httpClient'].request as jest.Mock;
      mockRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        headers: {}
      });

      const response = await client.post('/test', { data: 'test' }, {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(response.data).toEqual({ success: true });
    });
  });

  describe('event emitter functionality', () => {
    it('should emit request events', () => {
      const requestListener = jest.fn();
      client.on('request', requestListener);
      
      // Since we can't easily trigger the actual request event in this mock setup,
      // we'll test that the event emitter is working
      client.emit('request', { method: 'GET', url: '/test' });
      expect(requestListener).toHaveBeenCalledWith({ method: 'GET', url: '/test' });
    });

    it('should emit response events', () => {
      const responseListener = jest.fn();
      client.on('response', responseListener);
      
      client.emit('response', { status: 200, data: {} });
      expect(responseListener).toHaveBeenCalledWith({ status: 200, data: {} });
    });

    it('should emit error events', () => {
      const errorListener = jest.fn();
      client.on('error', errorListener);
      
      const error = new Error('Test error');
      client.emit('error', error);
      expect(errorListener).toHaveBeenCalledWith(error);
    });
  });

  describe('lazy client initialization', () => {
    it('should initialize zerodb client only when accessed', () => {
      const freshClient = new AINativeClient();
      expect(freshClient['_zerodb']).toBeUndefined();
      
      const zerodb = freshClient.zerodb;
      expect(freshClient['_zerodb']).toBeDefined();
      expect(zerodb).toBe(freshClient['_zerodb']);
    });

    it('should initialize agent swarm client only when accessed', () => {
      const freshClient = new AINativeClient();
      expect(freshClient['_agentSwarm']).toBeUndefined();
      
      const agentSwarm = freshClient.agentSwarm;
      expect(freshClient['_agentSwarm']).toBeDefined();
      expect(agentSwarm).toBe(freshClient['_agentSwarm']);
    });
  });
});