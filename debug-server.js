/**
 * Simple debug script to check server status
 */

import express from 'express';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Root endpoint for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'debug-server',
    environment: process.env.NODE_ENV || 'not set',
  });
});

// Simple test page
app.get('/test-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug Server Test</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .success { color: green; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Debug Server Test</h1>
      <p class="success">✅ Server is running!</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      
      <h2>API Test</h2>
      <button id="testApi">Test API</button>
      <div id="apiResult"></div>
      
      <script>
        document.getElementById('testApi').addEventListener('click', async () => {
          try {
            const response = await fetch('/api/health');
            const data = await response.json();
            document.getElementById('apiResult').innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (err) {
            document.getElementById('apiResult').innerHTML = 
              '<p style="color:red">Error: ' + err.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Create HTTP server
const server = http.createServer(app);

// Listen on a port
const PORT = process.env.PORT || 5001;
server.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`Debug server running at http://0.0.0.0:${PORT}`);
  console.log(`Local access via: http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log(`- http://localhost:${PORT}/api/health`);
  console.log(`- http://localhost:${PORT}/test-page`);
});