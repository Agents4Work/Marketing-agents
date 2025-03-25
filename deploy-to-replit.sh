#!/bin/bash
# AI Marketing Platform - Replit Deployment Script

set -e  # Exit immediately if a command fails

# Print with colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AI Marketing Platform - Replit Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Check if we are in a Replit environment
if [ -z "$REPL_ID" ]; then
  echo -e "${RED}Error: This script should be run in a Replit environment.${NC}"
  echo -e "${YELLOW}If you're running locally, use deploy.sh instead.${NC}"
  exit 1
fi

# Print deployment info
echo -e "${YELLOW}Deployment Info:${NC}"
echo -e "- Repl ID: ${REPL_ID}"
echo -e "- Environment: ${REPL_ENVIRONMENT:-development}"
echo -e "- Date: $(date)"
echo

# 1. Verify prerequisites
echo -e "${GREEN}Step 1: Verifying prerequisites...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js to continue.${NC}"
  exit 1
fi

echo -e "Node.js version: $(node -v)"
echo -e "npm version: $(npm -v)"

# 2. Install dependencies
echo -e "\n${GREEN}Step 2: Installing dependencies...${NC}"
npm ci || npm install

# 3. Check for required API keys
echo -e "\n${GREEN}Step 3: Checking for required API keys...${NC}"

if [ -f ".env" ]; then
  echo -e "Found .env file"
else
  echo -e "${YELLOW}No .env file found, creating minimal configuration...${NC}"
  cat > .env << EOL
# AI Marketing Platform Environment Configuration
NODE_ENV=production
PORT=3000
# Add your API keys below
EOL
fi

# 4. Build the application
echo -e "\n${GREEN}Step 4: Building the application for production...${NC}"
npm run build

# 5. Execute database migrations (if needed)
echo -e "\n${GREEN}Step 5: Running database migrations (if needed)...${NC}"
if [ -f "node_modules/.bin/drizzle-kit" ]; then
  echo -e "Running database migrations..."
  npm run db:push || echo -e "${YELLOW}Warning: Database migration failed, continuing anyway...${NC}"
else
  echo -e "${YELLOW}Skipping database migrations (drizzle-kit not found)${NC}"
fi

# 6. Setup port forwarding for Replit
echo -e "\n${GREEN}Step 6: Setting up Replit configuration...${NC}"

# Create or update .replit file if it doesn't exist
if [ ! -f ".replit" ]; then
  echo -e "Creating .replit configuration file..."
  cat > .replit << EOL
run = "npm start"
entrypoint = "server.js"

[env]
PORT = "3000"
NODE_ENV = "production"

[[ports]]
localPort = 3000
externalPort = 80
EOL
else
  echo -e "Using existing .replit configuration file"
fi

# 7. Final verification
echo -e "\n${GREEN}Step 7: Performing final verification...${NC}"

# Check if build directory exists
if [ -d "dist" ]; then
  echo -e "✓ Build directory exists"
else
  echo -e "${RED}✗ Build directory (dist/) not found!${NC}"
  echo -e "${YELLOW}The build process may have failed.${NC}"
fi

# Check if port 3000 is already in use
if netstat -tuln | grep -q ":3000 "; then
  echo -e "${YELLOW}⚠ Warning: Port 3000 is already in use${NC}"
else
  echo -e "✓ Port 3000 is available"
fi

# 8. Deployment complete
echo -e "\n${GREEN}Step 8: Deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   AI Marketing Platform Deployed to Replit${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "\nTo start the server, run: ${YELLOW}npm start${NC}"
echo -e "Your app will be available at: ${BLUE}https://${REPL_SLUG}.${REPL_OWNER}.repl.co${NC}"
echo -e "\nTo monitor the health of your services, run: ${YELLOW}node monitor-health.js${NC}"
echo -e "\n${YELLOW}Happy Marketing with AI!${NC}"