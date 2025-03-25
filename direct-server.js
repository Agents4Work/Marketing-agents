/**
 * Direct Express Server
 * This is a minimalist server that serves static files and API endpoints
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the express app
const app = express();

// Set the port to the Replit expected port
const PORT = 5000;

// Add JSON middleware
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Direct server is running correctly'
  });
});

// API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test API endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Serve our test HTML files for any other route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'minimal-test.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Direct server running at http://0.0.0.0:${PORT}`);
  console.log(`Try accessing the test page at http://0.0.0.0:${PORT}/minimal-test.html`);
});