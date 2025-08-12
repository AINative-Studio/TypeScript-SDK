/**
 * React hook for ZeroDB operations
 */

import { useState, useCallback } from 'react';
import { useAINative } from './useAINative';
import type {
  Project,
  CreateProjectRequest,
  Vector,
  UpsertVectorRequest,
  SearchVectorRequest,
  SearchVectorResponse,
  Memory,
  StoreMemoryRequest,
  SearchMemoryRequest
} from '../types/zerodb';

/**
 * Hook for ZeroDB operations with loading states
 * 
 * @example
 * ```tsx
 * import { useZeroDB } from '@ainative/sdk/react';
 * 
 * function MyComponent() {
 *   const { projects, vectors, memory, loading, error } = useZeroDB();
 *   
 *   const createProject = async () => {
 *     const result = await projects.create({
 *       name: 'My Project',
 *       description: 'Test project'
 *     });
 *     console.log(result.data);
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       <button onClick={createProject}>Create Project</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useZeroDB() {
  const client = useAINative();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await request();
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const projects = {
    list: useCallback(async (options?: any) => {
      return handleRequest(() => client.zerodb.projects.list(options));
    }, [client, handleRequest]),

    create: useCallback(async (data: CreateProjectRequest) => {
      return handleRequest(() => client.zerodb.projects.create(data));
    }, [client, handleRequest]),

    get: useCallback(async (projectId: string) => {
      return handleRequest(() => client.zerodb.projects.get(projectId));
    }, [client, handleRequest]),

    update: useCallback(async (projectId: string, data: any) => {
      return handleRequest(() => client.zerodb.projects.update(projectId, data));
    }, [client, handleRequest]),

    delete: useCallback(async (projectId: string) => {
      return handleRequest(() => client.zerodb.projects.delete(projectId));
    }, [client, handleRequest])
  };

  const vectors = {
    upsert: useCallback(async (projectId: string, data: UpsertVectorRequest) => {
      return handleRequest(() => client.zerodb.vectors.upsert(projectId, data));
    }, [client, handleRequest]),

    search: useCallback(async (projectId: string, data: SearchVectorRequest) => {
      return handleRequest(() => client.zerodb.vectors.search(projectId, data));
    }, [client, handleRequest]),

    batchUpsert: useCallback(async (projectId: string, data: any) => {
      return handleRequest(() => client.zerodb.vectors.batchUpsert(projectId, data));
    }, [client, handleRequest]),

    list: useCallback(async (projectId: string, namespace?: string, limit?: number) => {
      return handleRequest(() => client.zerodb.vectors.list(projectId, namespace, limit));
    }, [client, handleRequest])
  };

  const memory = {
    store: useCallback(async (projectId: string, data: StoreMemoryRequest) => {
      return handleRequest(() => client.zerodb.memory.store(projectId, data));
    }, [client, handleRequest]),

    search: useCallback(async (projectId: string, data: SearchMemoryRequest) => {
      return handleRequest(() => client.zerodb.memory.search(projectId, data));
    }, [client, handleRequest]),

    list: useCallback(async (projectId: string, options?: any) => {
      return handleRequest(() => client.zerodb.memory.list(projectId, options));
    }, [client, handleRequest])
  };

  const events = {
    publish: useCallback(async (projectId: string, data: any) => {
      return handleRequest(() => client.zerodb.events.publish(projectId, data));
    }, [client, handleRequest]),

    list: useCallback(async (projectId: string, topic?: string, limit?: number) => {
      return handleRequest(() => client.zerodb.events.list(projectId, topic, limit));
    }, [client, handleRequest]),

    stream: useCallback((projectId: string, options: any) => {
      return client.zerodb.events.stream(projectId, options);
    }, [client])
  };

  const analytics = {
    usage: useCallback(async (projectId: string, days?: number) => {
      return handleRequest(() => client.zerodb.analytics.usage(projectId, days));
    }, [client, handleRequest]),

    costs: useCallback(async (projectId: string, days?: number) => {
      return handleRequest(() => client.zerodb.analytics.costs(projectId, days));
    }, [client, handleRequest]),

    overview: useCallback(async (projectId: string) => {
      return handleRequest(() => client.zerodb.analytics.overview(projectId));
    }, [client, handleRequest])
  };

  return {
    projects,
    vectors,
    memory,
    events,
    analytics,
    loading,
    error
  };
}