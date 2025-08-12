/**
 * Vue composable for Agent Swarm operations
 */

import { ref, readonly } from 'vue';
import { useAINative } from './useAINative';
import type {
  StartSwarmRequest,
  OrchestrateTaskRequest,
  AgentType,
  ConfigureAgentPromptRequest
} from '../types/agent-swarm';
import type { ClientConfig } from '../types';

/**
 * Vue composable for Agent Swarm operations with reactive state
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useAgentSwarm } from '@ainative/sdk/vue';
 * 
 * const { swarm, tasks, agents, loading, error } = useAgentSwarm({
 *   apiKey: 'your-api-key'
 * });
 * 
 * async function startSwarm() {
 *   const result = await swarm.start({
 *     projectId: 'project-id',
 *     agents: [{ type: 'data_analyst' }]
 *   });
 * }
 * </script>
 * ```
 */
export function useAgentSwarm(config?: ClientConfig) {
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

  const swarm = {
    async start(data: StartSwarmRequest) {
      return handleRequest(() => client.agentSwarm.swarm.start(data));
    },

    async status(swarmId: string) {
      return handleRequest(() => client.agentSwarm.swarm.status(swarmId));
    },

    async stop(swarmId: string) {
      return handleRequest(() => client.agentSwarm.swarm.stop(swarmId));
    },

    async pause(swarmId: string) {
      return handleRequest(() => client.agentSwarm.swarm.pause(swarmId));
    },

    async resume(swarmId: string) {
      return handleRequest(() => client.agentSwarm.swarm.resume(swarmId));
    },

    async list(projectId?: string) {
      return handleRequest(() => client.agentSwarm.swarm.list(projectId));
    }
  };

  const tasks = {
    async orchestrate(data: OrchestrateTaskRequest) {
      return handleRequest(() => client.agentSwarm.tasks.orchestrate(data));
    },

    async status(taskId: string) {
      return handleRequest(() => client.agentSwarm.tasks.status(taskId));
    },

    async cancel(taskId: string) {
      return handleRequest(() => client.agentSwarm.tasks.cancel(taskId));
    },

    async list(swarmId: string) {
      return handleRequest(() => client.agentSwarm.tasks.list(swarmId));
    }
  };

  const agents = {
    async types() {
      return handleRequest(() => client.agentSwarm.agents.types());
    },

    async get(agentId: string) {
      return handleRequest(() => client.agentSwarm.agents.get(agentId));
    },

    async add(swarmId: string, agent: { type: AgentType; config?: any }) {
      return handleRequest(() => client.agentSwarm.agents.add(swarmId, agent));
    },

    async remove(swarmId: string, agentId: string) {
      return handleRequest(() => client.agentSwarm.agents.remove(swarmId, agentId));
    },

    async configurePrompt(data: ConfigureAgentPromptRequest) {
      return handleRequest(() => client.agentSwarm.agents.configurePrompt(data));
    },

    async getPrompt(agentType: AgentType) {
      return handleRequest(() => client.agentSwarm.agents.getPrompt(agentType));
    }
  };

  const metrics = {
    async swarm(swarmId: string) {
      return handleRequest(() => client.agentSwarm.metrics.swarm(swarmId));
    },

    async agent(agentId: string) {
      return handleRequest(() => client.agentSwarm.metrics.agent(agentId));
    },

    async project(projectId: string) {
      return handleRequest(() => client.agentSwarm.metrics.project(projectId));
    }
  };

  const events = {
    stream(swarmId: string, onEvent: (event: any) => void) {
      return client.agentSwarm.events.stream(swarmId, onEvent);
    },

    async history(swarmId: string, limit?: number) {
      return handleRequest(() => client.agentSwarm.events.history(swarmId, limit));
    }
  };

  return {
    swarm,
    tasks,
    agents,
    metrics,
    events,
    loading: readonly(loading),
    error: readonly(error)
  };
}