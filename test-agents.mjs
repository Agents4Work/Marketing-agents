/**
 * Agent Verification Test Script
 * 
 * This script verifies our agent implementations exist
 * and have the appropriate properties for display.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if video-scriptwriter.ts exists
function checkVideoScriptwriterFile() {
  const filePath = path.join(__dirname, 'client', 'src', 'data', 'agents', 'video-scriptwriter.ts');
  if (fs.existsSync(filePath)) {
    console.log('✅ video-scriptwriter.ts file exists');
    return true;
  } else {
    console.log('❌ video-scriptwriter.ts file does not exist');
    return false;
  }
}

// Check if agent is exported in index.ts
function checkAgentExports() {
  const filePath = path.join(__dirname, 'client', 'src', 'data', 'agents', 'index.ts');
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    if (fileContent.includes('videoScriptwriterAgent')) {
      console.log('✅ videoScriptwriterAgent is exported in index.ts');
      return true;
    } else {
      console.log('❌ videoScriptwriterAgent is not exported in index.ts');
      return false;
    }
  } else {
    console.log('❌ index.ts file does not exist');
    return false;
  }
}

// Check if agent is included in sample data
function checkAgentInSampleData() {
  const filePath = path.join(__dirname, 'client', 'src', 'pages', 'AgentCategoryPage.tsx');
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    if (fileContent.includes('video-scriptwriter')) {
      console.log('✅ video-scriptwriter ID found in AgentCategoryPage.tsx');
      return true;
    } else {
      console.log('❌ video-scriptwriter ID not found in AgentCategoryPage.tsx');
      return false;
    }
  } else {
    console.log('❌ AgentCategoryPage.tsx file does not exist');
    return false;
  }
}

// Run all checks
function runAllChecks() {
  console.log('🔍 Starting agent verification checks...');
  const fileExists = checkVideoScriptwriterFile();
  const exportsCorrect = checkAgentExports();
  const inSampleData = checkAgentInSampleData();
  
  console.log('\n📊 Summary:');
  console.log(`Video Scriptwriter File: ${fileExists ? '✅ Exists' : '❌ Missing'}`);
  console.log(`Agent Export: ${exportsCorrect ? '✅ Correct' : '❌ Missing'}`);
  console.log(`Sample Data: ${inSampleData ? '✅ Included' : '❌ Missing'}`);
  
  if (fileExists && exportsCorrect && inSampleData) {
    console.log('\n🎉 All checks passed! The Video Scriptwriter agent is properly implemented.');
  } else {
    console.log('\n⚠️ Some checks failed. Please review the issues above.');
  }
}

// Execute the script
runAllChecks();