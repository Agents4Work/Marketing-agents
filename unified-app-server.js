/**
 * Unified Express Server Solution
 * This server works with modern ES Modules and solves the module compatibility issues
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { createServer } from 'http';

// Create dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app and server
const app = express();
const server = createServer(app);

// Configuration - use Replit's expected port
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Basic API endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'unified-app-server'
  });
});

// Serve static files from the root directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Simple HTML for the root route
app.get('/', (req, res) => {
  // Try to serve the simple-app.html if it exists
  const simplePath = path.join(__dirname, 'simple-app.html');
  
  if (fs.existsSync(simplePath)) {
    return res.sendFile(simplePath);
  }
  
  // Otherwise, display a basic HTML
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Marketing Platform</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
          text-align: center;
          padding-top: 50px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #4a6cf7;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        .btn {
          display: inline-block;
          background-color: #4a6cf7;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>AI Marketing Platform</h1>
        <div class="card">
          <h2>Server is running correctly!</h2>
          <p>The unified server configuration is working as expected.</p>
          <p>Server time: ${new Date().toLocaleTimeString()}</p>
          <a href="/api/health" class="btn">Check API Health</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Add a debug endpoint to verify server is working
app.get('/debug', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Debug Page</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
          .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Server Diagnostic Page</h1>
        
        <div class="card">
          <h2>Server Information</h2>
          <p><strong>Status:</strong> Running</p>
          <p><strong>Server time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Server type:</strong> unified-app-server (ES Modules)</p>
          <p><strong>Node.js version:</strong> ${process.version}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        </div>
        
        <div class="card">
          <h2>Available Routes</h2>
          <ul>
            <li><a href="/api/health">API Health Check</a></li>
            <li><a href="/">Home Page</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`⚡ Unified server running at http://${HOST}:${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Debug page: http://${HOST}:${PORT}/debug`);
});

// Keep server alive with occasional logging
setInterval(() => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  console.log(`Server uptime: ${hours}h ${minutes}m | Current time: ${new Date().toLocaleTimeString()}`);
}, 300000); // Log every 5 minutes