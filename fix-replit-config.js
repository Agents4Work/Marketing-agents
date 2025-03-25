/**
 * Fixed Server Configuration for Replit
 * This script ensures our Express + Vite application works correctly in Replit's environment.
 * It fixes the port configuration mismatch between Replit (5000) and our server (3000).
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import http from 'http';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ACTUAL_PORT = 3000; // Our server runs on this port
const REPLIT_PORT = 5000; // Replit webview expects this port

async function startServer() {
  // Create our actual application server on port 3000
  const app = express();
  const server = createServer(app);
  
  // Basic middleware
  app.use(express.json());
  app.use(cors());
  
  // Basic API endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: ACTUAL_PORT
    });
  });
  
  // Create a proxy server on port 5000 that forwards to 3000
  const proxyServer = http.createServer((req, res) => {
    // Forward the request to our actual server
    const proxyReq = http.request({
      host: 'localhost',
      port: ACTUAL_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      // Copy status code and headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe the response data
      proxyRes.pipe(res, { end: true });
    });
    
    // Pipe request data to the proxy request
    req.pipe(proxyReq, { end: true });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.statusCode = 500;
      res.end('Proxy error');
    });
  });
  
  // Start both servers
  server.listen(ACTUAL_PORT, '0.0.0.0', () => {
    console.log(`Application server running on port ${ACTUAL_PORT}`);
  });
  
  proxyServer.listen(REPLIT_PORT, '0.0.0.0', () => {
    console.log(`Proxy server running on port ${REPLIT_PORT} -> forwards to ${ACTUAL_PORT}`);
  });
  
  return { app, server, proxyServer };
}

// Start the servers
startServer();