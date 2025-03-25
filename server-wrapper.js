/**
 * Server Wrapper for Replit Compatibility
 * This script checks the environment and decides which server to run.
 * In Replit, it will use the fixed configuration on port 5000.
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to check if we're running in Replit
function isReplitEnvironment() {
  return process.env.REPL_ID !== undefined || process.env.REPL_OWNER !== undefined;
}

// Run the appropriate server
function runServer() {
  console.log('Starting server with Replit compatibility...');
  
  // Always use the fixed-replit-config.js in Replit environment
  const serverPath = path.join(__dirname, 'fix-replit-config.js');
  
  console.log(`Running server from: ${serverPath}`);
  
  // Start the server process
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Handle server process events
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`Server process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down server...');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down server...');
    server.kill('SIGTERM');
  });
}

// Start the server with Replit compatibility
runServer();