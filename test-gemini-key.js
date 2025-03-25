/**
 * Script simple para probar la clave API de Gemini directamente
 */
require('dotenv').config();

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('No se encontró la clave API de Gemini en las variables de entorno');
    return;
  }
  
  console.log('Clave API de Gemini encontrada:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
  
  const prompt = "Hola, ¿cómo estás?";
  console.log('Enviando prompt a Gemini:', prompt);
  
  try {
    // Intentar con gemini-1.5-pro primero
    const models = ['gemini-1.5-pro', 'gemini-pro'];
    let success = false;
    let errorMessage = '';
    
    for (const model of models) {
      try {
        console.log(`Probando con el modelo: ${model}`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        });
        
        console.log('Código de respuesta:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error con el modelo ${model}:`, errorText);
          errorMessage = errorText;
          continue; // Probar con el siguiente modelo
        }
        
        const data = await response.json();
        console.log('Respuesta recibida:', JSON.stringify(data, null, 2));
        
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Texto generado:', generatedText);
        
        success = true;
        break; // Salir del bucle si uno de los modelos funciona
      } catch (modelError) {
        console.error(`Error al intentar con el modelo ${model}:`, modelError);
        errorMessage = modelError.message;
      }
    }
    
    if (!success) {
      console.error('Todos los modelos fallaron. Último error:', errorMessage);
    }
  } catch (error) {
    console.error('Error general al llamar a la API de Gemini:', error);
  }
}

testGeminiAPI().catch(console.error);