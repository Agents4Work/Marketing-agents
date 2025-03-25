/**
 * AI Marketing Platform API Health Monitor
 * 
 * This script checks the health of all API endpoints without requiring browser access.
 * It's designed specifically for the Replit environment to verify backend functionality.
 */

// Use the built-in http module for simplicity
import http from 'http';

// Color formatting for terminal output
function c(text, color) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
}

// Test an endpoint and return the result
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `http://localhost:3000${endpoint}`;
    console.log(`Testing ${c(endpoint, 'cyan')}...`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      // Get the status code
      const statusCode = res.statusCode;
      
      // Gather the response body
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process the complete response
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { error: 'Invalid JSON response', raw: data };
        }
        
        const result = {
          endpoint,
          status: statusCode,
          statusText: formatStatus(statusCode),
          response: parsedData,
          responseTime: new Date().getTime() - startTime,
        };
        
        console.log(`${endpoint}: ${result.statusText} (${result.responseTime}ms)`);
        resolve(result);
      });
    });
    
    // Handle errors
    req.on('error', (error) => {
      console.error(c(`Error testing ${endpoint}: ${error.message}`, 'red'));
      resolve({
        endpoint,
        status: 0,
        statusText: c('ERROR', 'red'),
        error: error.message,
        responseTime: new Date().getTime() - startTime,
      });
    });
    
    // Set timeout to prevent hanging
    req.setTimeout(5000, () => {
      req.destroy();
      console.error(c(`Timeout testing ${endpoint}`, 'yellow'));
      resolve({
        endpoint,
        status: 0,
        statusText: c('TIMEOUT', 'yellow'),
        error: 'Request timed out after 5 seconds',
        responseTime: 5000,
      });
    });
    
    const startTime = new Date().getTime();
  });
}

// Format the status code with color
function formatStatus(status) {
  if (!status || status === 0) return c('ERROR', 'red');
  if (status < 300) return c('OK', 'green');
  if (status < 400) return c('REDIRECT', 'cyan');
  if (status < 500) return c('CLIENT ERROR', 'yellow');
  return c('SERVER ERROR', 'red');
}

// Main test function
async function runTests() {
  console.log(c('\n==== AI Marketing Platform API Health Check ====\n', 'cyan'));
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  const endpoints = [
    '/api/healthcheck',
    '/api/debug/routes',
    '/api/users/test-123',
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Display summary
  console.log(c('\n==== Health Check Summary ====\n', 'cyan'));
  
  let allSuccess = true;
  let failedCount = 0;
  
  for (const result of results) {
    const { endpoint, status, statusText, responseTime, error } = result;
    const statusSymbol = status >= 200 && status < 300 ? '✓' : '✗';
    const statusColor = status >= 200 && status < 300 ? 'green' : 'red';
    
    console.log(`${c(statusSymbol, statusColor)} ${c(endpoint, 'cyan')}: ${statusText} (${responseTime}ms)`);
    
    if (status < 200 || status >= 300) {
      allSuccess = false;
      failedCount++;
      if (error) {
        console.log(`  ${c('Error:', 'red')} ${error}`);
      }
    }
  }
  
  console.log(c('\n==== Summary ====\n', 'cyan'));
  console.log(`Total endpoints: ${endpoints.length}`);
  console.log(`Successful: ${endpoints.length - failedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Overall status: ${allSuccess ? c('HEALTHY', 'green') : c('ISSUES DETECTED', 'red')}`);
  console.log(c('\n============================\n', 'cyan'));
}

// Execute the tests
runTests();