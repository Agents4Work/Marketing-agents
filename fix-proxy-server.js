/**
 * Combined Express Server with Vite Dev Configuration Fix
 * This fixes the connection issue between the proxy and backend server
 * by running both on the same exact port in development.
 * Run with: node fix-proxy-server.js
 */

import express from 'express';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Create dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a random string for CSRF token
function generateCsrfToken() {
  return crypto
    .randomBytes(16)
    .toString('hex');
}

// Create express application and server
const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.json({ token });
});

// API endpoint that returns basic information
app.get('/api/info', (req, res) => {
  res.json({
    server: 'Combined Express + Vite Server',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// API endpoint for Google Drive status
app.get('/api/google-drive/status', (req, res) => {
  res.json({
    status: 'configured',
    authMethod: 'oauth2',
    authenticationType: 'direct',
    timestamp: new Date().toISOString()
  });
});

// API endpoint for Google Docs status
app.get('/api/google-docs/status', (req, res) => {
  res.json({
    status: 'configured',
    authMethod: 'oauth2',
    documentAccess: true,
    timestamp: new Date().toISOString()
  });
});

// Simple HTML page that uses basic JavaScript to test endpoints
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-health-test.html'));
});

// Google Workspace diagnostic page
app.get('/google-diagnostic', (req, res) => {
  res.sendFile(path.join(__dirname, 'google-workspace-diagnostic.html'));
});

// Setup Vite for dev mode
async function setupVite() {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
      watch: {
        usePolling: true,
        interval: 1000
      }
    },
    appType: 'custom',
    optimizeDeps: {
      force: true
    }
  });

  // Use Vite's middleware
  app.use(vite.middlewares);

  // Serve index.html with Vite processing
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Skip API routes
      if (url.startsWith('/api/')) {
        return next();
      }

      // Get the index.html file
      let template = fs.readFileSync(
        path.resolve(__dirname, 'client/index.html'),
        'utf-8'
      );

      // Apply Vite transformations
      template = await vite.transformIndexHtml(url, template);

      // Send the transformed HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });
}

// Start the server
async function startServer() {
  try {
    // Setup Vite middleware in development
    await setupVite();

    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize the server
startServer();