/**
 * Servidor Express mínimo para diagnosticar problemas de conectividad
 * Ejecutar con: node minimal-test.js
 */

import express from 'express';
import http from 'http';

// Crear una aplicación Express básica
const app = express();
const PORT = 3000;

// Middleware para registrar solicitudes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta simple para la página principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Servidor Mínimo</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; }
      </style>
    </head>
    <body>
      <h1>Servidor Express Mínimo</h1>
      <p class="success">✅ ¡El servidor está funcionando correctamente!</p>
      <p>Esta es una página mínima servida por Express para diagnosticar problemas de conectividad.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <h2>Endpoints disponibles:</h2>
      <ul>
        <li><a href="/health">Health Check</a></li>
        <li><a href="/api/test">API Test</a></li>
      </ul>
    </body>
    </html>
  `);
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de API test
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar el servidor
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor minimalista corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Acceso local via: http://localhost:${PORT}`);
  console.log('------------------------------------------------------');
  console.log('IMPORTANTE: Accede a la aplicación a través de la interfaz Web View de Replit');
  console.log('------------------------------------------------------');
});