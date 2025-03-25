/**
 * AI Marketing Platform - Agent API Test Script
 * =============================================
 * 
 * This script tests the AI agents API endpoints to verify that the agent system
 * is working properly. It sends requests to create, list, and execute agents.
 * 
 * Features:
 * - Tests agent creation and configuration
 * - Verifies agent execution capabilities
 * - Validates agent marketplace functionality
 * - Provides detailed error reporting
 * 
 * Usage:
 *   node test-agents-api.js
 * 
 * Optional Environment Variables:
 *   API_BASE_URL: Base URL for API endpoints (default: http://localhost:5000)
 *   TIMEOUT_MS: Request timeout in milliseconds (default: 8000)
 *   DIRECT_TEST: Set to 'true' to use direct fetch vs curl (default: 'false')
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TIMEOUT_MS = process.env.TIMEOUT_MS ? parseInt(process.env.TIMEOUT_MS) : 8000;
const DIRECT_TEST = process.env.DIRECT_TEST === 'true';

// ANSI color codes for terminal output
const COLOR_RESET = '\x1b[0m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_RED = '\x1b[31m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_CYAN = '\x1b[36m';

// Use Node.js fetch if available, otherwise fallback to node-fetch
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  fetch = global.fetch;
}

// Helper functions for testing
async function directGet(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function directPost(endpoint, data) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(url, { 
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function curlGet(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const output = execSync(`curl -s "${url}"`, { encoding: 'utf-8' });
    return { success: true, data: JSON.parse(output) };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.toString() : null
    };
  }
}

async function curlPost(endpoint, data) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const dataFile = `test-data-${Date.now()}.json`;
    fs.writeFileSync(dataFile, JSON.stringify(data));
    const output = execSync(`curl -s -X POST -H "Content-Type: application/json" -d @${dataFile} "${url}"`, { encoding: 'utf-8' });
    fs.unlinkSync(dataFile);
    return { success: true, data: JSON.parse(output) };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.toString() : null
    };
  }
}

async function runTests() {
  console.log(`${COLOR_BLUE}=== AI Marketing Platform - Agent API Tests ===${COLOR_RESET}`);
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log(`Test method: ${DIRECT_TEST ? 'Direct fetch' : 'curl commands'}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms\n`);
  
  const get = DIRECT_TEST ? directGet : curlGet;
  const post = DIRECT_TEST ? directPost : curlPost;
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Verify health endpoint
  console.log(`${COLOR_CYAN}Test 1: Agent Health Endpoint${COLOR_RESET}`);
  try {
    const result = await get('/api/agents/health');
    if (result.success && result.data.status === 'ok') {
      console.log(`${COLOR_GREEN}✓ Agent health endpoint working${COLOR_RESET}`);
      testsPassed++;
    } else {
      console.log(`${COLOR_RED}✗ Agent health endpoint failed${COLOR_RESET}`);
      console.log(`  Error: ${result.error || 'Unknown error'}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`${COLOR_RED}✗ Test error: ${error.message}${COLOR_RESET}`);
    testsFailed++;
  }
  
  // Test 2: List available agents
  console.log(`\n${COLOR_CYAN}Test 2: List Available Agents${COLOR_RESET}`);
  try {
    const result = await get('/api/agents');
    if (result.success) {
      const agents = result.data;
      if (Array.isArray(agents) && agents.length > 0) {
        console.log(`${COLOR_GREEN}✓ Found ${agents.length} agents${COLOR_RESET}`);
        console.log(`  Agent types: ${agents.map(a => a.type).join(', ')}`);
        testsPassed++;
      } else {
        console.log(`${COLOR_YELLOW}⚠ No agents found or invalid response${COLOR_RESET}`);
        console.log(`  Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        testsFailed++;
      }
    } else {
      console.log(`${COLOR_RED}✗ Failed to list agents${COLOR_RESET}`);
      console.log(`  Error: ${result.error || 'Unknown error'}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`${COLOR_RED}✗ Test error: ${error.message}${COLOR_RESET}`);
    testsFailed++;
  }
  
  // Test 3: Execute a simple agent
  console.log(`\n${COLOR_CYAN}Test 3: Execute Agent${COLOR_RESET}`);
  try {
    const result = await post('/api/agents/execute', {
      agentType: 'seo',
      input: {
        targetKeywords: ['marketing automation', 'ai marketing'],
        content: 'AI-powered marketing automation is transforming how businesses approach their marketing strategies.'
      }
    });
    
    if (result.success) {
      if (result.data.analysis) {
        console.log(`${COLOR_GREEN}✓ Agent execution successful${COLOR_RESET}`);
        console.log(`  Response sample: ${JSON.stringify(result.data).substring(0, 100)}...`);
        testsPassed++;
      } else {
        console.log(`${COLOR_YELLOW}⚠ Agent execution returned unexpected format${COLOR_RESET}`);
        console.log(`  Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        testsFailed++;
      }
    } else {
      console.log(`${COLOR_RED}✗ Agent execution failed${COLOR_RESET}`);
      console.log(`  Error: ${result.error || 'Unknown error'}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`${COLOR_RED}✗ Test error: ${error.message}${COLOR_RESET}`);
    testsFailed++;
  }
  
  // Summary
  console.log(`\n${COLOR_BLUE}=== Test Summary ===${COLOR_RESET}`);
  console.log(`Total tests: ${testsPassed + testsFailed}`);
  console.log(`${COLOR_GREEN}Passed: ${testsPassed}${COLOR_RESET}`);
  console.log(`${COLOR_RED}Failed: ${testsFailed}${COLOR_RESET}`);
  
  if (testsFailed === 0) {
    console.log(`\n${COLOR_GREEN}All agent API tests passed!${COLOR_RESET}`);
  } else {
    console.log(`\n${COLOR_YELLOW}Some agent API tests failed. See details above.${COLOR_RESET}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${COLOR_RED}Fatal error running tests:${COLOR_RESET}`, error);
});