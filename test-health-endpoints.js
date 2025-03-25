/**
 * Comprehensive Test Script for AI Marketing Platform Health Endpoints
 * Run with: node test-health-endpoints.js
 */

import fetch from 'node-fetch';

// Color formatting for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  brightGreen: '\x1b[92m',
  brightRed: '\x1b[91m',
  brightYellow: '\x1b[93m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '3000');

// List of endpoints to check
const ENDPOINTS = [
  { url: '/api/healthcheck', description: 'Main API health check' },
  { url: '/api/debug/routes', description: 'Routes listing' },
  { url: '/api/users/test-123', description: 'User data endpoint' },
];

// Execute curl-like request
async function curlCommand(url) {
  const fullUrl = BASE_URL + url;
  console.log(`${colors.cyan}Testing:${colors.reset} ${fullUrl}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const startTime = Date.now();
    const response = await fetch(fullUrl, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    const endTime = Date.now();
    clearTimeout(timeoutId);
    
    const responseTime = endTime - startTime;
    
    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Failed to parse JSON response' };
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      responseTime,
      data
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: 0,
        statusText: 'Request timed out',
        responseTime: TIMEOUT_MS,
        data: { error: `Timeout after ${TIMEOUT_MS}ms` }
      };
    }
    
    return {
      status: 0,
      statusText: error.message,
      responseTime: 0,
      data: { error: error.message }
    };
  }
}

// Format a status output with colors
function formatStatus(status) {
  if (status >= 200 && status < 300) {
    return `${colors.brightGreen}${status}${colors.reset}`;
  } else if (status >= 300 && status < 400) {
    return `${colors.brightYellow}${status}${colors.reset}`;
  } else if (status === 0) {
    return `${colors.bgRed}${colors.yellow}FAIL${colors.reset}`;
  } else {
    return `${colors.brightRed}${status}${colors.reset}`;
  }
}

// Main test function
async function runTests() {
  console.log(`\n${colors.blue}====================================${colors.reset}`);
  console.log(`${colors.blue}  AI Marketing Platform API Tests${colors.reset}`);
  console.log(`${colors.blue}====================================${colors.reset}`);
  console.log(`${colors.yellow}Base URL:${colors.reset} ${BASE_URL}`);
  console.log(`${colors.yellow}Timeout:${colors.reset} ${TIMEOUT_MS}ms\n`);

  let successful = 0;
  let failed = 0;
  
  for (const endpoint of ENDPOINTS) {
    const result = await curlCommand(endpoint.url);
    
    console.log(`\n${colors.magenta}Endpoint:${colors.reset} ${endpoint.url}`);
    console.log(`${colors.magenta}Description:${colors.reset} ${endpoint.description}`);
    console.log(`${colors.magenta}Status:${colors.reset} ${formatStatus(result.status)} ${result.statusText}`);
    console.log(`${colors.magenta}Response Time:${colors.reset} ${result.responseTime}ms`);
    console.log(`${colors.magenta}Response Data:${colors.reset}`);
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.status >= 200 && result.status < 300) {
      successful++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log(`\n${colors.blue}====================================${colors.reset}`);
  console.log(`${colors.blue}            Summary${colors.reset}`);
  console.log(`${colors.blue}====================================${colors.reset}`);
  console.log(`${colors.yellow}Total Endpoints:${colors.reset} ${ENDPOINTS.length}`);
  console.log(`${colors.green}Successful:${colors.reset} ${successful}`);
  console.log(`${colors.red}Failed:${colors.reset} ${failed}`);
  
  // Overall status
  if (failed === 0) {
    console.log(`\n${colors.bgGreen}${colors.reset} ${colors.brightGreen}All endpoints are healthy!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bgRed}${colors.reset} ${colors.brightRed}Some endpoints failed!${colors.reset}\n`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  process.exit(1);
});