import express from "express";
import http from "http";
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import { storage } from './storage';
import { securityHeaders, contentTypeCheck } from './middleware/security';
import { validateCsrfToken, attachCsrfToken, getCsrfTokenHandler } from './middleware/csrf-middleware';
import { securityRouter } from './routes/security';
import { googleDriveRouter } from './routes/google-drive';
import { googleDocsRouter } from './routes/google-docs';
import { usersRouter } from './routes/users';
import { createAIRouter } from './ai-client';
// Keep these imports for backward compatibility
import { createOpenAIRouter } from './openai';
import { createGeminiRouter } from './gemini';
// TODO: Firebase routes will be integrated here once firebase-api.ts is implemented

export async function registerRoutes(app: express.Application): Promise<http.Server> {
  const server = http.createServer(app);
  
  // Enable CORS for development
  app.use(cors());
  
  // Enable compression
  app.use(compression());
  
  // Cache control for static assets
  app.use((req, res, next) => {
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    next();
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Document creation endpoint
  app.post("/api/documents", async (req, res) => {
    try {
      const { title, content } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const document = {
        id: Date.now().toString(),
        title,
        content: content || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Send success response
      res.status(201).json({ success: true, document });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Basic route with improved error handling
  app.get("/api/test", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "API is working", 
      timestamp: new Date().toISOString()
    });
  });
  
  // Use storage for user data
  
  // API endpoint for getting all users
  app.get("/api/users", async (req, res) => {
    try {
      // Get all users from real storage
      const users = Array.from((await Promise.all(
        Array.from({ length: 10 }, (_, i) => storage.getUser(i + 1))
      )).filter(Boolean));
      
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // API endpoint for getting a specific user by UID
  app.get("/api/users/:uid", async (req, res) => {
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
  
  // Apply security middleware to all routes
  app.use(securityHeaders);
  app.use(contentTypeCheck);
  
  // CSRF token endpoints - returns a real CSRF token for protection
  app.get("/api/csrf-token", attachCsrfToken, getCsrfTokenHandler);
  app.get("/api/csrf/token", attachCsrfToken, getCsrfTokenHandler);
  
  // Register security test routes
  app.use('/api', securityRouter);
  
  // Register Google Drive routes
  app.use('/api/google-drive', googleDriveRouter);
  
  // Register Google Docs routes
  app.use('/api/google-docs', googleDocsRouter);
  
  // Register User routes
  app.use('/api/users', usersRouter);
  
  // Register the unified AI router
  app.use('/api/ai', createAIRouter());
  
  // Keep these routes for backward compatibility
  app.use('/api/openai', createOpenAIRouter());
  app.use('/api/gemini', createGeminiRouter());
  
  // Temporarily disable CSRF protection for development
  // app.post("/api/*", validateCsrfToken);
  // app.put("/api/*", validateCsrfToken);
  // app.patch("/api/*", validateCsrfToken);
  // app.delete("/api/*", validateCsrfToken);
  
  // Test HTML file routes
  app.get("/test-basic", (req, res) => {
    res.sendFile("test-basic.html", { root: "." });
  });
  
  app.get("/test-direct", (req, res) => {
    res.sendFile("test-direct.html", { root: "." });
  });
  
  app.get("/browser-test", (req, res) => {
    res.sendFile("browser-test.html", { root: "." });
  });
  
  // Serve test-direct.html at the root for easy testing
  app.get("/test", (req, res) => {
    res.sendFile("test-direct.html", { root: "." });
  });
  
  // Serve gemini-test.html for testing Gemini API
  app.get("/gemini-test", (req, res) => {
    res.sendFile("gemini-test.html", { root: "." });
  });
  
  // Serve test-api-gemini.html for direct API testing
  app.get("/test-gemini-api", (req, res) => {
    res.sendFile("test-api-gemini.html", { root: "." });
  });
  
  // Serve simple-gemini-test.html for minimalist API testing
  app.get("/simple-gemini-test", (req, res) => {
    res.sendFile("simple-gemini-test.html", { root: "." });
  });
  
  // Serve test-gemini-health.html for minimal health check testing
  app.get("/test-gemini-health", (req, res) => {
    res.sendFile("test-gemini-health.html", { root: "." });
  });
  
  // Serve test-gemini-specific.html for direct API testing
  app.get("/test-gemini-specific", (req, res) => {
    res.sendFile("test-gemini-specific.html", { root: "." });
  });
  
  // Serve chat-test.html for testing the /api/gemini/chat endpoint
  app.get("/chat-test", (req, res) => {
    res.sendFile("chat-test.html", { root: "." });
  });
  
  // Serve simple-chat-ui.html for a direct chat interface
  app.get("/simple-chat", (req, res) => {
    res.sendFile("simple-chat-ui.html", { root: "." });
  });
  
  // Direct test endpoint for Gemini
  app.get("/direct-gemini-test", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Gemini API key not configured", 
        timestamp: new Date().toISOString() 
      });
    }
    
    return res.json({
      status: "success",
      message: "Direct Gemini test endpoint working",
      apiKeyConfigured: true,
      apiKeyPrefix: apiKey.substring(0, 4) + "...",
      timestamp: new Date().toISOString()
    });
  });

  // Endpoint to test direct message sending to Gemini
  app.post("/direct-gemini-message", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { message, contentType = "text" } = req.body;
      
      console.log("Solicitud directa a Gemini recibida:", req.body);
      
      if (!apiKey) {
        console.log("API key de Gemini no configurada");
        return res.status(500).json({ 
          error: "Gemini API key not configured",
          content: "Error: Gemini API key no está configurada. Por favor configura la clave de API de Gemini.", // Siempre incluir content
          status: "error",
          timestamp: new Date().toISOString()
        });
      }
      
      if (!message) {
        console.log("No se proporcionó mensaje");
        return res.status(400).json({ 
          error: "No message provided",
          content: "Error: No se proporcionó un mensaje. Por favor escribe un mensaje para el asistente.", // Siempre incluir content
          status: "error",
          timestamp: new Date().toISOString()
        });
      }
      
      console.log("Procesando solicitud directa a Gemini con mensaje:", message);
      
      // Preparar el cuerpo de la solicitud
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };
      
      // Probar con múltiples modelos para mayor fiabilidad
      const modelsToTry = ['gemini-1.5-pro', 'gemini-pro'];
      let aiResponse = "";
      let success = false;
      let rawResponse = null;
      
      for (const model of modelsToTry) {
        if (success) break;
        
        try {
          console.log(`Intentando con el modelo: ${model}`);
          
          // Direct API call to Gemini with the current model
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          console.log(`Respuesta de la API de Gemini (${model}) recibida, status:`, response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error con el modelo ${model}:`, errorText);
            continue; // Probar con el siguiente modelo
          }
          
          const responseData = await response.json();
          rawResponse = responseData; // Guardar la respuesta completa
          console.log(`Datos de respuesta del modelo ${model}:`, JSON.stringify(responseData).substring(0, 200) + "...");
          
          // Extraer la respuesta del modelo
          const extractedResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          if (extractedResponse) {
            aiResponse = extractedResponse;
            success = true;
            console.log(`Respuesta exitosa del modelo ${model}:`, aiResponse.substring(0, 100) + "...");
            break;
          } else {
            console.log(`No se pudo extraer respuesta del modelo ${model}`);
          }
        } catch (modelError) {
          console.error(`Error al intentar con el modelo ${model}:`, modelError);
        }
      }
      
      if (!success) {
        console.error("Todos los modelos fallaron al generar una respuesta");
        
        // Verificar si tenemos alguna información útil de error
        let errorMsg = "No se pudo generar una respuesta con ninguno de los modelos disponibles";
        
        // Buscar algún mensaje de error más específico
        if (rawResponse) {
          errorMsg = rawResponse.error?.message || errorMsg;
        }
        
        return res.status(500).json({
          error: errorMsg,
          content: `Error: ${errorMsg}. Por favor intenta de nuevo más tarde.`, // Siempre incluir content
          status: "error",
          timestamp: new Date().toISOString()
        });
      }
      
      // Preparar y enviar respuesta en el formato esperado por el frontend
      return res.json({
        status: "success",
        content: aiResponse, // Este es el campo clave que el frontend espera
        contentType: contentType,
        timestamp: new Date().toISOString(),
        conversationHistory: [
          {
            role: "user",
            parts: [{ text: message }]
          },
          {
            role: "model",
            parts: [{ text: aiResponse }]
          }
        ],
        // Incluir la respuesta completa para ayudar en la depuración
        rawResponse: process.env.NODE_ENV === 'development' ? rawResponse : undefined
      });
    } catch (error) {
      console.error('Error al llamar a la API de Gemini:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.log("Mensaje de error:", errorMessage);
      
      // Asegurar que siempre enviamos un campo 'content' incluso en error
      return res.status(500).json({ 
        error: errorMessage,
        content: `Error en el servicio: ${errorMessage}. Por favor intenta de nuevo.`, // Siempre incluir content
        status: "error",
        details: error instanceof Error ? error.stack : "No stack trace available",
        timestamp: new Date().toISOString()
      });
    }
  });

  return server;
}
