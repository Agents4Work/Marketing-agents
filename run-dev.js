/**
 * Custom Dev Script
 * This script runs instead of 'npm run dev' to avoid modifying package.json
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Create dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clear the terminal for better visibility
console.clear();

console.log(`
┌─────────────────────────────────────────────────────┐
│                                                     │
│  AI MARKETING PLATFORM                              │
│  Development Server                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
`);

// Determine if we should run the original server or the unified one
const useUnifiedServer = true; // Set to true to use the unified server

try {
  // First clean up any existing server processes
  console.log('Cleaning up existing processes...');
  execSync('./server-cleanup.sh', { stdio: 'inherit' });
  
  // Run the appropriate server
  if (useUnifiedServer) {
    console.log('\nStarting unified server...');
    execSync('node unified-app-server.js', { stdio: 'inherit' });
  } else {
    console.log('\nStarting original server (tsx)...');
    execSync('tsx server/index.ts', { stdio: 'inherit' });
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}