/**
 * Main AINative Client for TypeScript/JavaScript
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { EventEmitter } from 'eventemitter3';
import { ClientConfig, AuthConfig, RequestOptions, ApiResponse, ApiError } from './types';
import { ZeroDBClient } from './zerodb';
import { AgentSwarmClient } from './agent-swarm';
import { AuthManager } from './auth';
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
} from './errors';

export class AINativeClient extends EventEmitter {
  private config: Required<ClientConfig>;
  private httpClient: AxiosInstance;
  private authManager: AuthManager;
  private _zerodb?: ZeroDBClient;
  private _agentSwarm?: AgentSwarmClient;

  constructor(config: ClientConfig = {}) {
    super();

    // Initialize configuration with defaults
    this.config = {
      baseUrl: config.baseUrl || 'https://api.ainative.studio',
      apiKey: config.apiKey || '',
      organizationId: config.organizationId || '',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      debug: config.debug || false,
      headers: config.headers || {}
    };

    // Ensure base URL format
    if (!this.config.baseUrl.endsWith('/api/v1')) {
      this.config.baseUrl = `${this.config.baseUrl.replace(/\/$/, '')}/api/v1`;
    }

    // Initialize auth manager
    this.authManager = new AuthManager({
      apiKey: this.config.apiKey
    });

    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    });

    // Setup interceptors
    this.setupInterceptors();

    // Debug logging
    if (this.config.debug) {
      this.enableDebugLogging();
    }
  }

  /**
   * Get ZeroDB client
   */
  get zerodb(): ZeroDBClient {
    if (!this._zerodb) {
      this._zerodb = new ZeroDBClient(this);
    }
    return this._zerodb;
  }

  /**
   * Get Agent Swarm client
   */
  get agentSwarm(): AgentSwarmClient {
    if (!this._agentSwarm) {
      this._agentSwarm = new AgentSwarmClient(this);
    }
    return this._agentSwarm;
  }

  /**
   * Make an authenticated request
   */
  async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      timeout: options.timeout || this.config.timeout,
      signal: options.signal,
      headers: {
        ...this.authManager.getHeaders(),
        ...options.headers
      }
    };

    // Add organization ID if set
    if (this.config.organizationId) {
      config.headers!['X-Organization-ID'] = this.config.organizationId;
    }

    let lastError: Error | null = null;
    let retries = 0;

    while (retries <= this.config.maxRetries) {
      try {
        const response = await this.httpClient.request<T>(config);
        
        return {
          data: response.data,
          status: response.status,
          headers: response.headers as Record<string, string>,
          meta: {
            requestId: response.headers['x-request-id'],
            timestamp: new Date().toISOString()
          }
        };
      } catch (error: any) {
        lastError = this.handleError(error);
        
        // Don't retry on auth errors
        if (lastError instanceof AuthenticationError) {
          throw lastError;
        }

        // Handle rate limiting
        if (lastError instanceof RateLimitError) {
          const retryAfter = error.response?.headers['retry-after'];
          if (retryAfter) {
            await this.sleep(parseInt(retryAfter) * 1000);
          }
        }

        // Retry logic
        if (retries < this.config.maxRetries) {
          retries++;
          await this.sleep(this.config.retryDelay * Math.pow(2, retries - 1));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new NetworkError('Request failed after retries');
  }

  /**
   * GET request helper
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST request helper
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT request helper
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.authManager.setApiKey(apiKey);
  }

  /**
   * Set organization ID
   */
  setOrganizationId(organizationId: string): void {
    this.config.organizationId = organizationId;
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        this.emit('request', config);
        return config;
      },
      (error) => {
        this.emit('request:error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        this.emit('response', response);
        return response;
      },
      (error) => {
        this.emit('response:error', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle errors and convert to SDK errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.detail || data?.message || error.message;

      switch (status) {
        case 400:
          return new ValidationError(message);
        case 401:
          return new AuthenticationError(message);
        case 403:
          return new AuthorizationError(message);
        case 404:
          return new NotFoundError(message);
        case 408:
          return new TimeoutError(message);
        case 429:
          return new RateLimitError(message, error.response.headers['retry-after']);
        case 500:
        case 502:
        case 503:
          return new ServerError(message, status);
        default:
          return new AINativeError(message, status.toString(), status);
      }
    } else if (error.request) {
      return new NetworkError('No response received from server');
    } else if (error.code === 'ECONNABORTED') {
      return new TimeoutError('Request timed out');
    } else {
      return new NetworkError(error.message);
    }
  }

  /**
   * Enable debug logging
   */
  private enableDebugLogging(): void {
    this.on('request', (config) => {
      console.log('[AINative] Request:', {
        method: config.method,
        url: config.url,
        headers: config.headers
      });
    });

    this.on('response', (response) => {
      console.log('[AINative] Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    });

    this.on('response:error', (error) => {
      console.error('[AINative] Error:', error.message);
    });
  }

  /**
   * Sleep helper for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}