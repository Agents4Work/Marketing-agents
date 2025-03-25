import { apiRequest } from "@/lib/queryClient";

// Types for Gemini API
export type GeminiMessage = {
  role: string;
  parts: Array<{ text: string }>;
};

export type ConversationHistory = GeminiMessage[];

// Function to generate text content with Gemini
export async function generateContentWithGemini(prompt: string, type = "text") {
  try {
    const data = {
      prompt,
      type
    };
    
    return await apiRequest("/api/gemini/generate", "POST", data);
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

// Function to generate chat responses with Gemini
export async function generateChatResponse(
  message: string, 
  contentType = "text", 
  conversationHistory: ConversationHistory = []
) {
  try {
    // Primero intentar usar la ruta directa para evitar problemas con el router
    console.log("Intentando ruta directa para Gemini");
    try {
      const directResponse = await apiRequest("/direct-gemini-message", "POST", {
        message,
        contentType
      });
      
      console.log("Respuesta directa recibida:", directResponse);
      
      // Devolver la respuesta en el formato esperado
      if (directResponse && directResponse.content) {
        return {
          content: directResponse.content,
          contentType: directResponse.contentType || contentType,
          conversationHistory: directResponse.conversationHistory || [
            ...conversationHistory,
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: directResponse.content }] }
          ]
        };
      }
      
      // Si la respuesta no tiene el formato esperado, intentar extraer el contenido
      if (directResponse && typeof directResponse === 'object') {
        // Buscar la respuesta en diferentes formatos posibles
        const possibleContent = 
          directResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          directResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
          directResponse.text ||
          directResponse.message ||
          (directResponse.status === "success" && directResponse.aiResponse) || // Verificar aiResponse
          (directResponse.status === "success" ? "Operación completada con éxito" : null);
          
        if (possibleContent) {
          return {
            content: possibleContent,
            contentType: contentType,
            conversationHistory: [
              ...conversationHistory,
              { role: "user", parts: [{ text: message }] },
              { role: "model", parts: [{ text: possibleContent }] }
            ]
          };
        }
      }
      
      // Verificar si hay alguna respuesta en cualquier forma posible como último recurso
      const responseString = JSON.stringify(directResponse);
      if (responseString && responseString.length > 20) {
        try {
          // Intentar extraer algún texto que parezca una respuesta válida
          const matches = responseString.match(/"text":"([^"]+)"/);
          if (matches && matches[1]) {
            return {
              content: matches[1],
              contentType: contentType,
              conversationHistory: [
                ...conversationHistory,
                { role: "user", parts: [{ text: message }] },
                { role: "model", parts: [{ text: matches[1] }] }
              ]
            };
          }
        } catch (parseError) {
          console.warn("Error al intentar extraer texto de la respuesta:", parseError);
        }
      }
      
      // Si aún no se ha podido extraer la respuesta, lanzar un error detallado
      throw new Error(`No se pudo extraer el contenido de la respuesta: ${JSON.stringify(directResponse)}`);
    } catch (directError) {
      // Si falla el método directo, intentar con la ruta normal
      console.warn("Falló la ruta directa, intentando con la ruta normal:", directError);
      
      const data = {
        message,
        contentType,
        conversationHistory
      };
      
      console.log("Enviando solicitud a /api/gemini/chat con:", data);
      
      try {
        const response = await apiRequest("/api/gemini/chat", "POST", data);
        
        // Verificar si la respuesta tiene el formato esperado
        if (response && response.content) {
          return response;
        }
        
        // Si no tiene el formato esperado pero tiene algún contenido útil, intentar extraerlo
        if (response && typeof response === 'object') {
          const content = 
            response.text || 
            response.message || 
            (response.status === "success" ? "Respuesta exitosa del asistente" : null);
            
          if (content) {
            return {
              content,
              contentType,
              conversationHistory: [
                ...conversationHistory,
                { role: "user", parts: [{ text: message }] },
                { role: "model", parts: [{ text: content }] }
              ]
            };
          }
        }
        
        // Si no se pudo extraer contenido útil, crear una respuesta de error
        return {
          content: "No se pudo generar una respuesta válida. Por favor intenta nuevamente.",
          contentType,
          error: true,
          conversationHistory
        };
      } catch (apiError) {
        console.error("Error en la solicitud a la API de Gemini:", apiError);
        // Crear una respuesta con el error para mostrar al usuario
        return {
          content: apiError instanceof Error 
            ? `Error: ${apiError.message}` 
            : "Error desconocido al generar respuesta",
          contentType,
          error: true,
          conversationHistory
        };
      }
    }
  } catch (error) {
    console.error("Error generando respuesta de chat con Gemini:", error);
    // Devolver una respuesta con el error en lugar de lanzar la excepción
    // para que siempre haya una respuesta que mostrar en la UI
    return {
      content: error instanceof Error 
        ? `Error en comunicación con Gemini: ${error.message}` 
        : "Error desconocido al comunicarse con el asistente",
      contentType,
      error: true,
      conversationHistory
    };
  }
}

// Function to check Gemini API health
export async function checkGeminiHealth() {
  try {
    return await apiRequest("/api/gemini/health", "GET");
  } catch (error) {
    console.error("Error checking Gemini health:", error);
    return { status: "error", message: "Could not connect to Gemini API" };
  }
}