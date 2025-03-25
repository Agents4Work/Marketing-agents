/**
 * Simple test script to check API endpoint health
 * 
 * This script makes direct HTTPS requests to check API endpoints
 * It's designed to be a lightweight alternative to the more comprehensive monitor-health.js
 */

import https from 'https';
import http from 'http';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TIMEOUT_MS = 5000;

// Color formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Helper function for making HTTP requests with a timeout
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    // Determine if HTTP or HTTPS
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    // Parse URL
    const urlObj = new URL(url);
    
    // Setup request options
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };
    
    // Create timeout
    const timeout = setTimeout(() => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
    
    // Make request
    const req = client.request(reqOptions, (res) => {
      let data = '';
      
      // Collect data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Handle response completion
      res.on('end', () => {
        clearTimeout(timeout);
        
        // Try to parse JSON
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (e) {
          jsonData = { raw: data };
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: jsonData
        });
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    // End request
    req.end();
  });
}

// Test endpoints
const endpoints = [
  { path: '/api/healthcheck', name: 'Health Check' },
  { path: '/api/debug/routes', name: 'API Routes' },
  { path: '/api/users/test-123', name: 'User Data' }
];

// Run tests
async function runTests() {
  console.log(`${colors.blue}${colors.bright}=== AI Marketing Platform API Test ===${colors.reset}`);
  console.log(`${colors.dim}Testing against: ${API_URL}${colors.reset}\n`);
  
  for (const endpoint of endpoints) {
    const url = `${API_URL}${endpoint.path}`;
    console.log(`${colors.cyan}Testing: ${endpoint.name} (${endpoint.path})${colors.reset}`);
    
    try {
      const start = Date.now();
      const response = await request(url);
      const duration = Date.now() - start;
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`${colors.green}✓ Success: ${response.statusCode} (${duration}ms)${colors.reset}`);
        console.log(`${colors.dim}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`${colors.yellow}⚠ Warning: ${response.statusCode} (${duration}ms)${colors.reset}`);
        console.log(`${colors.dim}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    }
    
    console.log(''); // Add a blank line between endpoints
  }
  
  console.log(`${colors.blue}${colors.bright}=== Test Complete ===${colors.reset}`);
}

// Execute tests
runTests().catch(error => {
  console.error(`${colors.red}Test script error: ${error.message}${colors.reset}`);
  process.exit(1);
});