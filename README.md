# AINative TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/%40ainative%2Fsdk.svg)](https://www.npmjs.com/package/@ainative/sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for AINative Studio APIs, providing seamless integration with ZeroDB vector database and Agent Swarm orchestration platform.

## 🚀 Features

- **TypeScript Support** - Full type safety with comprehensive TypeScript definitions
- **Browser & Node.js** - Works in both browser and server environments
- **Framework Integrations** - React hooks and Vue composables included
- **Auto-retry & Error Handling** - Built-in retry logic and comprehensive error types
- **Tree-shakeable** - Only import what you need for optimal bundle size
- **Real-time Streaming** - Server-Sent Events support for live updates
- **Modern Architecture** - Built with modern JavaScript features and best practices

## 📦 Installation

```bash
# npm
npm install @ainative/sdk

# yarn
yarn add @ainative/sdk

# pnpm
pnpm add @ainative/sdk
```

## 🔧 Quick Start

```typescript
import { AINativeClient } from '@ainative/sdk';

// Initialize the client
const client = new AINativeClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.ainative.studio' // optional
});

// Create a project
const project = await client.zerodb.projects.create({
  name: 'My AI Project',
  description: 'Vector storage for my AI application'
});

// Store vectors
await client.zerodb.vectors.upsert(project.data.id, {
  vectorEmbedding: [0.1, 0.2, 0.3, 0.4],
  metadata: { title: 'Document 1', category: 'tutorial' },
  namespace: 'documents'
});

// Search vectors
const results = await client.zerodb.vectors.search(project.data.id, {
  queryVector: [0.1, 0.2, 0.3, 0.4],
  topK: 5,
  namespace: 'documents'
});

console.log('Found vectors:', results.data.vectors);
```

## 🎯 React Integration

```tsx
import React from 'react';
import { AINativeProvider, useZeroDB } from '@ainative/sdk/react';

function App() {
  return (
    <AINativeProvider config={{ apiKey: 'your-api-key' }}>
      <ProjectList />
    </AINativeProvider>
  );
}

function ProjectList() {
  const { projects, loading, error } = useZeroDB();
  const [projectList, setProjectList] = React.useState([]);

  React.useEffect(() => {
    async function loadProjects() {
      const response = await projects.list();
      setProjectList(response.data);
    }
    loadProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projectList.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

## 🌟 Vue.js Integration

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="project in projectList" :key="project.id">
        {{ project.name }}
      </li>
    </ul>
    <button @click="createProject">Create Project</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useZeroDB } from '@ainative/sdk/vue';

const { projects, loading, error } = useZeroDB({
  apiKey: 'your-api-key'
});

const projectList = ref([]);

onMounted(async () => {
  const response = await projects.list();
  projectList.value = response.data;
});

async function createProject() {
  await projects.create({
    name: 'New Project',
    description: 'Created from Vue app'
  });
  // Reload projects
  const response = await projects.list();
  projectList.value = response.data;
}
</script>
```

## 📚 API Reference

### Client Configuration

```typescript
interface ClientConfig {
  apiKey?: string;           // Your AINative API key
  baseUrl?: string;          // API base URL (default: https://api.ainative.studio)
  organizationId?: string;   // Organization ID for multi-tenant scenarios
  timeout?: number;          // Request timeout in ms (default: 30000)
  maxRetries?: number;       // Max retry attempts (default: 3)
  retryDelay?: number;       // Retry delay in ms (default: 1000)
  debug?: boolean;           // Enable debug logging (default: false)
  headers?: object;          // Custom headers for all requests
}
```

### ZeroDB Operations

#### Projects

```typescript
// List projects
const projects = await client.zerodb.projects.list({ limit: 10 });

// Create project
const project = await client.zerodb.projects.create({
  name: 'Project Name',
  description: 'Project description',
  type: 'development' // or 'production'
});

// Get project
const project = await client.zerodb.projects.get('project-id');

// Update project
const updated = await client.zerodb.projects.update('project-id', {
  name: 'New Name',
  status: 'active'
});

// Delete project
await client.zerodb.projects.delete('project-id');
```

#### Vector Operations

```typescript
// Upsert vector
const vector = await client.zerodb.vectors.upsert('project-id', {
  vectorEmbedding: [0.1, 0.2, 0.3, 0.4],
  metadata: { title: 'Document', category: 'tutorial' },
  namespace: 'documents',
  document: 'Text content of the document'
});

// Search vectors
const results = await client.zerodb.vectors.search('project-id', {
  queryVector: [0.1, 0.2, 0.3, 0.4],
  namespace: 'documents',
  topK: 5,
  similarityThreshold: 0.7
});

// Batch upsert
await client.zerodb.vectors.batchUpsert('project-id', {
  vectors: [
    { vectorEmbedding: [0.1, 0.2], metadata: { id: 1 } },
    { vectorEmbedding: [0.3, 0.4], metadata: { id: 2 } }
  ]
});

// List vectors
const vectors = await client.zerodb.vectors.list('project-id', 'namespace', 10);
```

#### Memory Operations

```typescript
// Store memory
const memory = await client.zerodb.memory.store('project-id', {
  content: 'User asked about vector search',
  agentId: '550e8400-e29b-41d4-a716-446655440000',
  sessionId: '123e4567-e89b-12d3-a456-426614174000',
  role: 'user',
  memoryMetadata: { topic: 'vector_search', priority: 'high' }
});

// Search memories
const memories = await client.zerodb.memory.search('project-id', {
  query: 'vector search',
  sessionId: '123e4567-e89b-12d3-a456-426614174000',
  limit: 10
});

// List memories
const allMemories = await client.zerodb.memory.list('project-id', { limit: 50 });
```

#### Event Streaming

```typescript
// Publish event
const event = await client.zerodb.events.publish('project-id', {
  topic: 'user_actions',
  eventPayload: {
    action: 'login',
    userId: 'user-123',
    timestamp: new Date().toISOString()
  }
});

// List events
const events = await client.zerodb.events.list('project-id', 'user_actions', 100);

// Stream events (real-time)
const eventSource = client.zerodb.events.stream('project-id', {
  topic: 'user_actions',
  onMessage: (event) => {
    console.log('New event:', event);
  },
  onError: (error) => {
    console.error('Stream error:', error);
  },
  onConnect: () => {
    console.log('Connected to event stream');
  }
});

// Stop streaming
eventSource.close();
```

### Agent Swarm Operations

#### Swarm Management

```typescript
// Start agent swarm
const swarm = await client.agentSwarm.swarm.start({
  projectId: 'project-id',
  name: 'Data Analysis Swarm',
  agents: [
    { type: 'data_analyst', config: { specialization: 'customer_data' } },
    { type: 'report_generator', config: { format: 'markdown' } }
  ],
  orchestration: {
    maxAgents: 5,
    coordinationModel: 'hierarchical'
  }
});

// Check swarm status
const status = await client.agentSwarm.swarm.status('swarm-id');

// Stop swarm
await client.agentSwarm.swarm.stop('swarm-id');
```

#### Task Orchestration

```typescript
// Orchestrate task
const task = await client.agentSwarm.tasks.orchestrate({
  swarmId: 'swarm-id',
  task: 'Analyze customer feedback and generate insights report',
  priority: 'high',
  context: { dataSource: 'customer_surveys' }
});

// Check task status
const taskStatus = await client.agentSwarm.tasks.status('task-id');

// List swarm tasks
const tasks = await client.agentSwarm.tasks.list('swarm-id');
```

### Error Handling

```typescript
import { 
  AINativeError, 
  NetworkError, 
  AuthenticationError, 
  RateLimitError 
} from '@ainative/sdk';

try {
  const result = await client.zerodb.projects.list();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
    // Redirect to login
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
    // Wait and retry
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    // Check connection
  } else if (error instanceof AINativeError) {
    console.error('API error:', error.message, 'Status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🎨 Framework Examples

### Next.js App Router

```typescript
// app/api/projects/route.ts
import { AINativeClient } from '@ainative/sdk';

const client = new AINativeClient({
  apiKey: process.env.AINATIVE_API_KEY!
});

export async function GET() {
  try {
    const projects = await client.zerodb.projects.list();
    return Response.json(projects.data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
```

### Express.js Server

```typescript
import express from 'express';
import { AINativeClient } from '@ainative/sdk';

const app = express();
const client = new AINativeClient({
  apiKey: process.env.AINATIVE_API_KEY!
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await client.zerodb.projects.list();
    res.json(projects.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/ainative/ainative-sdk-js.git
cd ainative-sdk-js

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [AINative Studio](https://ainative.studio)
- [Documentation](https://docs.ainative.studio)
- [API Reference](https://docs.ainative.studio/api)
- [GitHub Repository](https://github.com/ainative/ainative-sdk-js)
- [npm Package](https://www.npmjs.com/package/@ainative/sdk)

## 📞 Support

- 📧 Email: support@ainative.studio
- 💬 Discord: [Join our community](https://discord.gg/ainative)
- 🐛 Issues: [GitHub Issues](https://github.com/ainative/ainative-sdk-js/issues)
- 📖 Docs: [Documentation](https://docs.ainative.studio)

---

Made with ❤️ by the AINative team