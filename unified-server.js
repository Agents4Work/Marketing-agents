/**
 * Unified Server Solution
 * Combines Vite frontend and Express backend on a single port
 * Run with: node unified-server.js
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - adapt to Replit's requirements
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const DEV_MODE = process.env.NODE_ENV !== 'production';

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
    
    // Initialize Vite for development
    // This step is crucial - it sets up Vite's dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: './'
    });
    
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
    
    // Add API routes from server/routes.ts if available
    try {
      // Dynamic import with Vite transformation
      const routesModule = await vite.ssrLoadModule('./server/routes.ts');
      if (routesModule && routesModule.registerRoutes) {
        console.log('Registering API routes from server/routes.ts');
        await routesModule.registerRoutes(app);
      }
    } catch (error) {
      console.error('Failed to load API routes:', error);
    }
    
    // Serve static files in production (not needed in dev mode)
    if (!DEV_MODE) {
      app.use(express.static(path.join(__dirname, 'dist')));
    }
    
    // SPA fallback - always return index.html for non-API routes
    app.use('*', async (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      try {
        // In development, let Vite handle this
        if (DEV_MODE) {
          // Pass to next middleware (Vite will handle the SPA routing)
          return next();
        }
        
        // In production, serve the built index.html
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        if (fs.existsSync(indexPath)) {
          const html = fs.readFileSync(indexPath, 'utf-8');
          res.setHeader('Content-Type', 'text/html');
          return res.end(html);
        }
        
        // Fallback if no index.html exists
        res.status(404).send('Not found');
      } catch (error) {
        console.error('Error handling SPA fallback:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`
=========================================================
  UNIFIED SERVER RUNNING AT http://${HOST}:${PORT}
  
  Mode: ${DEV_MODE ? 'Development' : 'Production'}
  
  Frontend: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/api/health
=========================================================
      `);
    });
    
  } catch (error) {
    console.error('Failed to start unified server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();