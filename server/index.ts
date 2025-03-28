import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { log, setupVite } from './vite';
import { storage } from './storage';
import { attachCsrfToken, validateCsrfToken, getCsrfTokenHandler } from './middleware/csrf-middleware';
import { securityRouter } from './routes/security';
import { securityHeaders, contentTypeCheck } from './middleware/security';
import * as routesModule from './routes';
import geminiRouter from './routes/gemini';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Load Google OAuth credentials
const GOOGLE_CREDENTIALS_PATH = path.join(process.cwd(), 'credentials', 'google-docs-credentials.json');
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'credentials', 'service-account.json');

// Try to load Google OAuth credentials
let googleOAuthCredentials = null;
try {
  if (fs.existsSync(GOOGLE_CREDENTIALS_PATH)) {
    const credentialsFile = fs.readFileSync(GOOGLE_CREDENTIALS_PATH, 'utf8');
    googleOAuthCredentials = JSON.parse(credentialsFile);
    console.log('🔄 Google Docs OAuth credentials loaded successfully');
  } else {
    console.warn('⚠️ Google Docs OAuth credentials file not found at:', GOOGLE_CREDENTIALS_PATH);
  }
} catch (error) {
  console.error('❌ Error loading Google Docs OAuth credentials:', error);
}

// Try to load Service Account credentials
let googleServiceAccount = null;
try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccountFile = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    googleServiceAccount = JSON.parse(serviceAccountFile);
    console.log('🔄 Google Docs Service Account loaded successfully');
  } else {
    console.warn('⚠️ Google Docs Service Account file not found at:', SERVICE_ACCOUNT_PATH);
  }
} catch (error) {
  console.error('❌ Error loading Google Docs Service Account:', error);
}

// Export credentials for use in other modules
export { googleOAuthCredentials, googleServiceAccount };

// Create dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app and server
const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env.REPLIT_ENVIRONMENT ? 5000 : 3000; // Use 5000 for Replit, 3000 for local
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Apply security middleware first
app.use(securityHeaders);
app.use(contentTypeCheck);

// Add CSRF token route
app.get('/api/csrf-token', attachCsrfToken, getCsrfTokenHandler);

// Register security test routes
app.use('/api', securityRouter);

// Register Gemini routes
app.use('/api/gemini', geminiRouter);

// Apply CSRF protection to all non-GET API routes
app.post("/api/*", validateCsrfToken);
app.put("/api/*", validateCsrfToken);
app.patch("/api/*", validateCsrfToken);
app.delete("/api/*", validateCsrfToken);

// Serve static files from the root directory
app.use('/static', express.static(path.join(__dirname, '..')));

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User API endpoints
app.get('/api/users/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    console.log(`Fetching user with UID: ${uid}`);
    
    const user = await storage.getUserByUid(uid);
    
    if (user) {
      console.log(`User found:`, user);
      res.json(user);
    } else {
      console.log(`User not found with UID: ${uid}`);
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by UID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Add a test endpoint that serves our diagnostic page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-view.html'));
});

// Add a direct API test page that bypasses Vite/React
app.get('/api-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'api-test.html'));
});

// Add a simple health test page for checking API functionality
app.get('/simple-health-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'simple-health-test.html'));
});

// Add a Gemini API test page
app.get('/test-gemini-api', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-api-gemini.html'));
});

// Add a simple Gemini test page
app.get('/simple-gemini-test', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'simple-gemini-test.html'));
});

// Add a server-info endpoint that shows configuration details
app.get('/server-info', (req, res) => {
  // Create a safe version of env variables (hiding sensitive values)
  const safeEnv = Object.entries(process.env).reduce((acc, [key, value]) => {
    // Skip environment variables that might contain secrets
    if (key.toLowerCase().includes('key') || 
        key.toLowerCase().includes('secret') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('password')) {
      acc[key] = '***REDACTED***';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string | undefined>);
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server Information</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1000px; margin: 0 auto; padding: 20px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
          .section { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Server Information</h1>
        
        <div class="section">
          <h2>Server Configuration</h2>
          <ul>
            <li><strong>Port:</strong> ${PORT}</li>
            <li><strong>Host:</strong> ${HOST}</li>
            <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
            <li><strong>Node Version:</strong> ${process.version}</li>
            <li><strong>Platform:</strong> ${process.platform}</li>
            <li><strong>Server Time:</strong> ${new Date().toISOString()}</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>Request Information</h2>
          <ul>
            <li><strong>Method:</strong> ${req.method}</li>
            <li><strong>URL:</strong> ${req.url}</li>
            <li><strong>Headers:</strong></li>
          </ul>
          <pre>${JSON.stringify(req.headers, null, 2)}</pre>
        </div>
        
        <div class="section">
          <h2>Available Routes</h2>
          <ul>
            <li><a href="/">/</a> - Home/Frontend (Vite/React app)</li>
            <li><a href="/api/health">/api/health</a> - API Health Check</li>
            <li><a href="/api/csrf-token">/api/csrf-token</a> - Get CSRF Token</li>
            <li><a href="/api-test">/api-test</a> - API Testing Page</li>
            <li><a href="/test">/test</a> - Test Page</li>
            <li><a href="/debug">/debug</a> - Simple Debug Page</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>Environment Variables (Sensitive Data Redacted)</h2>
          <pre>${JSON.stringify(safeEnv, null, 2)}</pre>
        </div>
      </body>
    </html>
  `);
});

// Add a simple debug endpoint that returns plain HTML
app.get('/debug', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Debug Page</title>
      </head>
      <body>
        <h1>Server is working!</h1>
        <p>This simple debug page confirms the server is responding.</p>
        <p>Server time: ${new Date().toISOString()}</p>
        <p>Try these links:</p>
        <ul>
          <li><a href="/api/health">API Health Check</a></li>
          <li><a href="/test">Test Page</a></li>
          <li><a href="/">Root/Home Page</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Initialize Gemini client
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Gemini routes
app.post('/api/gemini/generate-images', async (req, res) => {
  try {
    const { prompt, numberOfImages = 4, aspectRatio = '1:1', allowPersonGeneration = true } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent([
      {
        text: `Generate an image based on this description: ${prompt}. 
               The image should be high quality and detailed.
               Do not include any text in the image.`
      }
    ]);

    const response = await result.response;
    const images = response.candidates?.[0]?.content?.parts
      ?.filter(part => part.inlineData?.mimeType?.startsWith('image/'))
      ?.map(part => ({
        url: `data:${part.inlineData?.mimeType};base64,${part.inlineData?.data}`
      })) || [];

    res.json({ images });
  } catch (error: any) {
    console.error('Error generating images:', error);
    res.status(500).json({ 
      error: 'Failed to generate images',
      details: error.message 
    });
  }
});

// Start the server with retry logic
const startServer = async () => {
  try {
    // Register API routes before Vite middleware
    console.log('Registering API routes...');
    await routesModule.registerRoutes(app);
    console.log('API routes registered successfully');
    
    // Setup Vite middleware after API routes (handles frontend)
    console.log('Setting up Vite middleware...');
    await setupVite(app, server);
    console.log('Vite middleware setup complete');
    
    // Start listening with error handling
    server.listen(PORT, HOST, () => {
      log(`Server running at http://${HOST}:${PORT}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Server running on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error: any) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
};

// Initialize the server
startServer();