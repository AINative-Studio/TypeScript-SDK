/**
 * Type definitions for ZeroDB operations
 */

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  databaseEnabled: boolean;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  type?: 'development' | 'production';
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'suspended';
}

export interface Vector {
  id?: string;
  projectId: string;
  embedding: number[];
  namespace?: string;
  metadata?: Record<string, any>;
  document?: string;
  source?: string;
  createdAt?: string;
}

export interface UpsertVectorRequest {
  vectorId?: string;
  vectorEmbedding: number[];
  namespace?: string;
  metadata?: Record<string, any>;
  document?: string;
  source?: string;
}

export interface SearchVectorRequest {
  queryVector: number[];
  namespace?: string;
  topK?: number;
  similarityThreshold?: number;
  filter?: Record<string, any>;
}

export interface SearchVectorResponse {
  vectors: Vector[];
  totalCount: number;
  searchTimeMs: number;
}

export interface BatchUpsertRequest {
  vectors: UpsertVectorRequest[];
}

export interface Memory {
  id: string;
  projectId: string;
  content: string;
  agentId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StoreMemoryRequest {
  content: string;
  agentId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  memoryMetadata?: Record<string, any>;
}

export interface SearchMemoryRequest {
  query: string;
  sessionId?: string;
  agentId?: string;
  role?: 'user' | 'assistant' | 'system';
  limit?: number;
}

export interface DatabaseStatus {
  enabled: boolean;
  projectId: string;
  tablesCount: number;
  vectorsCount: number;
  memoryRecordsCount: number;
  eventsCount: number;
  filesCount: number;
  storageUsedMb: number;
  lastActivity?: string;
}

export interface DatabaseConfig {
  vectorDimensions?: number;
  quantumEnabled?: boolean;
  collections?: string[];
}

export interface Event {
  id: string;
  projectId: string;
  topic: string;
  eventPayload: Record<string, any>;
  publishedAt: string;
}

export interface PublishEventRequest {
  topic: string;
  eventPayload: Record<string, any>;
}

export interface StreamEventsOptions {
  topic?: string;
  fromTimestamp?: string;
  onMessage?: (event: Event) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface FileMetadata {
  id: string;
  projectId: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
  uploadedAt: string;
}

export interface UploadFileRequest {
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface Analytics {
  projectId: string;
  period: string;
  metrics: {
    totalRequests: number;
    totalVectors: number;
    totalMemories: number;
    totalEvents: number;
    storageUsedMb: number;
    activeUsers: number;
  };
  trends: {
    requests: number[];
    vectors: number[];
    memories: number[];
  };
}

export interface UsageMetrics {
  projectId: string;
  date: string;
  apiCalls: number;
  vectorOperations: number;
  memoryOperations: number;
  eventOperations: number;
  storageUsedMb: number;
  bandwidthUsedMb: number;
}

export interface CostAnalysis {
  projectId: string;
  period: string;
  totalCost: number;
  breakdown: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
    compute: number;
  };
  projectedMonthlyCost: number;
}