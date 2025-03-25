/**
 * All-in-One Server Solution
 * Combines Express backend with Vite frontend to fix connection issues
 * Run with: node working-server.js
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

// Vite needs to be conditionally imported to prevent issues
let vite;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - hardcoded for Replit
const PORT = 3000; // The actual port we'll use
const HOST = '0.0.0.0';
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Generate a simple CSRF token (simplified implementation)
function generateToken() {
  return `token-${Date.now()}-${Math.round(Math.random() * 1000000)}`;
}

async function startServer() {
  try {
    // Create Express app
    const app = express();
    
    // Initialize HTTP server
    const server = createServer(app);
    
    // Basic middleware
    app.use(express.json());
    app.use(cors());
    
    // Simple request logger
    app.use((req, res, next) => {
      if (!req.path.includes('.') && !req.path.includes('__vite')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      }
      next();
    });
    
    // Basic API endpoints
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mode: DEV_MODE ? 'development' : 'production',
        port: PORT,
        unified: true
      });
    });
    
    app.get('/api/test', (req, res) => {
      res.json({
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
      });
    });
    
    // Dummy CSRF token endpoint (simplified)
    app.get('/api/csrf-token', (req, res) => {
      res.json({
        token: generateToken(),
        issued: new Date().toISOString()
      });
    });
    
    // Mock user data for testing
    const users = [
      { id: 1, uid: 'testuser123', name: 'Test User', email: 'test@example.com' }
    ];
    
    // User endpoints
    app.get('/api/users', (req, res) => {
      res.json({ users });
    });
    
    app.get('/api/users/:uid', (req, res) => {
      const user = users.find(u => u.uid === req.params.uid);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
    
    // Create simple test page route
    app.get('/test', (req, res) => {
      res.sendFile(path.join(__dirname, 'browser-test.html'));
    });
    
    // Dynamic import of Vite to prevent issues if not installed
    try {
      const viteModule = await import('vite');
      
      // Initialize Vite development server
      vite = await viteModule.createServer({
        server: { 
          middlewareMode: true,
          hmr: {
            clientPort: PORT // Ensure HMR works correctly
          }
        },
        appType: 'spa',
        clearScreen: false,
        root: './'
      });
      
      // Use Vite's connect instance as middleware
      app.use(vite.middlewares);
      
      console.log('Vite development server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vite:', error.message);
      console.log('Continuing without Vite integration...');
    }
    
    try {
      // Try to dynamically load actual API routes if possible
      const serverRoutesPath = './server/routes.ts';
      
      if (fs.existsSync(serverRoutesPath)) {
        console.log('Loading API routes...');
        
        if (vite) {
          // Use Vite to transform TypeScript
          const routesModule = await vite.ssrLoadModule('./server/routes.ts');
          if (routesModule && routesModule.registerRoutes) {
            console.log('Registering API routes from server/routes.ts');
            await routesModule.registerRoutes(app);
          }
        } else {
          console.log('Cannot load TypeScript routes without Vite, skipping...');
        }
      }
    } catch (error) {
      console.error('Failed to load API routes:', error.message);
    }
    
    // Serve static client files in production
    if (!DEV_MODE && fs.existsSync(path.join(__dirname, 'dist'))) {
      app.use(express.static(path.join(__dirname, 'dist')));
    }
    
    // SPA fallback for client routes
    app.use('*', (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      // In development mode, let Vite handle this
      if (DEV_MODE && vite) {
        return next();
      }
      
      // In production, serve the built index.html
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        return res.end(html);
      }
      
      // Provide a basic HTML fallback if nothing else matches
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>API Server Running</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.5; }
              h1 { color: #2563eb; }
              a { color: #2563eb; }
              .card { background: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <h1>Unified Server Running Successfully</h1>
            <p>The server is running on port ${PORT} and ready to accept requests.</p>
            <div class="card">
              <h2>Available Test Endpoints:</h2>
              <ul>
                <li><a href="/api/health">/api/health</a> - Check server health</li>
                <li><a href="/api/test">/api/test</a> - Test API endpoint</li>
                <li><a href="/api/users">/api/users</a> - Get test users</li>
                <li><a href="/test">/test</a> - Run browser-based tests</li>
              </ul>
            </div>
          </body>
        </html>
      `);
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`
=========================================================
  ALL-IN-ONE SERVER RUNNING AT http://${HOST}:${PORT}
  
  Mode: ${DEV_MODE ? 'Development' : 'Production'}
  
  Frontend: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/api/health
  Test Page: http://localhost:${PORT}/test
=========================================================
      `);
    });
    
    // Handle server shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server shut down');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();