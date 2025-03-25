# AI Marketing Platform - Server Solutions

This document explains the server setup and how to run the application in the Replit environment.

## Problem Analysis

The project was facing several issues:

1. **ES Modules vs CommonJS Conflict**: The project had conflicts between ES module syntax (import/export) and CommonJS syntax (require), causing runtime errors and preventing the server from starting properly.

2. **Too Many Server Scripts**: Multiple server scripts (server.js, working-server.js, minimal-server.js, etc.) created confusion about which one should be running.

3. **Port Conflicts**: Various server scripts were trying to use different ports, causing conflicts.

## Solution Approach

We've created a unified solution that:

1. **Standardizes on ES Modules**: Our unified server uses consistent ES Modules syntax.

2. **Provides a Single Entry Point**: All server functionality is now in `unified-app-server.js`.

3. **Includes Process Management**: Proper cleanup and process management scripts prevent port conflicts.

## Running the Application

You can run the application in several ways:

### Method 1: Use the Workflow

The Replit workflow "Start application" is configured to run the server. This is the recommended approach.

### Method 2: Use the Launch Script

Run the following command:

```bash
node launch.js
```

This will clean up any existing processes and start the unified server.

### Method 3: Run the Unified Server Directly

If you need to run the server directly:

```bash
./server-cleanup.sh  # Clean up existing processes
node unified-app-server.js
```

## Server Files Overview

- **unified-app-server.js**: The main server implementation using ES Modules.
- **server-cleanup.sh**: Script to kill existing Node.js processes and free up ports.
- **launch.js**: Simplified launcher script that handles cleanup and server startup.
- **start-unified-server.js**: Advanced server management script with error recovery.
- **run-dev.js**: Alternative to 'npm run dev' without modifying package.json.

## Troubleshooting

If you encounter issues:

1. **Server Won't Start**: Run the cleanup script first:
   ```bash
   ./server-cleanup.sh
   ```

2. **Port Already in Use**: Check for processes using the port:
   ```bash
   ss -tulpn | grep 5000
   ```

3. **Module Syntax Errors**: Make sure you're using the unified server which handles ES Module syntax properly.

4. **Multiple Servers Running**: Use the cleanup script to stop all server processes before starting a new one.

## Development Notes

- The unified server runs on port 5000 to match Replit's expected configuration.
- All server scripts use the ES Modules format for consistency.
- Server processes automatically log their status to help with monitoring.