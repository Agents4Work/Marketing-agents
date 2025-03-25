#!/bin/bash
# This script prepares the environment and runs the simplified server

# First, kill any existing processes
echo "Killing any existing processes..."
pkill -f "tsx server/index.ts" || true
pkill -f "node dist/index.js" || true
pkill -f "node server.js" || true
pkill -f "npm run dev" || true
pkill -f "node simple-server.js" || true

# Check for processes using port 5000
PORT_PID=$(ss -tulpn 2>/dev/null | grep 5000 | grep -o 'pid=[0-9]*' | cut -d= -f2)
if [ ! -z "$PORT_PID" ]; then
  echo "Killing process $PORT_PID using port 5000..."
  kill -9 $PORT_PID || true
  sleep 1
fi

# Start the simple server
echo "Starting simple server on port 8080..."
exec node simple-server.js