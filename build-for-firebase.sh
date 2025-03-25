#!/bin/bash

# Set permissions on service account file
echo "Setting correct permissions on service account file..."
chmod 600 .service-account.json

# Set environment variables
echo "Setting environment variables..."
export GOOGLE_APPLICATION_CREDENTIALS="./.service-account.json"

# Build the project
echo "Building project..."
npm run build

echo "Build completed!"