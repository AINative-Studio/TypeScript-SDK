/**
 * React integration example for AINative SDK
 * 
 * This example shows how to use AINative SDK with React hooks
 * for building interactive applications.
 */

import React, { useState, useEffect } from 'react';
import { AINativeProvider, useZeroDB, useAgentSwarm } from '@ainative/sdk/react';

// Main App Component
function App() {
  return (
    <AINativeProvider config={{
      apiKey: process.env.REACT_APP_AINATIVE_API_KEY,
      baseUrl: process.env.REACT_APP_AINATIVE_BASE_URL,
      debug: process.env.NODE_ENV === 'development'
    }}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🚀 AINative React Integration</h1>
        <ProjectManager />
        <VectorOperations />
        <AgentSwarmDemo />
      </div>
    </AINativeProvider>
  );
}

// Project Management Component
function ProjectManager() {
  const { projects, loading, error } = useZeroDB();
  const [projectList, setProjectList] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projects.list();
      setProjectList(response.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await projects.create({
        name: newProjectName,
        description: `Project created from React app`
      });
      setNewProjectName('');
      await loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>📁 Project Management</h2>
      
      {loading && <div>Loading projects...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      
      <form onSubmit={createProject} style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Enter project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button type="submit" disabled={loading}>Create Project</button>
      </form>

      <div>
        <h3>Your Projects:</h3>
        {projectList.length === 0 ? (
          <p>No projects yet. Create one above!</p>
        ) : (
          <ul>
            {projectList.map((project: any) => (
              <li key={project.id} style={{ marginBottom: '5px' }}>
                <strong>{project.name}</strong> - {project.description}
                <br />
                <small>ID: {project.id}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Vector Operations Component
function VectorOperations() {
  const { vectors, loading, error } = useZeroDB();
  const [projectId, setProjectId] = useState('');
  const [searchQuery, setSearchQuery] = useState('example search');
  const [searchResults, setSearchResults] = useState([]);

  const performVectorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim()) {
      alert('Please enter a project ID');
      return;
    }

    try {
      // First, let's upsert a sample vector
      await vectors.upsert(projectId, {
        vectorEmbedding: Array.from({length: 1536}, () => Math.random()),
        metadata: {
          content: 'Sample document for React demo',
          type: 'demo'
        },
        namespace: 'react-demo'
      });

      // Then search for it
      const response = await vectors.search(projectId, {
        queryVector: Array.from({length: 1536}, () => Math.random()),
        namespace: 'react-demo',
        topK: 5
      });

      setSearchResults(response.data.vectors);
    } catch (err: any) {
      console.error('Vector operation failed:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>🔍 Vector Operations</h2>
      
      {loading && <div>Processing vector operations...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      
      <form onSubmit={performVectorSearch}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: '8px', width: '300px', marginRight: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px', width: '300px', marginRight: '10px' }}
          />
        </div>
        <button type="submit" disabled={loading}>
          Store & Search Vectors
        </button>
      </form>

      {searchResults.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h3>Search Results:</h3>
          <ul>
            {searchResults.map((result: any, index) => (
              <li key={result.id || index} style={{ marginBottom: '10px' }}>
                <strong>Vector ID:</strong> {result.id}
                <br />
                <strong>Namespace:</strong> {result.namespace}
                <br />
                {result.metadata && (
                  <>
                    <strong>Metadata:</strong> {JSON.stringify(result.metadata)}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Agent Swarm Demo Component
function AgentSwarmDemo() {
  const { swarm, tasks, agents, loading, error } = useAgentSwarm();
  const [swarmId, setSwarmId] = useState('');
  const [swarmStatus, setSwarmStatus] = useState(null);
  const [availableAgentTypes, setAvailableAgentTypes] = useState([]);

  useEffect(() => {
    loadAgentTypes();
  }, []);

  const loadAgentTypes = async () => {
    try {
      const response = await agents.types();
      setAvailableAgentTypes(response.data);
    } catch (err) {
      console.error('Failed to load agent types:', err);
    }
  };

  const startSwarm = async () => {
    try {
      const response = await swarm.start({
        projectId: 'demo-project',
        name: 'React Demo Swarm',
        agents: [
          { type: 'data_analyst', name: 'Data Analyst' },
          { type: 'report_generator', name: 'Report Generator' }
        ]
      });
      setSwarmId(response.data.id);
      setSwarmStatus(response.data);
    } catch (err: any) {
      console.error('Failed to start swarm:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const checkSwarmStatus = async () => {
    if (!swarmId) return;
    
    try {
      const response = await swarm.status(swarmId);
      setSwarmStatus(response.data);
    } catch (err) {
      console.error('Failed to check swarm status:', err);
    }
  };

  const orchestrateTask = async () => {
    if (!swarmId) {
      alert('Please start a swarm first');
      return;
    }

    try {
      const response = await tasks.orchestrate({
        swarmId,
        task: 'Analyze sample data and generate a summary report',
        priority: 'medium'
      });
      console.log('Task orchestrated:', response.data);
      alert(`Task created: ${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to orchestrate task:', err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>🤖 Agent Swarm Operations</h2>
      
      {loading && <div>Processing swarm operations...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
      
      <div style={{ marginBottom: '15px' }}>
        <h3>Available Agent Types:</h3>
        <ul>
          {availableAgentTypes.map((type: string) => (
            <li key={type}>{type}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={startSwarm} disabled={loading || !!swarmId}>
          {swarmId ? 'Swarm Started' : 'Start Agent Swarm'}
        </button>
        
        {swarmId && (
          <>
            <button onClick={checkSwarmStatus} disabled={loading} style={{ marginLeft: '10px' }}>
              Check Status
            </button>
            <button onClick={orchestrateTask} disabled={loading} style={{ marginLeft: '10px' }}>
              Orchestrate Task
            </button>
          </>
        )}
      </div>

      {swarmStatus && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Swarm Status:</h3>
          <p><strong>ID:</strong> {swarmStatus.id}</p>
          <p><strong>Status:</strong> {swarmStatus.status}</p>
          <p><strong>Agents:</strong> {swarmStatus.agents?.length || 0}</p>
          {swarmStatus.agents && swarmStatus.agents.length > 0 && (
            <ul>
              {swarmStatus.agents.map((agent: any) => (
                <li key={agent.id}>
                  {agent.name} ({agent.type}) - Status: {agent.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;