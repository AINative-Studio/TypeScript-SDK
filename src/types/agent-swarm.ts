/**
 * Type definitions for Agent Swarm operations
 */

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  config?: AgentConfig;
  capabilities?: string[];
  currentTask?: Task;
  metrics?: AgentMetrics;
}

export type AgentType = 
  | 'data_analyst'
  | 'report_generator'
  | 'code_reviewer'
  | 'test_runner'
  | 'documentation_writer'
  | 'api_integrator'
  | 'performance_optimizer'
  | 'security_auditor'
  | 'custom';

export type AgentStatus = 
  | 'idle'
  | 'busy'
  | 'error'
  | 'offline'
  | 'starting'
  | 'stopping';

export interface AgentConfig {
  specialization?: string;
  maxConcurrentTasks?: number;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  customParameters?: Record<string, any>;
}

export interface Swarm {
  id: string;
  projectId: string;
  name?: string;
  status: SwarmStatus;
  agents: Agent[];
  orchestration: OrchestrationConfig;
  createdAt: string;
  startedAt?: string;
  stoppedAt?: string;
}

export type SwarmStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'error';

export interface OrchestrationConfig {
  maxAgents?: number;
  coordinationModel?: 'hierarchical' | 'distributed' | 'consensus';
  taskDistribution?: 'round-robin' | 'load-balanced' | 'priority-based';
  communicationProtocol?: 'direct' | 'message-queue' | 'event-driven';
}

export interface Task {
  id: string;
  swarmId: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dependencies?: string[];
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface StartSwarmRequest {
  projectId: string;
  name?: string;
  agents: CreateAgentRequest[];
  orchestration?: OrchestrationConfig;
}

export interface CreateAgentRequest {
  type: AgentType;
  name?: string;
  config?: AgentConfig;
}

export interface OrchestrateTaskRequest {
  swarmId: string;
  task: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  context?: Record<string, any>;
  dependencies?: string[];
}

export interface SwarmMetrics {
  swarmId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  agentUtilization: Record<string, number>;
  throughput: number;
  errorRate: number;
}

export interface AgentMetrics {
  agentId: string;
  tasksCompleted: number;
  tasksFailed: number;
  averageTaskDuration: number;
  utilization: number;
  lastActive: string;
}

export interface SwarmEvent {
  id: string;
  swarmId: string;
  type: SwarmEventType;
  agentId?: string;
  taskId?: string;
  payload?: any;
  timestamp: string;
}

export type SwarmEventType = 
  | 'swarm_started'
  | 'swarm_stopped'
  | 'agent_added'
  | 'agent_removed'
  | 'agent_error'
  | 'task_created'
  | 'task_assigned'
  | 'task_completed'
  | 'task_failed'
  | 'orchestration_changed';

export interface AgentPrompt {
  agentType: AgentType;
  systemPrompt: string;
  taskPromptTemplate?: string;
  examples?: string[];
  constraints?: string[];
  outputFormat?: string;
}

export interface ConfigureAgentPromptRequest {
  agentType: AgentType;
  systemPrompt: string;
  taskPromptTemplate?: string;
  examples?: string[];
  constraints?: string[];
  outputFormat?: string;
}