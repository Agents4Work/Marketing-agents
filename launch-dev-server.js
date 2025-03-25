/**
 * Combined Server Launcher
 * 
 * This script launches the fixed proxy server that combines
 * both the Express backend and Vite frontend on a single port.
 * 
 * It's designed to work with the existing Replit workflow configuration
 * without requiring changes to the .replit file.
 */

// Simply run the existing fix-proxy-server.js script
const { spawn } = require('child_process');

console.log('Starting server with fix-proxy-server.js...');

// Run the server script
const server = spawn('node', ['fix-proxy-server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down server...');
  server.kill('SIGTERM');
});