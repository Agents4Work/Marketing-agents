/**
 * Server Starter Script
 * This script manages the server start/stop process and handles the transition
 * between the existing and unified servers.
 */

// Import modules
import { exec } from 'child_process';
import fs from 'fs';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper to print colored messages
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Print banner
log(`
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ${colors.cyan}AI MARKETING PLATFORM${colors.reset}                          │
│  ${colors.green}Unified Server Manager${colors.reset}                        │
│                                                     │
└─────────────────────────────────────────────────────┘
`, 'reset');

// Determine if we should use the unified server or the existing one
const useUnifiedServer = true; // Set to false to use the original server

// Function to run cleanup
function cleanup() {
  return new Promise((resolve) => {
    log('Cleaning up existing processes...', 'yellow');
    const cleanup = exec('./server-cleanup.sh');
    
    cleanup.stdout.on('data', (data) => {
      log(`[Cleanup] ${data.trim()}`, 'yellow');
    });
    
    cleanup.stderr.on('data', (data) => {
      log(`[Cleanup Error] ${data.trim()}`, 'red');
    });
    
    cleanup.on('close', (code) => {
      log(`Cleanup completed with code ${code}`, code === 0 ? 'green' : 'red');
      resolve();
    });
  });
}

// Function to start the server
async function startServer() {
  // First cleanup
  await cleanup();
  
  // Determine which server to start
  const serverCommand = useUnifiedServer 
    ? 'node unified-app-server.js'
    : 'tsx server/index.ts';
  
  log(`Starting server: ${serverCommand}`, 'cyan');
  
  // Start the server
  const server = exec(serverCommand);
  
  server.stdout.on('data', (data) => {
    log(`[Server] ${data.trim()}`, 'green');
  });
  
  server.stderr.on('data', (data) => {
    log(`[Server Error] ${data.trim()}`, 'red');
  });
  
  server.on('close', (code) => {
    log(`Server process exited with code ${code}`, code === 0 ? 'yellow' : 'red');
    // Optionally restart on unexpected exit
    if (code !== 0) {
      log('Server crashed. Restarting in 5 seconds...', 'yellow');
      setTimeout(startServer, 5000);
    }
  });
  
  // Handle process shutdown
  process.on('SIGINT', () => {
    log('Shutting down...', 'yellow');
    server.kill();
    process.exit(0);
  });
}

// Start the server
startServer().catch(err => {
  log(`Failed to start server: ${err.message}`, 'red');
  process.exit(1);
});