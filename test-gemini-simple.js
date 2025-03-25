/**
 * Script sencillo para probar la API de Gemini directamente
 */

async function testGeminiAPI() {
  try {
    console.log('Iniciando prueba simple de Gemini...');
    
    // Obtener la API key desde las variables de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('⚠️ No se encontró la API key de Gemini');
      return;
    }
    
    console.log(`✓ API key de Gemini encontrada: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Construir solicitud simple
    const message = "What are the top 3 marketing trends for 2025?";
    console.log(`Enviando mensaje: "${message}"`);
    
    const requestBody = {
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
    };
    
    // Llamar directamente a la API de Gemini
    console.log('Llamando a la API de Gemini...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    console.log(`Código de respuesta: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de la API de Gemini:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Respuesta completa:', JSON.stringify(data, null, 2));
    
    // Extraer texto de respuesta
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('\nRespuesta de la IA:\n', aiResponse);
    
    console.log('\n✅ Prueba completada con éxito');
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar prueba
testGeminiAPI();