/**
 * AI Marketing Platform Health Check Monitor
 * =============================================
 * 
 * This script performs comprehensive health checks on all AI systems and integrations.
 * It can be run manually or as part of an automated monitoring system.
 * 
 * Features:
 * - Tests all AI and API endpoints
 * - Provides detailed status information with timestamps
 * - Color-coded output for quick visual assessment
 * - Summary report with overall health status
 * - Can be integrated with monitoring and alerting systems
 * 
 * Usage:
 *   node monitor-health.js
 * 
 * Optional Environment Variables:
 *   API_BASE_URL: Base URL for API endpoints (default: http://localhost:5000)
 *   TIMEOUT_MS: Request timeout in milliseconds (default: 5000)
 */

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Setup for console colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m', 
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '5000');

// Define endpoints to check
const ENDPOINTS = [
  // Core API health endpoints
  { url: '/api/healthcheck', description: 'Main API Health', category: 'core' },
  { url: '/api/debug/routes', description: 'API Routes', category: 'core' },
  
  // User and auth endpoints
  { url: '/api/users/test-123', description: 'User API', category: 'user' },
  
  // AI subsystems
  { url: '/api/agents/health', description: 'Agents Subsystem', category: 'ai', optional: true },
  { url: '/api/workflows/health', description: 'Workflows Subsystem', category: 'ai', optional: true },
  { url: '/api/openai/health', description: 'OpenAI Integration', category: 'ai', optional: true },
  { url: '/api/langchain/health', description: 'LangChain Integration', category: 'ai', optional: true },
  { url: '/api/deepseek/health', description: 'DeepSeek Integration', category: 'ai', optional: true },
  { url: '/api/langsmith/health', description: 'LangSmith Integration', category: 'ai', optional: true },
  { url: '/api/vertexai/health', description: 'Google Vertex AI Integration', category: 'ai', optional: true },
  
  // Content and marketing specific APIs
  { url: '/api/content-styler/presets', description: 'Content Styler', category: 'content', optional: true },
];

// Perform a curl-like request to an endpoint
async function curlCommand(endpoint) {
  const fullUrl = BASE_URL + endpoint;
  
  try {
    // Create an abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    // Perform request with timing
    const startTime = Date.now();
    const response = await fetch(fullUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    clearTimeout(timeoutId);
    
    // Calculate response time
    const responseTime = endTime - startTime;
    
    // Parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Failed to parse JSON response' };
    }
    
    return {
      url: endpoint,
      status: response.status,
      statusText: response.statusText,
      responseTime,
      ok: response.ok,
      data
    };
  } catch (error) {
    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        url: endpoint,
        status: 0,
        statusText: 'Request timed out',
        responseTime: TIMEOUT_MS,
        ok: false,
        data: { error: `Timeout after ${TIMEOUT_MS}ms` }
      };
    }
    
    // Handle other errors
    return {
      url: endpoint,
      status: 0,
      statusText: error.message,
      responseTime: 0,
      ok: false,
      data: { error: error.message }
    };
  }
}

// Format status output with colors
function formatStatus(status) {
  if (status >= 200 && status < 300) {
    return `${colors.brightGreen}${status}${colors.reset}`;
  } else if (status >= 300 && status < 400) {
    return `${colors.brightYellow}${status}${colors.reset}`;
  } else if (status >= 400 && status < 500) {
    return `${colors.brightRed}${status}${colors.reset}`;
  } else if (status >= 500) {
    return `${colors.bgRed}${colors.white}${status}${colors.reset}`;
  } else {
    return `${colors.bgRed}${colors.yellow}ERROR${colors.reset}`;
  }
}

// Run the health check
async function runHealthCheck() {
  // Print header
  console.log(`\n${colors.bgBlue}${colors.white} AI MARKETING PLATFORM HEALTH CHECK ${colors.reset}`);
  console.log(`${colors.cyan}Date:${colors.reset} ${new Date().toISOString()}`);
  console.log(`${colors.cyan}Base URL:${colors.reset} ${BASE_URL}`);
  console.log(`${colors.cyan}Timeout:${colors.reset} ${TIMEOUT_MS}ms`);
  
  // Initialize category counters
  const stats = {
    total: ENDPOINTS.length,
    succeeded: 0,
    failed: 0,
    optional_succeeded: 0,
    optional_failed: 0,
    categories: {}
  };
  
  // Initialize categories
  const uniqueCategories = [...new Set(ENDPOINTS.map(e => e.category))];
  uniqueCategories.forEach(category => {
    stats.categories[category] = {
      total: ENDPOINTS.filter(e => e.category === category).length,
      succeeded: 0,
      failed: 0,
      optional_succeeded: 0,
      optional_failed: 0
    };
  });
  
  // Test each endpoint
  console.log(`\n${colors.bold}${colors.underline}Testing API Endpoints${colors.reset}\n`);
  
  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`${colors.cyan}Testing${colors.reset} [${endpoint.category}] ${endpoint.description}...`);
    
    const result = await curlCommand(endpoint.url);
    const isOptional = endpoint.optional === true;
    
    // Update stats
    if (result.ok) {
      if (isOptional) {
        stats.optional_succeeded++;
        stats.categories[endpoint.category].optional_succeeded++;
      } else {
        stats.succeeded++;
        stats.categories[endpoint.category].succeeded++;
      }
      process.stdout.write(` ${colors.green}✓${colors.reset} ${formatStatus(result.status)} (${result.responseTime}ms)\n`);
    } else {
      if (isOptional) {
        stats.optional_failed++;
        stats.categories[endpoint.category].optional_failed++;
      } else {
        stats.failed++;
        stats.categories[endpoint.category].failed++;
      }
      process.stdout.write(` ${colors.red}✗${colors.reset} ${formatStatus(result.status)} (${result.responseTime}ms)\n`);
      console.log(`  ${colors.dim}${result.statusText}${colors.reset}`);
    }
  }
  
  // Print category summaries
  console.log(`\n${colors.bold}${colors.underline}Health Status by Category${colors.reset}\n`);
  
  for (const category of uniqueCategories) {
    const catStats = stats.categories[category];
    const requiredTotal = catStats.total - (catStats.optional_succeeded + catStats.optional_failed);
    const requiredSucceeded = catStats.succeeded;
    const allTotal = catStats.total;
    const allSucceeded = catStats.succeeded + catStats.optional_succeeded;
    
    const requiredHealth = requiredTotal > 0 ? (requiredSucceeded / requiredTotal) * 100 : 100;
    const overallHealth = allTotal > 0 ? (allSucceeded / allTotal) * 100 : 100;
    
    let healthColor;
    if (requiredHealth < 70) {
      healthColor = colors.brightRed;
    } else if (requiredHealth < 90) {
      healthColor = colors.yellow;
    } else {
      healthColor = colors.brightGreen;
    }
    
    console.log(`${colors.bold}${category.toUpperCase()}${colors.reset}`);
    console.log(`  Required Services: ${requiredSucceeded}/${requiredTotal} available (${healthColor}${Math.round(requiredHealth)}%${colors.reset})`);
    console.log(`  Optional Services: ${catStats.optional_succeeded}/${catStats.optional_succeeded + catStats.optional_failed} available`);
    console.log(`  Overall Health: ${allSucceeded}/${allTotal} services available (${Math.round(overallHealth)}%)`);
  }
  
  // Print overall summary
  const requiredTotal = stats.total - (stats.optional_succeeded + stats.optional_failed);
  const requiredSucceeded = stats.succeeded;
  const overallHealth = requiredTotal > 0 ? (requiredSucceeded / requiredTotal) * 100 : 100;
  
  console.log(`\n${colors.bold}${colors.underline}Overall System Health${colors.reset}\n`);
  
  if (stats.failed === 0) {
    console.log(`${colors.bgGreen}${colors.black} SUCCESS ${colors.reset} All required endpoints are responding correctly.`);
  } else if (overallHealth >= 70) {
    console.log(`${colors.bgYellow}${colors.black} WARNING ${colors.reset} Some endpoints are not responding correctly (${Math.round(overallHealth)}% health).`);
  } else {
    console.log(`${colors.bgRed}${colors.white} CRITICAL ${colors.reset} Multiple essential endpoints are down (${Math.round(overallHealth)}% health).`);
  }
  
  console.log(`\n${colors.cyan}Required Services:${colors.reset} ${requiredSucceeded}/${requiredTotal} available`);
  console.log(`${colors.cyan}Optional Services:${colors.reset} ${stats.optional_succeeded}/${stats.optional_succeeded + stats.optional_failed} available`);
  console.log(`${colors.cyan}Total Services:${colors.reset} ${stats.succeeded + stats.optional_succeeded}/${stats.total} available\n`);
  
  return {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    health: Math.round(overallHealth),
    requiredServices: {
      available: requiredSucceeded,
      total: requiredTotal
    },
    optionalServices: {
      available: stats.optional_succeeded,
      total: stats.optional_succeeded + stats.optional_failed
    },
    categories: stats.categories
  };
}

// Run the health check and print results
runHealthCheck().catch(error => {
  console.error(`${colors.red}Error running health check:${colors.reset}`, error);
  process.exit(1);
});