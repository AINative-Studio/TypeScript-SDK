/**
 * Tests for ZeroDB client
 */

import { ZeroDBClient } from '../src/zerodb';
import { AINativeClient } from '../src/client';

// Mock the client
const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  config: { baseUrl: 'https://test-api.com/api/v1' }
} as unknown as AINativeClient;

// Mock EventSource
const mockEventSource = {
  close: jest.fn(),
  onmessage: null as any,
  onerror: null as any,
  onopen: null as any
};

(global as any).EventSource = jest.fn().mockImplementation(() => mockEventSource);

describe('ZeroDBClient', () => {
  let zerodbClient: ZeroDBClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    zerodbClient = new ZeroDBClient(mockClient);
  });

  describe('Projects', () => {
    describe('list', () => {
      it('should list projects without options', async () => {
        const mockResponse = { data: [{ id: '1', name: 'Test Project' }] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.list();
        
        expect(mockClient.get).toHaveBeenCalledWith('/public/projects?');
        expect(response).toBe(mockResponse);
      });

      it('should list projects with pagination options', async () => {
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.projects.list({ limit: 10, offset: 20 });
        
        expect(mockClient.get).toHaveBeenCalledWith('/public/projects?limit=10&offset=20');
      });

      it('should handle partial pagination options', async () => {
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.projects.list({ limit: 5 });
        
        expect(mockClient.get).toHaveBeenCalledWith('/public/projects?limit=5');
      });
    });

    describe('create', () => {
      it('should create a new project', async () => {
        const projectData = { name: 'New Project', description: 'Test description' };
        const mockResponse = { data: { id: 'new-id', ...projectData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.create(projectData);
        
        expect(mockClient.post).toHaveBeenCalledWith('/public/projects', projectData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('get', () => {
      it('should get project details', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { id: projectId, name: 'Test Project' } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.get(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/public/projects/${projectId}`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('update', () => {
      it('should update project', async () => {
        const projectId = 'project-123';
        const updateData = { name: 'Updated Project' };
        const mockResponse = { data: { id: projectId, ...updateData } };
        (mockClient.put as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.update(projectId, updateData);
        
        expect(mockClient.put).toHaveBeenCalledWith(`/public/projects/${projectId}`, updateData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('delete', () => {
      it('should delete project', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: undefined };
        (mockClient.delete as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.delete(projectId);
        
        expect(mockClient.delete).toHaveBeenCalledWith(`/public/projects/${projectId}`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('suspend', () => {
      it('should suspend project', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { id: projectId, status: 'suspended' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.suspend(projectId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/public/projects/${projectId}/suspend`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('activate', () => {
      it('should activate project', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { id: projectId, status: 'active' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.projects.activate(projectId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/public/projects/${projectId}/activate`);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Database', () => {
    describe('status', () => {
      it('should get database status', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { enabled: true, status: 'healthy' } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.database.status(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/public/projects/${projectId}/database`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('enable', () => {
      it('should enable database', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { enabled: true, status: 'initializing' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.database.enable(projectId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/public/projects/${projectId}/database`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('updateConfig', () => {
      it('should update database configuration', async () => {
        const projectId = 'project-123';
        const config = { vectorDimensions: 1536, indexType: 'hnsw' };
        const mockResponse = { data: { enabled: true, config } };
        (mockClient.put as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.database.updateConfig(projectId, config);
        
        expect(mockClient.put).toHaveBeenCalledWith(`/public/projects/${projectId}/database`, config);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Vectors', () => {
    describe('upsert', () => {
      it('should upsert a vector', async () => {
        const projectId = 'project-123';
        const vectorData = {
          vectorEmbedding: [0.1, 0.2, 0.3],
          metadata: { title: 'Test' },
          namespace: 'test'
        };
        const mockResponse = { data: { id: 'vector-123', ...vectorData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.vectors.upsert(projectId, vectorData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors/upsert`,
          vectorData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('search', () => {
      it('should search vectors', async () => {
        const projectId = 'project-123';
        const searchData = {
          queryVector: [0.1, 0.2, 0.3],
          topK: 5,
          namespace: 'test'
        };
        const mockResponse = { data: { vectors: [], totalCount: 0 } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.vectors.search(projectId, searchData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors/search`,
          searchData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('batchUpsert', () => {
      it('should batch upsert vectors', async () => {
        const projectId = 'project-123';
        const batchData = {
          vectors: [
            { vectorEmbedding: [0.1, 0.2], metadata: { id: 1 } },
            { vectorEmbedding: [0.3, 0.4], metadata: { id: 2 } }
          ]
        };
        const mockResponse = { data: { inserted: 2 } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.vectors.batchUpsert(projectId, batchData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors/upsert-batch`,
          batchData.vectors
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list vectors without filters', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.vectors.list(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should list vectors with namespace and limit', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.vectors.list(projectId, 'test-namespace', 10);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors?namespace=test-namespace&limit=10`
        );
      });

      it('should list vectors with partial filters', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.vectors.list(projectId, undefined, 5);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/vectors?limit=5`
        );
      });
    });
  });

  describe('Memory', () => {
    describe('store', () => {
      it('should store memory', async () => {
        const projectId = 'project-123';
        const memoryData = {
          content: 'Test memory content',
          agentId: 'agent-123',
          sessionId: 'session-123',
          role: 'user' as const,
          memoryMetadata: { importance: 'high' }
        };
        const mockResponse = { data: { id: 'memory-123', ...memoryData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.memory.store(projectId, memoryData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/memory/store`,
          memoryData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('search', () => {
      it('should search memories', async () => {
        const projectId = 'project-123';
        const searchData = {
          query: 'test search',
          limit: 10
        };
        const mockResponse = { data: [] };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.memory.search(projectId, searchData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/memory/search`,
          searchData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list memories without options', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.memory.list(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/memory?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should list memories with pagination', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.memory.list(projectId, { limit: 20, offset: 10 });
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/memory?limit=20&offset=10`
        );
      });
    });
  });

  describe('Events', () => {
    describe('publish', () => {
      it('should publish an event', async () => {
        const projectId = 'project-123';
        const eventData = {
          topic: 'user-activity',
          eventPayload: { action: 'login', userId: '123' }
        };
        const mockResponse = { data: { id: 'event-123', ...eventData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.events.publish(projectId, eventData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/events/publish`,
          eventData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list events without filters', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.events.list(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/events?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should list events with topic and limit', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.events.list(projectId, 'user-activity', 50);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/events?topic=user-activity&limit=50`
        );
      });
    });

    describe('stream', () => {
      it('should create event stream without options', () => {
        const projectId = 'project-123';
        
        const eventSource = zerodbClient.events.stream(projectId);
        
        expect(EventSource).toHaveBeenCalledWith(
          `https://test-api.com/api/v1/public/projects/${projectId}/database/events/stream?`
        );
        expect(eventSource).toBe(mockEventSource);
      });

      it('should create event stream with options', () => {
        const projectId = 'project-123';
        const options = {
          topic: 'user-activity',
          fromTimestamp: '2023-01-01T00:00:00Z'
        };
        
        const eventSource = zerodbClient.events.stream(projectId, options);
        
        expect(EventSource).toHaveBeenCalledWith(
          `https://test-api.com/api/v1/public/projects/${projectId}/database/events/stream?topic=user-activity&from_timestamp=2023-01-01T00%3A00%3A00Z`
        );
      });

      it('should handle onMessage callback', () => {
        const projectId = 'project-123';
        const onMessage = jest.fn();
        
        zerodbClient.events.stream(projectId, { onMessage });
        
        // Simulate message event
        const eventData = { type: 'test', payload: { test: true } };
        const mockEvent = { data: JSON.stringify(eventData) };
        
        if (mockEventSource.onmessage) {
          mockEventSource.onmessage(mockEvent);
        }
        
        expect(onMessage).toHaveBeenCalledWith(eventData);
      });

      it('should handle JSON parse error in onMessage', () => {
        const projectId = 'project-123';
        const onMessage = jest.fn();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        zerodbClient.events.stream(projectId, { onMessage });
        
        // Simulate invalid JSON
        const mockEvent = { data: 'invalid-json' };
        
        if (mockEventSource.onmessage) {
          mockEventSource.onmessage(mockEvent);
        }
        
        expect(onMessage).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to parse event:',
          expect.any(Error)
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle onError callback', () => {
        const projectId = 'project-123';
        const onError = jest.fn();
        
        zerodbClient.events.stream(projectId, { onError });
        
        // Simulate error event
        if (mockEventSource.onerror) {
          mockEventSource.onerror(new Event('error'));
        }
        
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should handle onConnect callback', () => {
        const projectId = 'project-123';
        const onConnect = jest.fn();
        
        zerodbClient.events.stream(projectId, { onConnect });
        
        // Simulate open event
        if (mockEventSource.onopen) {
          mockEventSource.onopen(new Event('open'));
        }
        
        expect(onConnect).toHaveBeenCalled();
      });
    });
  });

  describe('Files', () => {
    describe('upload', () => {
      it('should upload file metadata', async () => {
        const projectId = 'project-123';
        const fileData = {
          fileKey: 'files/test.txt',
          fileName: 'test.txt',
          fileSize: 1024,
          mimeType: 'text/plain'
        };
        const mockResponse = { data: { id: 'file-123', ...fileData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.files.upload(projectId, fileData);
        
        expect(mockClient.post).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/files/upload`,
          fileData
        );
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list files without pagination', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.files.list(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/files?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should list files with pagination', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.files.list(projectId, { limit: 25, offset: 50 });
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/database/files?limit=25&offset=50`
        );
      });
    });
  });

  describe('Analytics', () => {
    describe('usage', () => {
      it('should get usage analytics without days', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.analytics.usage(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/analytics/usage?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should get usage analytics with days', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.analytics.usage(projectId, 30);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/analytics/usage?days=30`
        );
      });
    });

    describe('costs', () => {
      it('should get cost analysis without days', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { totalCost: 10.50, breakdown: [] } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.analytics.costs(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/analytics/costs?`
        );
        expect(response).toBe(mockResponse);
      });

      it('should get cost analysis with days', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: { totalCost: 5.25, breakdown: [] } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        await zerodbClient.analytics.costs(projectId, 7);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/analytics/costs?days=7`
        );
      });
    });

    describe('overview', () => {
      it('should get analytics overview', async () => {
        const projectId = 'project-123';
        const mockResponse = { 
          data: { 
            totalVectors: 1000,
            totalMemories: 50,
            totalEvents: 500
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await zerodbClient.analytics.overview(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/public/projects/${projectId}/analytics`
        );
        expect(response).toBe(mockResponse);
      });
    });
  });
});