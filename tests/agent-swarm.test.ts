/**
 * Tests for Agent Swarm client
 */

import { AgentSwarmClient } from '../src/agent-swarm';
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

describe('AgentSwarmClient', () => {
  let agentSwarmClient: AgentSwarmClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    agentSwarmClient = new AgentSwarmClient(mockClient);
  });

  describe('Swarm Management', () => {
    describe('start', () => {
      it('should start a new swarm', async () => {
        const swarmData = {
          projectId: 'project-123',
          name: 'Test Swarm',
          agents: [{ type: 'data_analyst' as const, config: { maxConcurrentTasks: 3 } }]
        };
        const mockResponse = { data: { id: 'swarm-123', ...swarmData, status: 'starting' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.start(swarmData);
        
        expect(mockClient.post).toHaveBeenCalledWith('/agent-swarm/start', swarmData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('status', () => {
      it('should get swarm status', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { data: { id: swarmId, status: 'running', agents: [] } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.status(swarmId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/status`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('stop', () => {
      it('should stop a swarm', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { data: { message: 'Swarm stopped successfully' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.stop(swarmId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/stop`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('pause', () => {
      it('should pause a swarm', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { data: { id: swarmId, status: 'paused' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.pause(swarmId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/pause`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('resume', () => {
      it('should resume a swarm', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { data: { id: swarmId, status: 'running' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.resume(swarmId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/resume`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list all swarms without project filter', async () => {
        const mockResponse = { data: [{ id: 'swarm-1' }, { id: 'swarm-2' }] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.list();
        
        expect(mockClient.get).toHaveBeenCalledWith('/agent-swarm?');
        expect(response).toBe(mockResponse);
      });

      it('should list swarms for specific project', async () => {
        const projectId = 'project-123';
        const mockResponse = { data: [{ id: 'swarm-1', projectId }] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.swarm.list(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm?project_id=${projectId}`);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Task Orchestration', () => {
    describe('orchestrate', () => {
      it('should orchestrate a new task', async () => {
        const taskData = {
          swarmId: 'swarm-123',
          task: 'Analyze sales data and generate report',
          priority: 'high' as const,
          context: { dataset: 'Q4_sales' }
        };
        const mockResponse = { data: { id: 'task-123', ...taskData, status: 'pending' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.tasks.orchestrate(taskData);
        
        expect(mockClient.post).toHaveBeenCalledWith('/agent-swarm/orchestrate', taskData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('status', () => {
      it('should get task status', async () => {
        const taskId = 'task-123';
        const mockResponse = { data: { id: taskId, status: 'in_progress', progress: 50 } };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.tasks.status(taskId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/tasks/${taskId}`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('cancel', () => {
      it('should cancel a task', async () => {
        const taskId = 'task-123';
        const mockResponse = { data: { message: 'Task cancelled successfully' } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.tasks.cancel(taskId);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/agent-swarm/tasks/${taskId}/cancel`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('list', () => {
      it('should list tasks for a swarm', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { data: [{ id: 'task-1' }, { id: 'task-2' }] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.tasks.list(swarmId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/tasks`);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Agent Management', () => {
    describe('types', () => {
      it('should list available agent types', async () => {
        const mockResponse = { 
          data: [
            { id: 'data_analyst', name: 'Data Analyst', capabilities: ['analysis'] },
            { id: 'report_generator', name: 'Report Generator', capabilities: ['generation'] }
          ]
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.types();
        
        expect(mockClient.get).toHaveBeenCalledWith('/agent-swarm/agent-types');
        expect(response).toBe(mockResponse);
      });
    });

    describe('get', () => {
      it('should get agent details', async () => {
        const agentId = 'agent-123';
        const mockResponse = { 
          data: { 
            id: agentId, 
            type: 'data_analyst', 
            status: 'active',
            currentTask: null
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.get(agentId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/agents/${agentId}`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('add', () => {
      it('should add agent to swarm', async () => {
        const swarmId = 'swarm-123';
        const agentData = { type: 'data_analyst' as const, config: { maxConcurrentTasks: 2 } };
        const mockResponse = { data: { id: 'agent-123', ...agentData, swarmId } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.add(swarmId, agentData);
        
        expect(mockClient.post).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/agents`, agentData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('remove', () => {
      it('should remove agent from swarm', async () => {
        const swarmId = 'swarm-123';
        const agentId = 'agent-123';
        const mockResponse = { data: { message: 'Agent removed successfully' } };
        (mockClient.delete as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.remove(swarmId, agentId);
        
        expect(mockClient.delete).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/agents/${agentId}`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('configurePrompt', () => {
      it('should configure agent prompt', async () => {
        const promptData = {
          agentType: 'data_analyst' as const,
          systemPrompt: 'You are a data analyst...',
          context: { specialization: 'sales_analysis' }
        };
        const mockResponse = { data: { id: 'prompt-123', ...promptData } };
        (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.configurePrompt(promptData);
        
        expect(mockClient.post).toHaveBeenCalledWith('/agent-swarm/prompts', promptData);
        expect(response).toBe(mockResponse);
      });
    });

    describe('getPrompt', () => {
      it('should get agent prompt', async () => {
        const agentType = 'data_analyst' as const;
        const mockResponse = { 
          data: { 
            agentType, 
            systemPrompt: 'You are a data analyst...',
            lastUpdated: '2023-01-01T00:00:00Z'
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.agents.getPrompt(agentType);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/prompts/${agentType}`);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Metrics and Monitoring', () => {
    describe('swarm', () => {
      it('should get swarm metrics', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { 
          data: { 
            swarmId,
            totalTasks: 25,
            completedTasks: 20,
            failedTasks: 2,
            averageTaskDuration: 120,
            activeAgents: 3
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.metrics.swarm(swarmId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/metrics`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('agent', () => {
      it('should get agent metrics', async () => {
        const agentId = 'agent-123';
        const mockResponse = { 
          data: { 
            agentId,
            tasksCompleted: 10,
            averageTaskDuration: 90,
            successRate: 95,
            currentLoad: 2
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.metrics.agent(agentId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/agents/${agentId}/metrics`);
        expect(response).toBe(mockResponse);
      });
    });

    describe('project', () => {
      it('should get project-wide metrics', async () => {
        const projectId = 'project-123';
        const mockResponse = { 
          data: { 
            projectId,
            totalSwarms: 5,
            totalAgents: 15,
            totalTasks: 100,
            resourceUtilization: 75
          } 
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.metrics.project(projectId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/projects/${projectId}/metrics`);
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Event Streaming', () => {
    describe('stream', () => {
      it('should create event stream for swarm', () => {
        const swarmId = 'swarm-123';
        const onEvent = jest.fn();
        
        const eventSource = agentSwarmClient.events.stream(swarmId, onEvent);
        
        expect(EventSource).toHaveBeenCalledWith(
          `https://test-api.com/api/v1/agent-swarm/${swarmId}/events`
        );
        expect(eventSource).toBe(mockEventSource);
      });

      it('should handle event messages', () => {
        const swarmId = 'swarm-123';
        const onEvent = jest.fn();
        
        agentSwarmClient.events.stream(swarmId, onEvent);
        
        // Simulate event message
        const eventData = {
          type: 'task_completed',
          taskId: 'task-123',
          agentId: 'agent-456',
          timestamp: '2023-01-01T00:00:00Z',
          result: { status: 'success' }
        };
        const mockEvent = { data: JSON.stringify(eventData) };
        
        if (mockEventSource.onmessage) {
          mockEventSource.onmessage(mockEvent);
        }
        
        expect(onEvent).toHaveBeenCalledWith(eventData);
      });

      it('should handle JSON parse errors', () => {
        const swarmId = 'swarm-123';
        const onEvent = jest.fn();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        agentSwarmClient.events.stream(swarmId, onEvent);
        
        // Simulate invalid JSON
        const mockEvent = { data: 'invalid-json-data' };
        
        if (mockEventSource.onmessage) {
          mockEventSource.onmessage(mockEvent);
        }
        
        expect(onEvent).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to parse swarm event:',
          expect.any(Error)
        );
        
        consoleSpy.mockRestore();
      });
    });

    describe('history', () => {
      it('should get historical events without limit', async () => {
        const swarmId = 'swarm-123';
        const mockResponse = { 
          data: [
            { type: 'task_started', taskId: 'task-1', timestamp: '2023-01-01T00:00:00Z' },
            { type: 'task_completed', taskId: 'task-1', timestamp: '2023-01-01T01:00:00Z' }
          ]
        };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.events.history(swarmId);
        
        expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/events/history?`);
        expect(response).toBe(mockResponse);
      });

      it('should get historical events with limit', async () => {
        const swarmId = 'swarm-123';
        const limit = 50;
        const mockResponse = { data: [] };
        (mockClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await agentSwarmClient.events.history(swarmId, limit);
        
        expect(mockClient.get).toHaveBeenCalledWith(
          `/agent-swarm/${swarmId}/events/history?limit=${limit}`
        );
        expect(response).toBe(mockResponse);
      });
    });
  });

  describe('Integration tests', () => {
    it('should handle complex swarm lifecycle', async () => {
      const projectId = 'project-123';
      const swarmData = {
        projectId,
        name: 'Complex Analysis Swarm',
        agents: [
          { type: 'data_analyst' as const, config: { specialization: 'sales' } },
          { type: 'report_generator' as const, config: { format: 'pdf' } }
        ]
      };

      // Start swarm
      const startResponse = { data: { id: 'swarm-456', ...swarmData, status: 'running' } };
      (mockClient.post as jest.Mock).mockResolvedValue(startResponse);
      
      const swarm = await agentSwarmClient.swarm.start(swarmData);
      expect(swarm.data.id).toBe('swarm-456');

      // Orchestrate task
      const taskData = {
        swarmId: 'swarm-456',
        task: 'Generate comprehensive sales analysis',
        priority: 'high' as const
      };
      const taskResponse = { data: { id: 'task-789', ...taskData, status: 'pending' } };
      (mockClient.post as jest.Mock).mockResolvedValue(taskResponse);
      
      const task = await agentSwarmClient.tasks.orchestrate(taskData);
      expect(task.data.id).toBe('task-789');

      // Get metrics
      const metricsResponse = { data: { swarmId: 'swarm-456', totalTasks: 1 } };
      (mockClient.get as jest.Mock).mockResolvedValue(metricsResponse);
      
      const metrics = await agentSwarmClient.metrics.swarm('swarm-456');
      expect(metrics.data.swarmId).toBe('swarm-456');

      // Stop swarm
      const stopResponse = { data: { message: 'Swarm stopped successfully' } };
      (mockClient.post as jest.Mock).mockResolvedValue(stopResponse);
      
      const stopResult = await agentSwarmClient.swarm.stop('swarm-456');
      expect(stopResult.data.message).toContain('stopped successfully');
    });

    it('should handle error scenarios gracefully', async () => {
      const swarmId = 'nonexistent-swarm';
      const error = new Error('Swarm not found');
      (mockClient.get as jest.Mock).mockRejectedValue(error);

      await expect(agentSwarmClient.swarm.status(swarmId)).rejects.toThrow('Swarm not found');
      expect(mockClient.get).toHaveBeenCalledWith(`/agent-swarm/${swarmId}/status`);
    });
  });
});