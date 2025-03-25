/**
 * Simple health check script to verify the server is running
 */

const http = require('http');

// Function to make an HTTP request with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const request = http.request(url, options, (response) => {
      const chunks = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString();
        const responseData = {
          statusCode: response.statusCode,
          headers: response.headers,
          body: responseBody
        };
        resolve(responseData);
      });
    });
    
    // Handle request errors
    request.on('error', (error) => {
      reject(error);
    });
    
    // Add timeout
    if (timeout) {
      request.setTimeout(timeout, () => {
        request.abort();
        reject(new Error(`Request timed out after ${timeout}ms`));
      });
    }
    
    // End the request
    request.end();
  });
}

// Test health endpoint
async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await fetchWithTimeout('http://localhost:3000/health');
    
    if (response.statusCode === 200) {
      console.log('✅ Health check successful!');
      console.log('Response:', response.body);
      return true;
    } else {
      console.log('❌ Health check failed with status:', response.statusCode);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

// Test API endpoint
async function testApi() {
  try {
    console.log('\nTesting API endpoint...');
    const response = await fetchWithTimeout('http://localhost:3000/api/test');
    
    if (response.statusCode === 200) {
      console.log('✅ API check successful!');
      console.log('Response:', response.body);
      return true;
    } else {
      console.log('❌ API check failed with status:', response.statusCode);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ API check error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const healthResult = await testHealth();
  const apiResult = await testApi();
  
  if (healthResult && apiResult) {
    console.log('\n✅ All tests passed! Server is running correctly on port 3000.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Server may not be running correctly.');
    process.exit(1);
  }
}

// Run the tests
runTests();