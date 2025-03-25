/**
 * Minimal standalone API testing script
 * Run with node minimal-api-test.js
 */

const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5500;

// Basic API endpoints for testing
app.get('/api/healthcheck', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
});

app.get('/api/users/:uid', (req, res) => {
  res.json({ 
    user: { 
      uid: req.params.uid, 
      name: 'Demo User', 
      email: 'demo@example.com',
      role: 'user',
      createdAt: new Date().toISOString()
    } 
  });
});

// Main test page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Test</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.5;
        }
        .endpoint {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f8f8f8;
        }
        .success { color: green; }
        .error { color: red; }
        pre {
          background: #eee;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        button:hover {
          background: #0055aa;
        }
      </style>
    </head>
    <body>
      <h1>API Test Dashboard</h1>
      <p>Use this page to test API endpoints in the Replit environment.</p>
      
      <div class="actions">
        <button id="test-all">Test All Endpoints</button>
        <button id="clear-results">Clear Results</button>
      </div>
      
      <div id="endpoints">
        <div class="endpoint" id="health-check">
          <h2>Health Check</h2>
          <p><strong>Endpoint:</strong> /api/healthcheck</p>
          <button class="test-btn" data-endpoint="/api/healthcheck">Test</button>
          <div class="result"></div>
        </div>
        
        <div class="endpoint" id="user-data">
          <h2>User Data</h2>
          <p><strong>Endpoint:</strong> /api/users/test-123</p>
          <button class="test-btn" data-endpoint="/api/users/test-123">Test</button>
          <div class="result"></div>
        </div>
      </div>

      <script>
        // Function to test an endpoint
        async function testEndpoint(endpoint) {
          const resultDiv = document.querySelector(\`[data-endpoint="\${endpoint}"]\`).parentNode.querySelector('.result');
          resultDiv.innerHTML = 'Testing...';
          
          try {
            const start = Date.now();
            const response = await fetch(endpoint);
            const duration = Date.now() - start;
            
            const data = await response.json();
            
            if (response.ok) {
              resultDiv.innerHTML = \`
                <p class="success">✓ Success: \${response.status} (\${duration}ms)</p>
                <pre>\${JSON.stringify(data, null, 2)}</pre>
              \`;
            } else {
              resultDiv.innerHTML = \`
                <p class="error">⚠ Error: \${response.status} (\${duration}ms)</p>
                <pre>\${JSON.stringify(data, null, 2)}</pre>
              \`;
            }
          } catch (error) {
            resultDiv.innerHTML = \`
              <p class="error">✗ Error: \${error.message}</p>
            \`;
          }
        }
        
        // Add event listeners to buttons
        document.querySelectorAll('.test-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            testEndpoint(btn.dataset.endpoint);
          });
        });
        
        // Test all endpoints
        document.getElementById('test-all').addEventListener('click', () => {
          document.querySelectorAll('.test-btn').forEach(btn => {
            testEndpoint(btn.dataset.endpoint);
          });
        });
        
        // Clear results
        document.getElementById('clear-results').addEventListener('click', () => {
          document.querySelectorAll('.result').forEach(div => {
            div.innerHTML = '';
          });
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API test server running at http://0.0.0.0:${PORT}/`);
});