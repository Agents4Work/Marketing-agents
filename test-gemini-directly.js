/**
 * Script para probar la API de Gemini directamente 
 * Ejecutar con: node test-gemini-directly.js
 */

// Función para enviar solicitud HTTP
async function fetchWithTimeout(url, options, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  clearTimeout(id);
  return response;
}

// Probar la API de Gemini
async function testGeminiAPI() {
  try {
    console.log("Probando API de Gemini...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY no está configurada en el .env");
      return;
    }
    
    console.log("API Key encontrada, enviando solicitud a Gemini...");
    
    // Probamos Gemini directamente sin pasar por nuestra API
    const message = "Hola, soy un test. Responde con un simple 'Hola desde Gemini' para verificar que funciones.";
    
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.8,
            topK: 40
          }
        })
      },
      15000
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la solicitud a Gemini:", response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log("\n======= RESPUESTA DE GEMINI =======");
    console.log(data.candidates?.[0]?.content?.parts?.[0]?.text || "No hay texto en la respuesta");
    console.log("==================================\n");
    
  } catch (error) {
    console.error("Error al probar Gemini:", error);
  }
}

// Ejecutar prueba
testGeminiAPI();