#!/bin/bash

# AI Marketing Platform Firebase Setup Script
# This script sets up Firebase for the AI Marketing Platform

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================="
echo -e "   AI Marketing Platform Firebase Setup   "
echo -e "===========================================${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo -e "${RED}Firebase CLI is not installed. Installing...${NC}"
  npm install -g firebase-tools
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Firebase CLI. Please install it manually with: npm install -g firebase-tools${NC}"
    exit 1
  fi
  echo -e "${GREEN}Firebase CLI installed successfully.${NC}"
fi

# Check Firebase CLI version
FIREBASE_VERSION=$(firebase --version)
echo -e "Firebase CLI version: ${FIREBASE_VERSION}"

# Check if user is logged in to Firebase
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}You need to log in to Firebase first...${NC}"
  firebase login
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to log in to Firebase. Please try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Successfully logged in to Firebase.${NC}"
fi

# Check if Firebase project is already initialized
if [ -f ".firebaserc" ]; then
  echo -e "${YELLOW}Firebase project already initialized.${NC}"
  echo -e "Current project: $(grep '"default"' .firebaserc | cut -d '"' -f 4)"
  read -p "Do you want to use a different project? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase use --add
  fi
else
  # Initialize Firebase project
  echo -e "${YELLOW}Initializing Firebase project...${NC}"
  
  # Check if firebase.json exists and initialize if not
  if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}Creating Firebase configuration...${NC}"
    
    # Create basic firebase.json
    cat > firebase.json << EOL
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"\$RESOURCE_DIR\" run lint",
      "npm --prefix \"\$RESOURCE_DIR\" run build"
    ]
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true
    }
  }
}
EOL
    echo -e "${GREEN}Firebase configuration created.${NC}"
  fi
  
  # Initialize Firebase project
  firebase use --add
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to initialize Firebase project. Please try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Firebase project initialized successfully.${NC}"
fi

# Create Firestore database if it doesn't exist
echo -e "${YELLOW}Checking Firestore database...${NC}"
firebase firestore:indexes > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Firestore database doesn't exist. Creating...${NC}"
  firebase firestore:databases:create --location=us-central
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to create Firestore database. You may need to create it manually in the Firebase console.${NC}"
  else
    echo -e "${GREEN}Firestore database created successfully.${NC}"
  fi
else
  echo -e "${GREEN}Firestore database already exists.${NC}"
fi

# Create default Firestore indexes file if it doesn't exist
if [ ! -f "firestore.indexes.json" ]; then
  echo -e "${YELLOW}Creating default Firestore indexes file...${NC}"
  cat > firestore.indexes.json << EOL
{
  "indexes": [],
  "fieldOverrides": []
}
EOL
  echo -e "${GREEN}Default Firestore indexes file created.${NC}"
fi

# Initialize Firebase functions
if [ ! -d "functions" ]; then
  echo -e "${YELLOW}Initializing Firebase functions...${NC}"
  mkdir -p functions
  
  # Navigate to functions directory and initialize
  cd functions
  npm init -y
  npm install firebase-admin firebase-functions
  npm install typescript ts-node @types/node --save-dev
  
  # Create basic functions structure
  mkdir -p src
  
  # Create tsconfig.json
  cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "outDir": "lib",
    "strict": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "compileOnSave": true,
  "include": [
    "src"
  ]
}
EOL
  
  # Create basic index.ts
  cat > src/index.ts << EOL
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({message: "Hello from Firebase!"});
});
EOL
  
  # Add scripts to package.json
  npm pkg set scripts.build="tsc"
  npm pkg set scripts.serve="npm run build && firebase emulators:start --only functions"
  npm pkg set scripts.deploy="firebase deploy --only functions"
  npm pkg set scripts.logs="firebase functions:log"
  npm pkg set scripts.lint="eslint --ext .js,.ts ."
  
  cd ..
  echo -e "${GREEN}Firebase functions initialized successfully.${NC}"
fi

# Set up environment variables
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file for environment variables...${NC}"
  cat > .env << EOL
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# OpenAI
OPENAI_API_KEY=

# Application
NODE_ENV=development
EOL
  echo -e "${GREEN}.env file created. Please fill in the values.${NC}"
fi

echo -e "${GREEN}=========================================="
echo -e "   Firebase Setup Completed!   "
echo -e "===========================================${NC}"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Fill in your environment variables in the .env file"
echo "2. Run 'firebase emulators:start' to test locally"
echo "3. Run './deploy.sh' when you're ready to deploy"

exit 0