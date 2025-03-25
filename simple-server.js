/**
 * Simple Express Server for Replit environment
 * This is a minimalist server that serves our standalone HTML file
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const PORT = process.env.PORT || 5001; // Use port 5001 to avoid conflict

// Configure middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve our test html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-health-test.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Simple server is running'
  });
});

// Google Docs status endpoint (mock for testing)
app.get('/api/google-docs/status', (req, res) => {
  res.json({
    status: 'configured',
    integration: 'google-docs',
    timestamp: new Date().toISOString(),
    message: 'Google Docs integration is available'
  });
});

// Google Drive status endpoint (mock for testing)
app.get('/api/google-drive/status', (req, res) => {
  res.json({
    status: 'configured',
    integration: 'google-drive',
    timestamp: new Date().toISOString(),
    message: 'Google Drive integration is available'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running at http://0.0.0.0:${PORT}`);
  console.log(`Try these endpoints:`);
  console.log(`  - http://localhost:${PORT}/ (Test HTML page)`);
  console.log(`  - http://localhost:${PORT}/api/health (Health check)`);
  console.log(`  - http://localhost:${PORT}/api/google-docs/status (Google Docs status)`);
  console.log(`  - http://localhost:${PORT}/api/google-drive/status (Google Drive status)`);
});