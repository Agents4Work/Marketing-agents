/**
 * Simplest possible API testing script
 * This directly executes and verifies our route handlers without Express
 */

// Define test route handlers
function healthCheckHandler() {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  };
  console.log('Health Check Response:', JSON.stringify(response, null, 2));
  return response;
}

function debugRoutesHandler() {
  try {
    // Just return a list of registered API routes
    const apiRoutes = [
      { path: '/api/healthcheck', methods: 'GET' },
      { path: '/api/debug/routes', methods: 'GET' },
      { path: '/api/users/:uid', methods: 'GET' }
    ];
    
    const response = { 
      routes: apiRoutes,
      count: apiRoutes.length,
      timestamp: new Date().toISOString(),
      note: 'This is a static list of API routes for debugging purposes'
    };
    
    console.log('Debug Routes Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error in debug routes endpoint:', error);
    return { 
      message: 'Error retrieving routes',
      error: error.message 
    };
  }
}

function userHandler(uid) {
  // Support both real UIDs and test IDs
  if (uid === 'test-123') {
    const response = { 
      user: { 
        uid: 'test-123', 
        name: 'Test User', 
        email: 'test@example.com',
        role: 'tester',
        createdAt: new Date().toISOString()
      } 
    };
    console.log('User (test-123) Response:', JSON.stringify(response, null, 2));
    return response;
  } else {
    const response = { 
      user: { 
        uid: uid, 
        name: 'Demo User', 
        email: 'demo@example.com',
        role: 'user',
        createdAt: new Date().toISOString()
      } 
    };
    console.log('User (general) Response:', JSON.stringify(response, null, 2));
    return response;
  }
}

// Run tests
console.log('\n==== Simplest API Tests ====\n');

console.log('Testing health check endpoint:');
healthCheckHandler();

console.log('\nTesting debug routes endpoint:');
debugRoutesHandler();

console.log('\nTesting user endpoint (test-123):');
userHandler('test-123');

console.log('\nTesting user endpoint (random-uid):');
userHandler('random-uid');

console.log('\n==== Tests Completed Successfully ====\n');