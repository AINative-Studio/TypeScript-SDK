/**
 * Authentication manager for AINative SDK
 */

import { AuthConfig } from './types';

export class AuthManager {
  private config: AuthConfig;

  constructor(config: AuthConfig = {}) {
    this.config = config;
  }

  /**
   * Get authentication headers
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // API Key authentication (preferred)
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }
    // JWT Bearer token authentication
    else if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }

    // Add API secret if provided (for enhanced security)
    if (this.config.apiSecret) {
      headers['X-API-Secret'] = this.config.apiSecret;
    }

    return headers;
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Set API secret
   */
  setApiSecret(apiSecret: string): void {
    this.config.apiSecret = apiSecret;
  }

  /**
   * Set JWT token
   */
  setToken(token: string): void {
    this.config.token = token;
    
    // Call refresh callback if provided
    if (this.config.onTokenRefresh) {
      this.config.onTokenRefresh(token);
    }
  }

  /**
   * Clear authentication
   */
  clear(): void {
    this.config = {};
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.config.apiKey || this.config.token);
  }

  /**
   * Get authentication type
   */
  getAuthType(): 'api-key' | 'token' | 'none' {
    if (this.config.apiKey) return 'api-key';
    if (this.config.token) return 'token';
    return 'none';
  }
}