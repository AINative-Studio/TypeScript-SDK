/**
 * React hook for Agent Swarm operations
 */

import { useState, useCallback } from 'react';
import { useAINative } from './useAINative';
import type {
  Swarm,
  StartSwarmRequest,
  OrchestrateTaskRequest,
  Task,
  AgentType,
  ConfigureAgentPromptRequest
} from '../types/agent-swarm';

/**
 * Hook for Agent Swarm operations with loading states
 * 
 * @example
 * ```tsx
 * import { useAgentSwarm } from '@ainative/sdk/react';
 * 
 * function SwarmComponent() {
 *   const { swarm, tasks, agents, loading, error } = useAgentSwarm();
 *   
 *   const startSwarm = async () => {
 *     const result = await swarm.start({
 *       projectId: 'project-id',
 *       agents: [
 *         { type: 'data_analyst', name: 'Data Analyst' }
 *       ]
 *     });
 *     console.log('Swarm started:', result.data);
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       <button onClick={startSwarm}>Start Swarm</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAgentSwarm() {
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

  const swarm = {
    start: useCallback(async (data: StartSwarmRequest) => {
      return handleRequest(() => client.agentSwarm.swarm.start(data));
    }, [client, handleRequest]),

    status: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.swarm.status(swarmId));
    }, [client, handleRequest]),

    stop: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.swarm.stop(swarmId));
    }, [client, handleRequest]),

    pause: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.swarm.pause(swarmId));
    }, [client, handleRequest]),

    resume: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.swarm.resume(swarmId));
    }, [client, handleRequest]),

    list: useCallback(async (projectId?: string) => {
      return handleRequest(() => client.agentSwarm.swarm.list(projectId));
    }, [client, handleRequest])
  };

  const tasks = {
    orchestrate: useCallback(async (data: OrchestrateTaskRequest) => {
      return handleRequest(() => client.agentSwarm.tasks.orchestrate(data));
    }, [client, handleRequest]),

    status: useCallback(async (taskId: string) => {
      return handleRequest(() => client.agentSwarm.tasks.status(taskId));
    }, [client, handleRequest]),

    cancel: useCallback(async (taskId: string) => {
      return handleRequest(() => client.agentSwarm.tasks.cancel(taskId));
    }, [client, handleRequest]),

    list: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.tasks.list(swarmId));
    }, [client, handleRequest])
  };

  const agents = {
    types: useCallback(async () => {
      return handleRequest(() => client.agentSwarm.agents.types());
    }, [client, handleRequest]),

    get: useCallback(async (agentId: string) => {
      return handleRequest(() => client.agentSwarm.agents.get(agentId));
    }, [client, handleRequest]),

    add: useCallback(async (swarmId: string, agent: { type: AgentType; config?: any }) => {
      return handleRequest(() => client.agentSwarm.agents.add(swarmId, agent));
    }, [client, handleRequest]),

    remove: useCallback(async (swarmId: string, agentId: string) => {
      return handleRequest(() => client.agentSwarm.agents.remove(swarmId, agentId));
    }, [client, handleRequest]),

    configurePrompt: useCallback(async (data: ConfigureAgentPromptRequest) => {
      return handleRequest(() => client.agentSwarm.agents.configurePrompt(data));
    }, [client, handleRequest]),

    getPrompt: useCallback(async (agentType: AgentType) => {
      return handleRequest(() => client.agentSwarm.agents.getPrompt(agentType));
    }, [client, handleRequest])
  };

  const metrics = {
    swarm: useCallback(async (swarmId: string) => {
      return handleRequest(() => client.agentSwarm.metrics.swarm(swarmId));
    }, [client, handleRequest]),

    agent: useCallback(async (agentId: string) => {
      return handleRequest(() => client.agentSwarm.metrics.agent(agentId));
    }, [client, handleRequest]),

    project: useCallback(async (projectId: string) => {
      return handleRequest(() => client.agentSwarm.metrics.project(projectId));
    }, [client, handleRequest])
  };

  const events = {
    stream: useCallback((swarmId: string, onEvent: (event: any) => void) => {
      return client.agentSwarm.events.stream(swarmId, onEvent);
    }, [client]),

    history: useCallback(async (swarmId: string, limit?: number) => {
      return handleRequest(() => client.agentSwarm.events.history(swarmId, limit));
    }, [client, handleRequest])
  };

  return {
    swarm,
    tasks,
    agents,
    metrics,
    events,
    loading,
    error
  };
}