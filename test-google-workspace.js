/**
 * Google Workspace Integration Test Script
 * 
 * This script tests the connection to Google Drive and Google Docs APIs
 * directly using standalone Node.js requests.
 * 
 * Usage: node test-google-workspace.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const TIMEOUT_MS = 10000; // 10 seconds

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Formats status with colored output
 */
function formatStatus(status) {
  switch (status.toLowerCase()) {
    case 'success':
    case 'ok':
    case 'healthy':
    case 'active':
    case 'configured':
      return `${colors.green}${status}${colors.reset}`;
    case 'warning':
    case 'degraded':
    case 'partial':
      return `${colors.yellow}${status}${colors.reset}`;
    case 'error':
    case 'failed':
    case 'down':
      return `${colors.red}${status}${colors.reset}`;
    default:
      return `${colors.gray}${status}${colors.reset}`;
  }
}

/**
 * Make an HTTP request
 */
async function makeRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  console.log(`${colors.blue}Testing${colors.reset}: ${url}`);
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
    
    const req = http.request(url, { method: 'GET', ...options }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        clearTimeout(timeoutId);
        
        try {
          const jsonData = data.length > 0 ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data, error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Google Workspace Integration Test${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms`);
  console.log('');
  
  try {
    // Test API server health
    try {
      console.log(`${colors.magenta}API Server Health${colors.reset}`);
      const healthResponse = await makeRequest('/api/health');
      console.log(`Status: ${formatStatus(healthResponse.status === 200 ? 'healthy' : 'error')}`);
      console.log(`Response: ${JSON.stringify(healthResponse.data, null, 2)}`);
      console.log('');
    } catch (error) {
      console.log(`${colors.red}Error${colors.reset}: ${error.message}`);
      console.log('');
    }
    
    // Test Google Drive API
    try {
      console.log(`${colors.magenta}Google Drive API${colors.reset}`);
      const driveResponse = await makeRequest('/api/google-drive/status');
      console.log(`Status: ${formatStatus(driveResponse.status === 200 ? 'configured' : 'error')}`);
      console.log(`Response: ${JSON.stringify(driveResponse.data, null, 2)}`);
      console.log('');
    } catch (error) {
      console.log(`${colors.red}Error${colors.reset}: ${error.message}`);
      console.log('');
    }
    
    // Test Google Docs API
    try {
      console.log(`${colors.magenta}Google Docs API${colors.reset}`);
      const docsResponse = await makeRequest('/api/google-docs/status');
      console.log(`Status: ${formatStatus(docsResponse.status === 200 ? 'configured' : 'error')}`);
      console.log(`Response: ${JSON.stringify(docsResponse.data, null, 2)}`);
      console.log('');
    } catch (error) {
      console.log(`${colors.red}Error${colors.reset}: ${error.message}`);
      console.log('');
    }
  } catch (error) {
    console.error(`${colors.red}Test execution failed${colors.reset}: ${error.message}`);
  }
  
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.cyan}Tests completed${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
}

// Run the tests
runTests();