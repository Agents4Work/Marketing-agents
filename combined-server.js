/**
 * Combined Server - Runs both Frontend and Backend on the same port
 * This eliminates proxy connection issues in Replit environment
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = 3000; // Use Replit's expected port
const HOST = '0.0.0.0';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Generate a secure CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Main server setup function
async function setupCompleteServer() {
  try {
    // Create Express app and HTTP server
    const app = express();
    const server = createServer(app);
    
    // Basic middleware
    app.use(express.json());
    app.use(cors({ origin: true, credentials: true }));
    
    // CSRF protection middleware (simplified for demonstration)
    function csrfProtection(req, res, next) {
      // In a real app, we would validate tokens here
      next();
    }
    
    // Request logger for debugging
    app.use((req, res, next) => {
      if (!req.path.includes('.') && !req.path.includes('__vite')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      }
      next();
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mode: IS_PRODUCTION ? 'production' : 'development',
        port: PORT
      });
    });
    
    // Test API endpoint
    app.get('/api/test', (req, res) => {
      res.json({
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
      });
    });
    
    // CSRF token API
    app.get('/api/csrf-token', (req, res) => {
      const token = generateCSRFToken();
      res.json({ token, issued: new Date().toISOString() });
    });
    
    // Mock user data
    const users = [
      { id: 1, uid: 'user123', name: 'Demo User', email: 'demo@example.com' }
    ];
    
    // User API endpoints
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
    
    // Serve test page
    app.get('/test', (req, res) => {
      res.sendFile(path.join(__dirname, 'browser-test.html'));
    });
    
    // Setup Vite for development
    if (!IS_PRODUCTION) {
      try {
        // Dynamically import Vite
        const { createServer: createViteServer } = await import('vite');
        
        // Create Vite server in middleware mode
        const vite = await createViteServer({
          server: { 
            middlewareMode: true,
            hmr: {
              clientPort: PORT // Ensure HMR works correctly
            }
          },
          appType: 'spa',
          root: './'
        });
        
        // Use Vite's connect instance as middleware
        app.use(vite.middlewares);
        
        console.log('Vite development server initialized');
        
        // Try to load API routes from TypeScript code
        try {
          const routesModule = await vite.ssrLoadModule('./server/routes.ts');
          if (routesModule && routesModule.registerRoutes) {
            console.log('Loading API routes from server/routes.ts');
            await routesModule.registerRoutes(app);
          }
        } catch (err) {
          console.error('Failed to load API routes:', err.message);
        }
      } catch (err) {
        console.error('Failed to initialize Vite:', err.message);
        console.log('Continuing without Vite integration');
      }
    } else {
      // Serve static files in production
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        app.use(express.static(path.join(__dirname, 'dist')));
      }
    }
    
    // SPA fallback for client routes
    app.use('*', (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      // Provide a basic HTML fallback
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Server Running</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.5; }
              h1 { color: #2563eb; }
              a { color: #2563eb; }
              .card { background: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <h1>Combined Server Running Successfully</h1>
            <p>The server is running on port ${PORT} and ready to accept API requests and serve frontend content.</p>
            <div class="card">
              <h2>Available Test Endpoints:</h2>
              <ul>
                <li><a href="/health">/health</a> - Check server health</li>
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
  COMBINED SERVER RUNNING AT http://${HOST}:${PORT}
  
  Mode: ${IS_PRODUCTION ? 'Production' : 'Development'}
  
  Frontend: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/health
  Test Page: http://localhost:${PORT}/test
=========================================================
      `);
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start combined server:', error);
    process.exit(1);
  }
}

// Start the combined server
setupCompleteServer();