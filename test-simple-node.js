/**
 * Simple Node.js-based API testing script
 * This avoids issues with direct curl commands in Replit environment
 */

import http from 'http';

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '0.0.0.0',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // Only show first 500 chars to avoid flooding the console
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        error: 'Request timed out'
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('Starting API tests...');
  
  // Test root path
  console.log('\nTesting /');
  const rootResult = await testEndpoint('/');
  console.log(JSON.stringify(rootResult, null, 2));
  
  // Test API health endpoint
  console.log('\nTesting /api/health');
  const healthResult = await testEndpoint('/api/health');
  console.log(JSON.stringify(healthResult, null, 2));
  
  console.log('\nTests completed.');
}

runTests();