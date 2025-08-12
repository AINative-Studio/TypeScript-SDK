/**
 * React Context Provider for AINative SDK
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { AINativeClient } from '../client';
import { ClientConfig } from '../types';

export interface AINativeContextValue {
  client: AINativeClient;
}

const AINativeContext = createContext<AINativeContextValue | undefined>(undefined);

export interface AINativeProviderProps {
  children: ReactNode;
  config?: ClientConfig;
  client?: AINativeClient;
}

/**
 * AINative Provider component
 * 
 * @example
 * ```tsx
 * import { AINativeProvider } from '@ainative/sdk/react';
 * 
 * function App() {
 *   return (
 *     <AINativeProvider config={{ apiKey: 'your-api-key' }}>
 *       <YourApp />
 *     </AINativeProvider>
 *   );
 * }
 * ```
 */
export function AINativeProvider({ 
  children, 
  config,
  client: providedClient 
}: AINativeProviderProps) {
  const client = useMemo(() => {
    return providedClient || new AINativeClient(config);
  }, [providedClient, config]);

  const value = useMemo(() => ({
    client
  }), [client]);

  return (
    <AINativeContext.Provider value={value}>
      {children}
    </AINativeContext.Provider>
  );
}

/**
 * Hook to access AINative context
 */
export function useAINativeContext(): AINativeContextValue {
  const context = useContext(AINativeContext);
  
  if (!context) {
    throw new Error('useAINativeContext must be used within an AINativeProvider');
  }
  
  return context;
}