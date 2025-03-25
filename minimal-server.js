/**
 * Minimal Express Server for Replit environment
 * Run with: node minimal-server.js
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();

// Set port to 5000 for Replit compatibility
const PORT = 5000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve our test HTML page as the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index-backup.html'));
});

// Basic API endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Minimal server is running'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
------------------------------------------
  MINIMAL SERVER RUNNING
  
  Server running on http://0.0.0.0:${PORT}
  Try accessing: http://0.0.0.0:${PORT}/
------------------------------------------
  `);
});