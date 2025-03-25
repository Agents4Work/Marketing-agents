/**
 * Direct API testing through Express route handlers
 * This script tests the API routes directly without making HTTP requests
 */

import express from 'express';
import http from 'http';

// Create a test Express app
const app = express();
const PORT = 5500;

// Basic API endpoints for testing
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
});

app.get('/api/debug/routes', (req, res) => {
  try {
    // Just return a list of registered API routes
    const apiRoutes = [
      { path: '/api/healthcheck', methods: 'GET' },
      { path: '/api/debug/routes', methods: 'GET' },
      { path: '/api/users/:uid', methods: 'GET' }
    ];
    
    res.json({ 
      routes: apiRoutes,
      count: apiRoutes.length,
      timestamp: new Date().toISOString(),
      note: 'This is a static list of API routes for debugging purposes'
    });
  } catch (error) {
    console.error('Error in debug routes endpoint:', error);
    res.status(500).json({ 
      message: 'Error retrieving routes',
      error: error.message 
    });
  }
});

app.get('/api/users/:uid', (req, res) => {
  // Support both real UIDs and test IDs
  if (req.params.uid === 'test-123') {
    res.json({ 
      user: { 
        uid: 'test-123', 
        name: 'Test User', 
        email: 'test@example.com',
        role: 'tester',
        createdAt: new Date().toISOString()
      } 
    });
  } else {
    res.json({ 
      user: { 
        uid: req.params.uid, 
        name: 'Demo User', 
        email: 'demo@example.com',
        role: 'user',
        createdAt: new Date().toISOString()
      } 
    });
  }
});

// Function to test a route directly
function testRoute(route, params = {}) {
  console.log(`\nTesting route: ${route}`);
  
  // Create mock request
  const req = {
    params: params,
    query: {}
  };
  
  // Create mock response
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.body = data;
      console.log(`Status: ${this.statusCode}`);
      console.log('Response:', JSON.stringify(this.body, null, 2));
      return this;
    },
    
    send(data) {
      this.body = data;
      console.log(`Status: ${this.statusCode}`);
      console.log('Response:', data);
      return this;
    }
  };
  
  // Get the route handler from the app
  let handler;
  if (route === '/api/healthcheck') {
    handler = app._router.stack.find(layer => 
      layer.route && layer.route.path === '/api/healthcheck'
    ).handle;
  } else if (route === '/api/debug/routes') {
    handler = app._router.stack.find(layer => 
      layer.route && layer.route.path === '/api/debug/routes'
    ).handle;
  } else if (route.startsWith('/api/users/')) {
    handler = app._router.stack.find(layer => 
      layer.route && layer.route.path === '/api/users/:uid'
    ).handle;
  }
  
  if (handler) {
    // Execute the handler
    handler(req, res);
  } else {
    console.error(`No handler found for route: ${route}`);
  }
}

// Run tests
async function runTests() {
  console.log('\n==== API Endpoint Direct Tests ====\n');
  
  // Test health check endpoint
  testRoute('/api/healthcheck');
  
  // Test debug routes endpoint
  testRoute('/api/debug/routes');
  
  // Test user endpoint with test-123
  testRoute('/api/users/test-123', { uid: 'test-123' });
  
  // Test user endpoint with random UID
  testRoute('/api/users/random-uid', { uid: 'random-uid' });
  
  console.log('\n==== Tests Completed ====\n');
}

// Run the tests
runTests();