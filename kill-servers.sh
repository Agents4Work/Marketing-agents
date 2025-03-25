#!/bin/bash
# Script to kill any node processes that might be using our ports

echo "Attempting to kill any existing Node.js processes..."

# Kill processes using port 5000
pkill -f "tsx server/index.ts" || true
pkill -f "node dist/index.js" || true
pkill -f "node server.js" || true
pkill -f "npm run dev" || true

echo "Done. Any existing server processes should be terminated."