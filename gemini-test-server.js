/**
 * Server express simple para pruebas directas con Gemini
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Middleware para procesar JSON
app.use(express.json());

// Servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple-gemini-test.html'));
});

// Health check para Gemini
app.get('/api/gemini/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.json({
      status: 'inactive',
      message: 'Gemini API key not configured',
      timestamp: new Date().toISOString()
    });
  }
  
  return res.json({
    status: 'operational',
    message: 'Gemini endpoints are available',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para generar contenido
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    console.log(`Generando contenido con prompt: "${prompt.substring(0, 50)}..."`);
    
    // Preparar sistema de instrucciones basado en el tipo de contenido
    let systemInstructions = "You are an expert marketing content creator.";
    
    switch (type) {
      case "blog":
        systemInstructions += " Create a well-structured, SEO-optimized blog post.";
        break;
      case "social":
        systemInstructions += " Create engaging social media posts.";
        break;
      default:
        systemInstructions += " Create high-quality, engaging content.";
        break;
    }
    
    // Preparar cuerpo de la solicitud
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemInstructions + "\n\n" + prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.95,
        topK: 40
      }
    };
    
    // Probar distintos modelos
    const modelsToTry = ['gemini-1.5-pro', 'gemini-pro'];
    let success = false;
    let generatedText = "";
    let usageData = null;
    
    for (const model of modelsToTry) {
      if (success) break;
      
      try {
        console.log(`Probando con el modelo: ${model}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`Respuesta de ${model}, status:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error con el modelo ${model}:`, errorText);
          continue; // Probar con el siguiente modelo
        }
        
        const data = await response.json();
        console.log(`Respuesta exitosa del modelo ${model}`);
        
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        usageData = data.usageMetadata || null;
        
        if (generatedText) {
          success = true;
          break;
        }
      } catch (error) {
        console.error(`Error al intentar con el modelo ${model}:`, error);
      }
    }
    
    if (!success) {
      return res.status(500).json({ 
        error: "No se pudo generar contenido con ninguno de los modelos disponibles" 
      });
    }
    
    return res.json({
      content: generatedText,
      usage: usageData
    });
  } catch (error) {
    console.error('Error al generar contenido:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al generar contenido' 
    });
  }
});

// Endpoint para chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, contentType } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    console.log(`Mensaje de chat recibido: "${message.substring(0, 50)}..."`);
    
    // Preparar cuerpo de la solicitud
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.95,
        topK: 40
      }
    };
    
    // Probar distintos modelos
    const modelsToTry = ['gemini-1.5-pro', 'gemini-pro'];
    let success = false;
    let aiResponse = "";
    
    for (const model of modelsToTry) {
      if (success) break;
      
      try {
        console.log(`Probando con el modelo: ${model}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`Respuesta de ${model}, status:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error con el modelo ${model}:`, errorText);
          continue; // Probar con el siguiente modelo
        }
        
        const data = await response.json();
        console.log(`Respuesta exitosa del modelo ${model}`);
        
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (aiResponse) {
          success = true;
          break;
        }
      } catch (error) {
        console.error(`Error al intentar con el modelo ${model}:`, error);
      }
    }
    
    if (!success) {
      return res.status(500).json({ 
        error: "No se pudo generar una respuesta con ninguno de los modelos disponibles" 
      });
    }
    
    // Construir la historia de conversación
    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: message }]
      },
      {
        role: "model",
        parts: [{ text: aiResponse }]
      }
    ];
    
    return res.json({
      content: aiResponse,
      contentType,
      timestamp: new Date().toISOString(),
      conversationHistory
    });
  } catch (error) {
    console.error('Error en el chat:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al procesar el mensaje' 
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de prueba ejecutándose en http://localhost:${PORT}`);
});