#!/bin/bash

# AI Marketing Platform Firebase Configuration Backup
# This script backs up important Firebase configuration and environment variables

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKUP_DIR="./firebase-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/firebase_config_${TIMESTAMP}.zip"

echo -e "${YELLOW}=========================================="
echo -e "   Firebase Configuration Backup   "
echo -e "===========================================${NC}"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
  echo -e "${GREEN}Created backup directory: $BACKUP_DIR${NC}"
fi

# Check if required files exist
if [ ! -f ".firebaserc" ] || [ ! -f "firebase.json" ]; then
  echo -e "${RED}Firebase configuration files not found. Make sure you're in the project root.${NC}"
  exit 1
fi

# List of files to back up
FILES_TO_BACKUP=(
  ".firebaserc"
  "firebase.json"
  "firestore.rules"
  ".env"
  "functions/.env"
)

# Create a temporary directory for files
TEMP_DIR="${BACKUP_DIR}/temp_${TIMESTAMP}"
mkdir -p "$TEMP_DIR"

# Copy files to the temporary directory
for file in "${FILES_TO_BACKUP[@]}"; do
  if [ -f "$file" ]; then
    # Create directory structure if needed
    dir=$(dirname "$file")
    if [ "$dir" != "." ]; then
      mkdir -p "${TEMP_DIR}/${dir}"
    fi
    cp "$file" "${TEMP_DIR}/${file}"
    echo -e "${GREEN}Backed up: $file${NC}"
  else
    echo -e "${YELLOW}Warning: File $file not found, skipping.${NC}"
  fi
done

# Export Firebase environment variables
if command -v firebase &> /dev/null; then
  echo -e "${YELLOW}Exporting Firebase Functions environment variables...${NC}"
  firebase functions:config:get > "${TEMP_DIR}/firebase_config.json" 2> /dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Exported Firebase Functions configuration.${NC}"
  else
    echo -e "${YELLOW}Warning: Could not export Firebase Functions configuration.${NC}"
  fi
fi

# Create zip file
zip -r "$BACKUP_FILE" "$TEMP_DIR" > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Created backup archive: $BACKUP_FILE${NC}"
else
  echo -e "${RED}Failed to create backup archive.${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Clean up temporary directory
rm -rf "$TEMP_DIR"

echo -e "${GREEN}=========================================="
echo -e "   Backup Completed Successfully!   "
echo -e "===========================================${NC}"
echo -e "Backup saved to: $BACKUP_FILE"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Store this backup in a secure location"
echo "2. Consider adding to .gitignore if you're versioning backups"
echo "3. Remember that environment variables contain sensitive data"

exit 0