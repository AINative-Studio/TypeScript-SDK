/**
 * Vue composable for ZeroDB operations
 */

import { ref, readonly } from 'vue';
import { useAINative } from './useAINative';
import type {
  Project,
  CreateProjectRequest,
  UpsertVectorRequest,
  SearchVectorRequest,
  StoreMemoryRequest,
  SearchMemoryRequest
} from '../types/zerodb';
import type { ClientConfig } from '../types';

/**
 * Vue composable for ZeroDB operations with reactive state
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useZeroDB } from '@ainative/sdk/vue';
 * 
 * const { projects, vectors, loading, error } = useZeroDB({
 *   apiKey: 'your-api-key'
 * });
 * 
 * async function createProject() {
 *   const result = await projects.create({
 *     name: 'My Project',
 *     description: 'Test project'
 *   });
 * }
 * </script>
 * 
 * <template>
 *   <div>
 *     <div v-if="loading">Loading...</div>
 *     <div v-if="error">Error: {{ error.message }}</div>
 *     <button @click="createProject">Create Project</button>
 *   </div>
 * </template>
 * ```
 */
export function useZeroDB(config?: ClientConfig) {
  const client = useAINative(config);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const handleRequest = async <T>(request: () => Promise<T>): Promise<T> => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await request();
      return result;
    } catch (err: any) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const projects = {
    async list(options?: any) {
      return handleRequest(() => client.zerodb.projects.list(options));
    },

    async create(data: CreateProjectRequest) {
      return handleRequest(() => client.zerodb.projects.create(data));
    },

    async get(projectId: string) {
      return handleRequest(() => client.zerodb.projects.get(projectId));
    },

    async update(projectId: string, data: any) {
      return handleRequest(() => client.zerodb.projects.update(projectId, data));
    },

    async delete(projectId: string) {
      return handleRequest(() => client.zerodb.projects.delete(projectId));
    }
  };

  const vectors = {
    async upsert(projectId: string, data: UpsertVectorRequest) {
      return handleRequest(() => client.zerodb.vectors.upsert(projectId, data));
    },

    async search(projectId: string, data: SearchVectorRequest) {
      return handleRequest(() => client.zerodb.vectors.search(projectId, data));
    },

    async batchUpsert(projectId: string, data: any) {
      return handleRequest(() => client.zerodb.vectors.batchUpsert(projectId, data));
    },

    async list(projectId: string, namespace?: string, limit?: number) {
      return handleRequest(() => client.zerodb.vectors.list(projectId, namespace, limit));
    }
  };

  const memory = {
    async store(projectId: string, data: StoreMemoryRequest) {
      return handleRequest(() => client.zerodb.memory.store(projectId, data));
    },

    async search(projectId: string, data: SearchMemoryRequest) {
      return handleRequest(() => client.zerodb.memory.search(projectId, data));
    },

    async list(projectId: string, options?: any) {
      return handleRequest(() => client.zerodb.memory.list(projectId, options));
    }
  };

  const events = {
    async publish(projectId: string, data: any) {
      return handleRequest(() => client.zerodb.events.publish(projectId, data));
    },

    async list(projectId: string, topic?: string, limit?: number) {
      return handleRequest(() => client.zerodb.events.list(projectId, topic, limit));
    },

    stream(projectId: string, options: any) {
      return client.zerodb.events.stream(projectId, options);
    }
  };

  const analytics = {
    async usage(projectId: string, days?: number) {
      return handleRequest(() => client.zerodb.analytics.usage(projectId, days));
    },

    async costs(projectId: string, days?: number) {
      return handleRequest(() => client.zerodb.analytics.costs(projectId, days));
    },

    async overview(projectId: string) {
      return handleRequest(() => client.zerodb.analytics.overview(projectId));
    }
  };

  return {
    projects,
    vectors,
    memory,
    events,
    analytics,
    loading: readonly(loading),
    error: readonly(error)
  };
}