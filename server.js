/**
 * Simple Express Server for Testing API Connection
 * This server provides both API endpoints and serves the test HTML file
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from public folder
app.use(express.static('public'));
if (fs.existsSync(path.join(__dirname, 'client', 'dist'))) {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
}

// Debug logger (skip for static files)
app.use((req, res, next) => {
  if (!req.path.includes('.') && !req.path.includes('node_modules')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverType: 'simple-express'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Mock API Routes for testing
app.get('/api/users', (req, res) => {
  res.json({ 
    users: [
      { id: 1, name: 'Test User', email: 'test@example.com' }
    ]
  });
});

app.get('/api/campaigns', (req, res) => {
  res.json({ 
    campaigns: [
      { id: 1, name: 'Test Campaign', status: 'active' }
    ]
  });
});

// Test pages for API testing
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-direct.html'));
});

app.get('/browser-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'browser-test.html'));
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  // API 404 response
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Try to serve the SPA index.html
  const clientIndexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }

  // Fallback to a generated HTML if no index.html exists
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Marketing Platform</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #3b82f6; }
        .button { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; 
                 border-radius: 0.25rem; cursor: pointer; text-decoration: none; display: inline-block; margin-right: 0.5rem; }
        .button:hover { background: #2563eb; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
      </style>
    </head>
    <body>
      <h1>AI Marketing Platform</h1>
      <div class="card">
        <h2>Server is Running</h2>
        <p>The Express server is running successfully, but no frontend build was found.</p>
        <div id="api-status">Checking API connection...</div>
        <div style="margin-top: 1rem;">
          <a href="/test" class="button">API Test Page</a>
          <a href="/browser-test" class="button">Browser Test</a>
          <a href="/health" class="button">Health Check</a>
        </div>
      </div>
      
      <script>
        // Test API connection on load
        fetch('/api/test')
          .then(res => res.json())
          .then(data => {
            document.getElementById('api-status').innerHTML = 
              '<p class="success">✓ API connection successful!</p>';
          })
          .catch(err => {
            document.getElementById('api-status').innerHTML = 
              '<p class="error">✗ API connection failed: ' + err.message + '</p>';
          });
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // Show Replit URL if applicable
  const replitUrl = process.env.REPL_SLUG && process.env.REPL_OWNER 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
    : null;
    
  if (replitUrl) {
    console.log(`Replit URL: ${replitUrl}`);
  }
  
  // Skip the redirect server since port 5000 is already in use
  console.log('Port 5000 is in use by the application workflow, skipping redirect setup');
  console.log('Server ready! Try accessing the application in your browser.');
});