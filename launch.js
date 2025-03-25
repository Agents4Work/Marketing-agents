/**
 * Application Launcher Script
 * 
 * This is a simplified starter script that can be used directly by the Replit workflow
 * without modifying package.json.
 */

import { exec } from 'child_process';

console.log(`
┌────────────────────────────────────────────────────┐
│                                                    │
│  AI MARKETING PLATFORM                             │
│  Launching Application                             │
│                                                    │
└────────────────────────────────────────────────────┘
`);

// First, clean up any existing processes
const cleanup = exec('./server-cleanup.sh');
cleanup.stdout.pipe(process.stdout);
cleanup.stderr.pipe(process.stderr);

cleanup.on('close', (code) => {
  console.log('Cleanup completed, launching server...');
  
  // Start the unified server
  const server = exec('node unified-app-server.js');
  
  // Pipe output directly to console
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });
  
  // Handle process shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.kill();
    process.exit(0);
  });
});