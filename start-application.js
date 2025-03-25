/**
 * Application Starter Script
 * 
 * This script starts the application using our fixed proxy server configuration
 * which combines both the Express backend and Vite frontend on a single port.
 * 
 * Run with: node start-application.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log with color
function log(message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

// Start the application
async function startApplication() {
  log('Starting AI Marketing Platform...', 'cyan');
  log('Environment: ' + (process.env.NODE_ENV || 'development'), 'blue');
  
  // First check if the fix-proxy-server.js file exists
  const serverPath = path.join(__dirname, 'fix-proxy-server.js');
  if (!fs.existsSync(serverPath)) {
    log('Error: Server file not found: ' + serverPath, 'red');
    process.exit(1);
  }
  
  // Start the server
  log('Starting combined server (frontend + backend)...', 'yellow');
  const nodeProcess = spawn('node', ['--experimental-modules', '--es-module-specifier-resolution=node', 'fix-proxy-server.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  // Handle process events
  nodeProcess.on('error', (error) => {
    log('Failed to start server: ' + error.message, 'red');
    process.exit(1);
  });
  
  nodeProcess.on('exit', (code) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`, 'red');
      process.exit(code);
    }
  });
  
  // Set up signal handlers for graceful shutdown
  process.on('SIGINT', () => {
    log('Received shutdown signal. Gracefully shutting down...', 'yellow');
    nodeProcess.kill('SIGINT');
  });
  
  log('Server initialized. Application should be available shortly...', 'green');
  log('Access the application at: http://localhost:5000', 'cyan');
  log('============================================================', 'bright');
}

// Start the application
startApplication();