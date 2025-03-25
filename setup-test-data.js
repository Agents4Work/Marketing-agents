/**
 * Setup Test Data
 * 
 * This script initializes the in-memory storage with test data
 * for more reliable testing in the development environment.
 */

import { storage } from './server/storage.js';

// Temporary workaround if ES module import fails
let storageInstance;
try {
  // Try dynamic import as fallback
  const storageModule = await import('./server/storage.js');
  storageInstance = storageModule.storage;
} catch (error) {
  console.error('ES module import failed, using direct require fallback');
  try {
    // Try CommonJS require as last resort
    const { storage: cjsStorage } = require('./server/storage');
    storageInstance = cjsStorage;
  } catch (requireError) {
    console.error('Failed to import storage module:', requireError);
    // Create a minimal mock storage for testing
    storageInstance = {
      async createUser(user) {
        console.log('Mock storage: Creating user', user);
        return { ...user, id: 1, createdAt: new Date() };
      },
      async createCampaign(campaign) {
        console.log('Mock storage: Creating campaign', campaign);
        return { ...campaign, id: 1, createdAt: new Date(), updatedAt: new Date() };
      },
      async createWorkflow(workflow) {
        console.log('Mock storage: Creating workflow', workflow);
        return { ...workflow, id: 1, createdAt: new Date(), updatedAt: new Date() };
      }
    };
  }
}

async function setupTestData() {
  console.log('Setting up test data...');
  
  // Use the appropriate storage instance
  const activeStorage = storageInstance || storage;
  
  try {
    // Create test user
    const testUser = await activeStorage.createUser({
      uid: 'test-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null
    });
    console.log('Created test user:', testUser);
    
    // Create a test campaign for the user
    const testCampaign = await activeStorage.createCampaign({
      userId: testUser.id,
      name: 'Test Campaign',
      description: 'A campaign for testing',
      status: 'active',
      workflowData: {
        title: 'Test Workflow',
        description: 'A workflow for testing',
        version: '1.0.0'
      }
    });
    console.log('Created test campaign:', testCampaign);
    
    // Create a test workflow
    const testWorkflow = await activeStorage.createWorkflow({
      campaignId: testCampaign.id,
      name: 'Test Workflow',
      nodes: {
        node1: {
          id: 'node1',
          type: 'trigger',
          position: { x: 250, y: 100 },
          data: { label: 'Start', type: 'trigger', configuration: {} }
        },
        node2: {
          id: 'node2',
          type: 'agent',
          position: { x: 250, y: 200 },
          data: { 
            label: 'Test Agent', 
            type: 'testing',
            configuration: { 
              testMode: true,
              returnSampleData: true
            }
          }
        }
      },
      edges: {
        edge1: {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
          type: 'default',
          animated: true
        }
      }
    });
    console.log('Created test workflow:', testWorkflow);
    
    console.log('Test data setup complete!');
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

// Run the setup
setupTestData();