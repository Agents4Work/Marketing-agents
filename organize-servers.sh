#!/bin/bash
# Script to organize server files and reduce clutter

echo "=== Organizing server files ==="

# Create legacy directory if it doesn't exist
mkdir -p legacy_servers

# List of server files to move
SERVER_FILES=(
  "server.js"
  "basic-server.js"
  "combined-server.js"
  "debug-server.js"
  "direct-server.js"
  "fix-proxy-server.js"
  "fix-replit-config.js"
  "fix-server.js"
  "minimal-server.js"
  "simple-server.js"
  "simple-proxy.js"
  "simple-test.js"
  "test-simple-node.js"
  "unified-server.js"
  "working-server.js"
)

# Move each file if it exists
for file in "${SERVER_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Moving $file to legacy_servers/"
    mv "$file" legacy_servers/
  fi
done

echo "=== Creating a symlink to the active server ==="
ln -sf unified-app-server.js active-server.js

echo "=== Organization complete ==="
echo "Active server is now: unified-app-server.js"
echo "Legacy servers moved to: legacy_servers/"