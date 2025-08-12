/**
 * Vue composable for AINative client
 */

import { ref, readonly } from 'vue';
import { AINativeClient } from '../client';
import { ClientConfig } from '../types';

let globalClient: AINativeClient | null = null;

/**
 * Vue composable for AINative client
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useAINative } from '@ainative/sdk/vue';
 * 
 * const client = useAINative({
 *   apiKey: 'your-api-key'
 * });
 * 
 * async function checkHealth() {
 *   const response = await client.healthCheck();
 *   console.log(response.data);
 * }
 * </script>
 * ```
 */
export function useAINative(config?: ClientConfig): AINativeClient {
  if (!globalClient && config) {
    globalClient = new AINativeClient(config);
  } else if (!globalClient) {
    throw new Error('AINative client not initialized. Provide config on first call.');
  }
  
  return globalClient;
}

/**
 * Create a new AINative client instance (not global)
 */
export function createAINativeClient(config: ClientConfig): AINativeClient {
  return new AINativeClient(config);
}