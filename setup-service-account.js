/**
 * Firebase Service Account Setup Script
 * 
 * This script helps securely handle the Firebase service account key
 * and sets up the necessary environment for Firebase Admin SDK.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Define paths
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '.service-account.json');
const ENV_FILE_PATH = path.join(__dirname, '.env');

// Function to write service account key to a file
function writeServiceAccountKey(serviceAccountKey) {
  try {
    fs.writeFileSync(SERVICE_ACCOUNT_PATH, serviceAccountKey, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', '✅ Service account key saved successfully at .service-account.json');
    
    // Set permissions to make it readable only by the owner
    fs.chmodSync(SERVICE_ACCOUNT_PATH, 0o600);
    console.log('\x1b[32m%s\x1b[0m', '🔒 File permissions set to private (readable only by owner)');
    
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error saving service account key:', error.message);
    return false;
  }
}

// Function to update .env file with service account path
function updateEnvFile() {
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    }
    
    // Check if GOOGLE_APPLICATION_CREDENTIALS is already set
    if (!envContent.includes('GOOGLE_APPLICATION_CREDENTIALS=')) {
      // Add the variable to the .env file
      envContent += `\nGOOGLE_APPLICATION_CREDENTIALS="${SERVICE_ACCOUNT_PATH}"\n`;
      fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
      console.log('\x1b[32m%s\x1b[0m', '✅ .env file updated with GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      // Update the existing variable
      const updatedContent = envContent.replace(
        /GOOGLE_APPLICATION_CREDENTIALS=.*/,
        `GOOGLE_APPLICATION_CREDENTIALS="${SERVICE_ACCOUNT_PATH}"`
      );
      fs.writeFileSync(ENV_FILE_PATH, updatedContent, 'utf8');
      console.log('\x1b[32m%s\x1b[0m', '✅ GOOGLE_APPLICATION_CREDENTIALS updated in .env file');
    }
    
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error updating .env file:', error.message);
    return false;
  }
}

// Main function to set up Firebase Admin SDK
async function setupFirebaseAdmin() {
  console.log('\x1b[33m%s\x1b[0m', '🔥 Firebase Admin SDK Setup');
  console.log('-'.repeat(50));
  
  // Check if service account key file already exists
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ A service account key file already exists.');
    
    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Ask user if they want to overwrite the existing file
    const answer = await new Promise(resolve => {
      rl.question('Do you want to overwrite it? (y/n): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('\x1b[33m%s\x1b[0m', '⚠️ Setup aborted. Using existing service account key.');
      updateEnvFile();
      return;
    }
  }
  
  console.log('\x1b[36m%s\x1b[0m', 'Please paste your Firebase service account key (JSON format):');
  console.log('\x1b[36m%s\x1b[0m', 'Type or paste then press Enter, followed by Ctrl+D (Unix) or Ctrl+Z+Enter (Windows) to finish:');
  
  // Read multi-line input
  let serviceAccountKey = '';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  for await (const line of rl) {
    serviceAccountKey += line + '\n';
  }
  
  // Validate that the input is valid JSON
  try {
    JSON.parse(serviceAccountKey.trim());
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Invalid JSON format. Please try again with a valid service account key.');
    return;
  }
  
  // Write the service account key to a file
  if (writeServiceAccountKey(serviceAccountKey)) {
    // Update the .env file
    updateEnvFile();
    
    console.log('\x1b[32m%s\x1b[0m', '-'.repeat(50));
    console.log('\x1b[32m%s\x1b[0m', '✅ Firebase Admin SDK setup completed successfully!');
    console.log('\x1b[32m%s\x1b[0m', 'You can now use Firebase Admin SDK in your application.');
  }
}

// Run the setup
setupFirebaseAdmin().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error during setup:', error.message);
  process.exit(1);
});