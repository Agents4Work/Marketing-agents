#!/bin/bash

# Server Cleanup Script
# This script moves deprecated server files to a backup directory

echo "Creating backup directory for old server files..."
mkdir -p ./deprecated-servers

echo "Moving deprecated server files to backup directory..."
mv basic-server.js combined-server.js debug-server.js direct-server.js \
   fix-proxy-server.js fix-server.js minimal-server.js server.js \
   server-wrapper.js simple-server.js unified-app-server.js \
   unified-server.js working-server.js ./deprecated-servers/ 2>/dev/null || true

echo "Cleanup complete! The main server implementation at server/index.ts remains untouched."
echo "See SERVER-DOCUMENTATION.md for server architecture details."