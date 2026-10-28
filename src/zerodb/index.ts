/**
 * ZeroDB client for TypeScript/JavaScript
 */

import type { AINativeClient } from '../client';
import type { ApiResponse, PaginationOptions } from '../types';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Vector,
  UpsertVectorRequest,
  SearchVectorRequest,
  SearchVectorResponse,
  BatchUpsertRequest,
  Memory,
  StoreMemoryRequest,
  SearchMemoryRequest,
  DatabaseStatus,
  DatabaseConfig,
  Event,
  PublishEventRequest,
  StreamEventsOptions,
  FileMetadata,
  UploadFileRequest,
  Analytics,
  UsageMetrics,
  CostAnalysis
} from '../types/zerodb';

export class ZeroDBClient {
  constructor(private client: AINativeClient) {}

  /**
   * Project Management
   */
  projects = {
    /**
     * List all projects
     */
    list: async (options?: PaginationOptions): Promise<ApiResponse<Project[]>> => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      return this.client.get<Project[]>(`/projects?${params}`);
    },

    /**
     * Create a new project
     */
    create: async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
      return this.client.post<Project>('/projects', data);
    },

    /**
     * Get project details
     */
    get: async (projectId: string): Promise<ApiResponse<Project>> => {
      return this.client.get<Project>(`/projects/${projectId}`);
    },

    /**
     * Update project
     */
    update: async (projectId: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
      return this.client.put<Project>(`/projects/${projectId}`, data);
    },

    /**
     * Delete project
     */
    delete: async (projectId: string): Promise<ApiResponse<void>> => {
      return this.client.delete<void>(`/projects/${projectId}`);
    },

    /**
     * Suspend project
     */
    suspend: async (projectId: string): Promise<ApiResponse<Project>> => {
      return this.client.post<Project>(`/projects/${projectId}/suspend`);
    },

    /**
     * Activate project
     */
    activate: async (projectId: string): Promise<ApiResponse<Project>> => {
      return this.client.post<Project>(`/projects/${projectId}/activate`);
    }
  };

  /**
   * Database Management
   */
  database = {
    /**
     * Get database status
     */
    status: async (projectId: string): Promise<ApiResponse<DatabaseStatus>> => {
      return this.client.get<DatabaseStatus>(`/projects/${projectId}/database`);
    },

    /**
     * Enable database for project
     */
    enable: async (projectId: string): Promise<ApiResponse<DatabaseStatus>> => {
      return this.client.post<DatabaseStatus>(`/projects/${projectId}/database`);
    },

    /**
     * Update database configuration
     */
    updateConfig: async (projectId: string, config: DatabaseConfig): Promise<ApiResponse<DatabaseStatus>> => {
      return this.client.put<DatabaseStatus>(`/projects/${projectId}/database`, config);
    }
  };

  /**
   * Vector Operations
   */
  vectors = {
    /**
     * Upsert a vector
     */
    upsert: async (projectId: string, data: UpsertVectorRequest): Promise<ApiResponse<Vector>> => {
      return this.client.post<Vector>(`/projects/${projectId}/database/vectors/upsert`, data);
    },

    /**
     * Search vectors
     */
    search: async (projectId: string, data: SearchVectorRequest): Promise<ApiResponse<SearchVectorResponse>> => {
      return this.client.post<SearchVectorResponse>(`/projects/${projectId}/database/vectors/search`, data);
    },

    /**
     * Batch upsert vectors
     */
    batchUpsert: async (projectId: string, data: BatchUpsertRequest): Promise<ApiResponse<{ inserted: number }>> => {
      return this.client.post<{ inserted: number }>(`/projects/${projectId}/database/vectors/upsert-batch`, data.vectors);
    },

    /**
     * List vectors
     */
    list: async (projectId: string, namespace?: string, limit?: number): Promise<ApiResponse<Vector[]>> => {
      const params = new URLSearchParams();
      if (namespace) params.append('namespace', namespace);
      if (limit) params.append('limit', limit.toString());

      return this.client.get<Vector[]>(`/projects/${projectId}/database/vectors?${params}`);
    }
  };

  /**
   * Memory Operations
   */
  memory = {
    /**
     * Store memory
     */
    store: async (projectId: string, data: StoreMemoryRequest): Promise<ApiResponse<Memory>> => {
      return this.client.post<Memory>(`/projects/${projectId}/database/memory/store`, data);
    },

    /**
     * Search memories
     */
    search: async (projectId: string, data: SearchMemoryRequest): Promise<ApiResponse<Memory[]>> => {
      return this.client.post<Memory[]>(`/projects/${projectId}/database/memory/search`, data);
    },

    /**
     * List memories
     */
    list: async (projectId: string, options?: PaginationOptions): Promise<ApiResponse<Memory[]>> => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      return this.client.get<Memory[]>(`/projects/${projectId}/database/memory?${params}`);
    }
  };

  /**
   * Event Operations
   */
  events = {
    /**
     * Publish an event
     */
    publish: async (projectId: string, data: PublishEventRequest): Promise<ApiResponse<Event>> => {
      return this.client.post<Event>(`/projects/${projectId}/database/events/publish`, data);
    },

    /**
     * List events
     */
    list: async (projectId: string, topic?: string, limit?: number): Promise<ApiResponse<Event[]>> => {
      const params = new URLSearchParams();
      if (topic) params.append('topic', topic);
      if (limit) params.append('limit', limit.toString());

      return this.client.get<Event[]>(`/projects/${projectId}/database/events?${params}`);
    },

    /**
     * Stream events (Server-Sent Events)
     */
    stream: (projectId: string, options: StreamEventsOptions = {}): EventSource => {
      const params = new URLSearchParams();
      if (options.topic) params.append('topic', options.topic);
      if (options.fromTimestamp) params.append('from_timestamp', options.fromTimestamp);

      const url = `${this.client['config'].baseUrl}/projects/${projectId}/database/events/stream?${params}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        if (options.onMessage) {
          try {
            const data = JSON.parse(event.data);
            options.onMessage(data);
          } catch (error) {
            console.error('Failed to parse event:', error);
          }
        }
      };

      eventSource.onerror = (error) => {
        if (options.onError) {
          options.onError(new Error('Event stream error'));
        }
      };

      eventSource.onopen = () => {
        if (options.onConnect) {
          options.onConnect();
        }
      };

      return eventSource;
    }
  };

  /**
   * File Operations
   */
  files = {
    /**
     * Upload file metadata
     */
    upload: async (projectId: string, data: UploadFileRequest): Promise<ApiResponse<FileMetadata>> => {
      return this.client.post<FileMetadata>(`/projects/${projectId}/database/files/upload`, data);
    },

    /**
     * List files
     */
    list: async (projectId: string, options?: PaginationOptions): Promise<ApiResponse<FileMetadata[]>> => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      return this.client.get<FileMetadata[]>(`/projects/${projectId}/database/files?${params}`);
    }
  };

  /**
   * Analytics Operations
   */
  analytics = {
    /**
     * Get usage analytics
     */
    usage: async (projectId: string, days?: number): Promise<ApiResponse<UsageMetrics[]>> => {
      const params = new URLSearchParams();
      if (days) params.append('days', days.toString());

      return this.client.get<UsageMetrics[]>(`/projects/${projectId}/analytics/usage?${params}`);
    },

    /**
     * Get cost analysis
     */
    costs: async (projectId: string, days?: number): Promise<ApiResponse<CostAnalysis>> => {
      const params = new URLSearchParams();
      if (days) params.append('days', days.toString());

      return this.client.get<CostAnalysis>(`/projects/${projectId}/analytics/costs?${params}`);
    },

    /**
     * Get analytics overview
     */
    overview: async (projectId: string): Promise<ApiResponse<Analytics>> => {
      return this.client.get<Analytics>(`/projects/${projectId}/analytics`);
    }
  };
}