/**
 * Basic usage example for AINative SDK
 * 
 * This example demonstrates fundamental operations:
 * - Client initialization
 * - Project creation
 * - Vector operations
 * - Memory storage
 * - Health checking
 */

const { AINativeClient } = require('../dist/index.js');

async function basicUsageExample() {
  console.log('🚀 AINative SDK - Basic Usage Example');
  console.log('=====================================\n');

  // 1. Initialize the client
  console.log('1. Initializing AINative client...');
  const client = new AINativeClient({
    apiKey: process.env.AINATIVE_API_KEY || 'your-api-key-here',
    baseUrl: process.env.AINATIVE_BASE_URL || 'https://api.ainative.studio',
    debug: true // Enable debug logging
  });

  try {
    // 2. Health check
    console.log('\n2. Checking API health...');
    const health = await client.healthCheck();
    console.log('✅ API Status:', health.data.status);

    // 3. Create a project
    console.log('\n3. Creating a new project...');
    const project = await client.zerodb.projects.create({
      name: 'TypeScript SDK Demo',
      description: 'Demonstration project for TypeScript SDK usage',
      type: 'development'
    });
    console.log('✅ Project created:', project.data.id);
    
    const projectId = project.data.id;

    // 4. Store vectors
    console.log('\n4. Storing vectors...');
    const vectorData = {
      vectorEmbedding: [0.1, 0.2, 0.3, 0.4, 0.5],
      metadata: {
        title: 'Example Document',
        category: 'tutorial',
        language: 'javascript'
      },
      namespace: 'examples',
      document: 'This is an example document for vector storage demonstration.'
    };

    const vectorResult = await client.zerodb.vectors.upsert(projectId, vectorData);
    console.log('✅ Vector stored:', vectorResult.data.id);

    // 5. Search vectors
    console.log('\n5. Searching vectors...');
    const searchResult = await client.zerodb.vectors.search(projectId, {
      queryVector: [0.1, 0.2, 0.3, 0.4, 0.5],
      namespace: 'examples',
      topK: 3
    });
    console.log('✅ Found vectors:', searchResult.data.vectors.length);
    console.log('   Search time:', searchResult.data.searchTimeMs, 'ms');

    // 6. Store memory
    console.log('\n6. Storing memory...');
    const memoryData = {
      content: 'User asked about vector search implementation',
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'user',
      memoryMetadata: {
        topic: 'vector_search',
        importance: 'high'
      }
    };

    const memoryResult = await client.zerodb.memory.store(projectId, memoryData);
    console.log('✅ Memory stored:', memoryResult.data.id);

    // 7. Search memories
    console.log('\n7. Searching memories...');
    const memorySearch = await client.zerodb.memory.search(projectId, {
      query: 'vector search',
      limit: 5
    });
    console.log('✅ Found memories:', memorySearch.data.length);

    // 8. Get project analytics
    console.log('\n8. Getting project analytics...');
    const analytics = await client.zerodb.analytics.overview(projectId);
    console.log('✅ Project metrics:');
    console.log('   - Vectors:', analytics.data.metrics.totalVectors);
    console.log('   - Memories:', analytics.data.metrics.totalMemories);
    console.log('   - Storage:', analytics.data.metrics.storageUsedMb, 'MB');

    console.log('\n🎉 Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample().catch(console.error);
}

module.exports = { basicUsageExample };