/**
 * AINative Studio SDK for TypeScript/JavaScript
 * 
 * Official SDK for interacting with AINative Studio APIs including
 * ZeroDB vector database and Agent Swarm orchestration.
 */

export { AINativeClient } from './client';
export { ZeroDBClient } from './zerodb';
export { AgentSwarmClient } from './agent-swarm';
export { X402Client, parseX402PaymentHeader, parseX402PaymentHeaderOrThrow } from './x402';

// Export types
export * from './types';
export * from './types/zerodb';
export * from './types/agent-swarm';
export * from './types/x402';

// Export errors
export * from './errors';

// Export utilities
export * from './utils';

// Export auth
export * from './auth';

// React hooks (optional import)
export * from './react';

// Default export
import { AINativeClient } from './client';
export default AINativeClient;