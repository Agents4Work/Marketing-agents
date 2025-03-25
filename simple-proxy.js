/**
 * Simple HTTP Proxy for Replit Environment
 * This script creates a proxy server on port 5000 that forwards requests to port 3000
 * where our main application is running.
 */

import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import net from 'net';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROXY_PORT = 5000;  // The port Replit expects
const TARGET_PORT = 3000; // The port where our actual application is running
const HOST = '0.0.0.0';

// Check if target server is running
function checkTargetServer() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port: TARGET_PORT, host: 'localhost' }, () => {
      socket.end();
      resolve(true);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    // Set a timeout just in case
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

// Create a simple proxy server
const proxyServer = http.createServer((req, res) => {
  console.log(`[PROXY] ${req.method} ${req.url} -> localhost:${TARGET_PORT}`);
  
  // Special handling for health check
  if (req.url === '/proxy-health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      proxy: true,
      source: PROXY_PORT,
      target: TARGET_PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Forward the request to the target server
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  // Handle errors
  proxyReq.on('error', (err) => {
    console.error(`[PROXY ERROR] ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: `Failed to connect to target server on port ${TARGET_PORT}`,
      details: err.message
    }));
  });
  
  // Pipe request body if present
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
});

// Start the proxy
async function startProxy() {
  try {
    console.log(`Checking if target server is running on port ${TARGET_PORT}...`);
    
    // Check if target server is running
    const isTargetRunning = await checkTargetServer();
    
    if (!isTargetRunning) {
      console.warn(`WARNING: Target server does not appear to be running on port ${TARGET_PORT}.`);
      console.warn('The proxy will start anyway, but requests may fail until the target server is available.');
    } else {
      console.log(`Target server is running on port ${TARGET_PORT}.`);
    }
    
    // Start listening
    proxyServer.listen(PROXY_PORT, HOST, () => {
      console.log(`
=======================================================
  SIMPLE PROXY SERVER RUNNING
  
  Proxy listening on: http://${HOST}:${PROXY_PORT}
  Forwarding to: http://localhost:${TARGET_PORT}
  
  Health check: http://localhost:${PROXY_PORT}/proxy-health
=======================================================
      `);
    });
    
    // Handle server errors
    proxyServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${PROXY_PORT} is already in use. Cannot start proxy.`);
        process.exit(1);
      } else {
        console.error(`Server error: ${err.message}`);
      }
    });
    
  } catch (err) {
    console.error('Failed to start proxy server:', err);
    process.exit(1);
  }
}

// Start the proxy
startProxy();