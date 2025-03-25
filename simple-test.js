/**
 * Very simple test script using just Node.js http module
 */

import http from 'http';

// Configuration
const PORT = 5000;
const HOST = 'localhost';

// Test a single endpoint
function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    console.log(`Testing: ${path}`);
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error: ${error.message}\n`);
      reject(error);
    });
    
    // Set a timeout
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('=== Simple API Test ===\n');
  
  try {
    await testEndpoint('/api/healthcheck');
    await testEndpoint('/api/debug/routes');
    await testEndpoint('/api/users/test-123');
  } catch (error) {
    console.error(`Test error: ${error.message}`);
  }
  
  console.log('=== Test Complete ===');
}

runTests();