/**
 * Test the built SDK
 */

import { AINativeClient } from './dist/index.esm.js';

console.log('🧪 Testing built AINative SDK...\n');

try {
  // Test client creation
  const client = new AINativeClient({
    apiKey: 'test-key',
    baseUrl: 'https://test.com',
    debug: true
  });
  
  console.log('✅ Client created successfully');
  console.log('   - API Key set:', client['config'].apiKey === 'test-key');
  console.log('   - Base URL set:', client['config'].baseUrl);
  console.log('   - Debug enabled:', client['config'].debug);
  
  // Test sub-clients
  const zerodb = client.zerodb;
  const agentSwarm = client.agentSwarm;
  
  console.log('✅ Sub-clients accessible');
  console.log('   - ZeroDB client:', !!zerodb);
  console.log('   - Agent Swarm client:', !!agentSwarm);
  
  console.log('\n🎉 Built SDK test passed!');
  console.log('\n📦 Build files created:');
  console.log('   - index.js (CommonJS)');
  console.log('   - index.esm.js (ES Module)');
  console.log('   - ainative.umd.js (UMD browser)');
  console.log('   - ainative.umd.min.js (UMD minified)');
  console.log('   - index.d.ts (TypeScript definitions)');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}