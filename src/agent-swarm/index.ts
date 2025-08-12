/**
 * Agent Swarm client for TypeScript/JavaScript
 */

import type { AINativeClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  Agent,
  AgentType,
  Swarm,
  SwarmStatus,
  StartSwarmRequest,
  OrchestrateTaskRequest,
  Task,
  SwarmMetrics,
  AgentPrompt,
  ConfigureAgentPromptRequest,
  SwarmEvent
} from '../types/agent-swarm';

export class AgentSwarmClient {
  constructor(private client: AINativeClient) {}

  /**
   * Swarm Management
   */
  swarm = {
    /**
     * Start a new agent swarm
     */
    start: async (data: StartSwarmRequest): Promise<ApiResponse<Swarm>> => {
      return this.client.post<Swarm>('/agent-swarm/start', data);
    },

    /**
     * Get swarm status
     */
    status: async (swarmId: string): Promise<ApiResponse<Swarm>> => {
      return this.client.get<Swarm>(`/agent-swarm/${swarmId}/status`);
    },

    /**
     * Stop a running swarm
     */
    stop: async (swarmId: string): Promise<ApiResponse<{ message: string }>> => {
      return this.client.post<{ message: string }>(`/agent-swarm/${swarmId}/stop`);
    },

    /**
     * Pause a running swarm
     */
    pause: async (swarmId: string): Promise<ApiResponse<Swarm>> => {
      return this.client.post<Swarm>(`/agent-swarm/${swarmId}/pause`);
    },

    /**
     * Resume a paused swarm
     */
    resume: async (swarmId: string): Promise<ApiResponse<Swarm>> => {
      return this.client.post<Swarm>(`/agent-swarm/${swarmId}/resume`);
    },

    /**
     * List all swarms
     */
    list: async (projectId?: string): Promise<ApiResponse<Swarm[]>> => {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId);
      
      return this.client.get<Swarm[]>(`/agent-swarm?${params}`);
    }
  };

  /**
   * Task Orchestration
   */
  tasks = {
    /**
     * Orchestrate a new task
     */
    orchestrate: async (data: OrchestrateTaskRequest): Promise<ApiResponse<Task>> => {
      return this.client.post<Task>('/agent-swarm/orchestrate', data);
    },

    /**
     * Get task status
     */
    status: async (taskId: string): Promise<ApiResponse<Task>> => {
      return this.client.get<Task>(`/agent-swarm/tasks/${taskId}`);
    },

    /**
     * Cancel a task
     */
    cancel: async (taskId: string): Promise<ApiResponse<{ message: string }>> => {
      return this.client.post<{ message: string }>(`/agent-swarm/tasks/${taskId}/cancel`);
    },

    /**
     * List tasks for a swarm
     */
    list: async (swarmId: string): Promise<ApiResponse<Task[]>> => {
      return this.client.get<Task[]>(`/agent-swarm/${swarmId}/tasks`);
    }
  };

  /**
   * Agent Management
   */
  agents = {
    /**
     * List available agent types
     */
    types: async (): Promise<ApiResponse<AgentType[]>> => {
      return this.client.get<AgentType[]>('/agent-swarm/agent-types');
    },

    /**
     * Get agent details
     */
    get: async (agentId: string): Promise<ApiResponse<Agent>> => {
      return this.client.get<Agent>(`/agent-swarm/agents/${agentId}`);
    },

    /**
     * Add agent to swarm
     */
    add: async (swarmId: string, agent: { type: AgentType; config?: any }): Promise<ApiResponse<Agent>> => {
      return this.client.post<Agent>(`/agent-swarm/${swarmId}/agents`, agent);
    },

    /**
     * Remove agent from swarm
     */
    remove: async (swarmId: string, agentId: string): Promise<ApiResponse<{ message: string }>> => {
      return this.client.delete<{ message: string }>(`/agent-swarm/${swarmId}/agents/${agentId}`);
    },

    /**
     * Configure agent prompts
     */
    configurePrompt: async (data: ConfigureAgentPromptRequest): Promise<ApiResponse<AgentPrompt>> => {
      return this.client.post<AgentPrompt>('/agent-swarm/prompts', data);
    },

    /**
     * Get agent prompts
     */
    getPrompt: async (agentType: AgentType): Promise<ApiResponse<AgentPrompt>> => {
      return this.client.get<AgentPrompt>(`/agent-swarm/prompts/${agentType}`);
    }
  };

  /**
   * Metrics and Monitoring
   */
  metrics = {
    /**
     * Get swarm metrics
     */
    swarm: async (swarmId: string): Promise<ApiResponse<SwarmMetrics>> => {
      return this.client.get<SwarmMetrics>(`/agent-swarm/${swarmId}/metrics`);
    },

    /**
     * Get agent metrics
     */
    agent: async (agentId: string): Promise<ApiResponse<any>> => {
      return this.client.get<any>(`/agent-swarm/agents/${agentId}/metrics`);
    },

    /**
     * Get project-wide metrics
     */
    project: async (projectId: string): Promise<ApiResponse<any>> => {
      return this.client.get<any>(`/agent-swarm/projects/${projectId}/metrics`);
    }
  };

  /**
   * Event Streaming
   */
  events = {
    /**
     * Stream swarm events
     */
    stream: (swarmId: string, onEvent: (event: SwarmEvent) => void): EventSource => {
      const url = `${this.client['config'].baseUrl}/agent-swarm/${swarmId}/events`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
        } catch (error) {
          console.error('Failed to parse swarm event:', error);
        }
      };

      return eventSource;
    },

    /**
     * Get historical events
     */
    history: async (swarmId: string, limit?: number): Promise<ApiResponse<SwarmEvent[]>> => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      
      return this.client.get<SwarmEvent[]>(`/agent-swarm/${swarmId}/events/history?${params}`);
    }
  };
}