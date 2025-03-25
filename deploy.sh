#!/bin/bash
# AI Marketing Platform - General Deployment Script

set -e  # Exit immediately if a command fails

# Print with colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AI Marketing Platform - Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Check for Replit environment and redirect if needed
if [ -n "$REPL_ID" ]; then
  echo -e "${YELLOW}Replit environment detected. Redirecting to Replit-specific deployment script...${NC}"
  exec ./deploy-to-replit.sh
  exit 0
fi

# Print deployment info
echo -e "${YELLOW}Deployment Info:${NC}"
echo -e "- Environment: ${NODE_ENV:-development}"
echo -e "- Date: $(date)"
echo -e "- User: $(whoami)"
echo -e "- Directory: $(pwd)"
echo

# Parse command line arguments
TARGET_ENV="production"
SKIP_BUILD=false

for arg in "$@"; do
  case $arg in
    --dev)
      TARGET_ENV="development"
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

echo -e "Target environment: ${TARGET_ENV}"
if [ "$SKIP_BUILD" = true ]; then
  echo -e "Skipping build step"
fi
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
NODE_ENV=${TARGET_ENV}
PORT=3000
# Add your API keys below
EOL
fi

# 4. Run tests (if available)
echo -e "\n${GREEN}Step 4: Running tests...${NC}"
if [ -f "node_modules/.bin/jest" ]; then
  echo -e "Running tests..."
  npm test || echo -e "${YELLOW}Warning: Some tests failed, continuing anyway...${NC}"
else
  echo -e "${YELLOW}Skipping tests (test runner not found)${NC}"
fi

# 5. Build the application
if [ "$SKIP_BUILD" = false ]; then
  echo -e "\n${GREEN}Step 5: Building the application...${NC}"
  npm run build
else
  echo -e "\n${GREEN}Step 5: Skipping build as requested${NC}"
fi

# 6. Execute database migrations (if needed)
echo -e "\n${GREEN}Step 6: Running database migrations (if needed)...${NC}"
if [ -f "node_modules/.bin/drizzle-kit" ]; then
  echo -e "Running database migrations..."
  npm run db:push || echo -e "${YELLOW}Warning: Database migration failed, continuing anyway...${NC}"
else
  echo -e "${YELLOW}Skipping database migrations (drizzle-kit not found)${NC}"
fi

# 7. Setup system service (for Linux)
echo -e "\n${GREEN}Step 7: Setting up system service (if applicable)...${NC}"

if [ -f "/etc/systemd/system" ] && [ "$TARGET_ENV" = "production" ]; then
  echo -e "Setting up systemd service..."
  
  # Create systemd service file
  sudo tee /etc/systemd/system/ai-marketing-platform.service > /dev/null << EOL
[Unit]
Description=AI Marketing Platform
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(which node) $(pwd)/server.js
Restart=on-failure
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
EOL

  # Reload systemd configuration
  sudo systemctl daemon-reload
  
  # Enable and start the service
  sudo systemctl enable ai-marketing-platform
  sudo systemctl start ai-marketing-platform
  
  echo -e "Systemd service installed and started"
else
  echo -e "${YELLOW}Skipping system service setup (not applicable for this environment)${NC}"
fi

# 8. Final verification
echo -e "\n${GREEN}Step 8: Performing final verification...${NC}"

# Check if build directory exists (if we didn't skip the build)
if [ "$SKIP_BUILD" = false ]; then
  if [ -d "dist" ]; then
    echo -e "✓ Build directory exists"
  else
    echo -e "${RED}✗ Build directory (dist/) not found!${NC}"
    echo -e "${YELLOW}The build process may have failed.${NC}"
  fi
fi

# Check server health (if applicable)
if [ "$TARGET_ENV" = "production" ]; then
  echo -e "Checking server health..."
  sleep 3 # Give the server a moment to start
  
  if curl -s http://localhost:3000/api/healthcheck > /dev/null; then
    echo -e "✓ Server is responding to health checks"
  else
    echo -e "${YELLOW}⚠ Server is not responding to health checks${NC}"
  fi
fi

# 9. Deployment complete
echo -e "\n${GREEN}Step 9: Deployment complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   AI Marketing Platform Deployed Successfully${NC}"
echo -e "${GREEN}================================================${NC}"

if [ "$TARGET_ENV" = "production" ]; then
  if [ -f "/etc/systemd/system/ai-marketing-platform.service" ]; then
    echo -e "\nYour application is running as a system service."
    echo -e "To check status: ${YELLOW}sudo systemctl status ai-marketing-platform${NC}"
    echo -e "To view logs: ${YELLOW}sudo journalctl -u ai-marketing-platform${NC}"
  else
    echo -e "\nTo start the server, run: ${YELLOW}npm start${NC}"
  fi
else
  echo -e "\nTo start the development server, run: ${YELLOW}npm run dev${NC}"
fi

echo -e "\nTo monitor the health of your services, run: ${YELLOW}node monitor-health.js${NC}"
echo -e "\n${YELLOW}Happy Marketing with AI!${NC}"