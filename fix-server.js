/**
 * Unified Server Solution
 * Fixes the connection between Vite frontend and Express backend
 * Run with: node fix-server.js
 */

const express = require('express');
const { createServer } = require('http');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');

// Create express application and server
const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: true, credentials: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Basic information endpoint
app.get('/server-info', (req, res) => {
  res.json({
    status: 'running',
    serverType: 'unified',
    port: PORT,
    host: HOST,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Serve the simple test page
app.get('/simple-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-health-test.html'));
});

// Start the main server process
async function startServer() {
  console.log('Starting unified server...');
  
  let serverProcess;
  
  try {
    // Start the main application in a child process
    console.log('Spawning server process...');
    serverProcess = spawn('tsx', ['server/index.ts'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: PORT.toString()
      }
    });
    
    // Handle child process events
    serverProcess.on('error', (error) => {
      console.error('Failed to start server process:', error);
    });
    
    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (code !== 0) {
        console.log('Attempting to restart server...');
        startServer();
      }
    });
    
    // Start unified listening
    server.listen(PORT, HOST, () => {
      console.log(`Unified server running at http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down...');
  if (serverProcess) {
    serverProcess.kill();
  }
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

// Start the server
startServer();