#!/bin/bash

# Ensure the script is executable
chmod +x run-simple-server.sh

# Kill any processes running on port 5001
echo "Killing any existing processes on port 5001..."
kill $(lsof -t -i:5001) 2>/dev/null || true
sleep 1

# Start the simple server in the background
echo "Starting simple server..."
node simple-server.js &

# Wait a moment for the server to start
sleep 2

# Open the simple test page in a browser (in Replit, this will show in the webview)
echo "Opening test page in browser..."
echo "You can access it at: https://$(hostname -I | awk '{print $1}'):5001"
echo "Or locally at: http://localhost:5001"

# Keep the script running
echo "Server is running. Press Ctrl+C to stop."
wait