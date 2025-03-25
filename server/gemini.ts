import { Router, Request, Response } from "express";
import { z } from "zod";

// Schemas for validation
const generateContentSchema = z.object({
  prompt: z.string().min(1),
  type: z.string().default("text")
});

const generateImageSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().default("gemini-1.5-pro")
});

const chatMessageSchema = z.object({
  message: z.string().min(1),
  contentType: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "model"]),
    parts: z.array(z.object({
      text: z.string()
    }))
  })).optional()
});

// Enhanced error handling for Gemini requests
async function safeGeminiRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    if (error.status === 429) {
      return [null, "Rate limit exceeded. Please try again later."];
    } else if (error.status === 401) {
      return [null, "Authentication error. Please check your API key."];
    } else if (error.status === 400) {
      return [null, `Bad request: ${error.message}`];
    } else {
      return [null, error.message || "An unexpected error occurred with the Gemini service."];
    }
  }
}

// Handler for generating content with Gemini
async function handleGenerateContent(req: Request, res: Response) {
  try {
    console.log("Gemini content generation request received:", req.body);
    const { prompt, type } = generateContentSchema.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("Gemini API key not configured");
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    console.log("Using Gemini API Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));

    // Prepare the system instructions based on content type
    let systemInstructions = "You are an expert marketing content creator.";
    
    switch (type) {
      case "blog":
        systemInstructions += " Create a well-structured, SEO-optimized blog post with headings, subheadings, and engaging paragraphs.";
        break;
      case "social":
        systemInstructions += " Create engaging social media posts with appropriate hashtags and calls to action.";
        break;
      case "email":
        systemInstructions += " Create a professional email with subject line, greeting, body content, and call to action.";
        break;
      case "ad":
        systemInstructions += " Create compelling ad copy optimized for conversions, with attention-grabbing headlines and clear value propositions.";
        break;
      default:
        systemInstructions += " Create high-quality, engaging content optimized for the specified purpose and audience.";
        break;
    }

    console.log("Using system instructions for content type:", type);

    // Prepare request body
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstructions + "\n\n" + prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 1.5,
        maxOutputTokens: 1000,
        topP: 0.95,
        topK: 40
      }
    };

    console.log("Calling Gemini API with simplified request");

    // Definir modelos a intentar
    const modelsToTry = ['gemini-1.5-pro', 'gemini-pro'];
    let generatedText = "";
    let success = false;
    let usageData = null;

    for (const model of modelsToTry) {
      if (success) break;
      
      try {
        console.log(`Probando con el modelo: ${model}`);
        
        // Intentar con este modelo
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`Respuesta del modelo ${model}, status:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error con el modelo ${model}:`, errorText);
          continue; // Probar con el siguiente modelo
        }
        
        const data = await response.json();
        console.log(`Respuesta exitosa del modelo ${model}`);
        
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        usageData = data.usageMetadata || null;
        console.log("Texto generado:", generatedText.substring(0, 100) + "...");
        
        if (generatedText) {
          success = true;
          break;
        }
      } catch (modelError) {
        console.error(`Error al intentar con el modelo ${model}:`, modelError);
      }
    }
    
    if (!success) {
      console.error("Failed to generate content with any of the available models");
      
      // Return a more user-friendly response with fallback content to prevent UI errors
      return res.json({ 
        content: "I apologize, but I couldn't generate the content. This could be due to temporary issues with the AI service. Here's what you can try:\n\n1. Refresh the page and try again\n2. Provide more details about what you'd like to create\n3. Try a different content type\n\nI'm here to help once the service is working again.",
        error: "Could not generate content with available models",
        errorType: "generation_failed"
      });
    }

    console.log("Gemini API response received successfully");
    console.log("Generated text length:", generatedText.length);

    return res.json({
      content: generatedText,
      usage: usageData
    });
  } catch (error: any) {
    console.error("Error generating content with Gemini:", error);
    
    // Return a response with graceful error handling and fallback content
    return res.json({ 
      content: "I apologize, but I encountered an issue while generating your content. Here are some ways to get better results:\n\n1. Try providing more specific details in your request\n2. Keep your instructions clear and direct\n3. Break complex requests into simpler steps\n\nI'm here to help you create great content once we resolve this issue.",
      error: error.message || "An error occurred during content generation",
      errorType: "api_error" 
    });
  }
}

// Define the chat message type for Gemini
type GeminiMessage = {
  role: string;
  parts: Array<{ text: string }>;
};

// Simplified chat endpoint handler with better error handling
async function handleChatGeneration(req: Request, res: Response) {
  console.log("Gemini chat request received:", JSON.stringify(req.body, null, 2));
  
  // Default values in case of validation failure
  let userMessage = "Hello";
  let userContentType = "text";
  let conversationHistory: GeminiMessage[] = [];
  
  // Step 1: Validate request body
  try {
    const parsedBody = chatMessageSchema.parse(req.body);
    userMessage = parsedBody.message;
    userContentType = parsedBody.contentType || "text";
    
    if (parsedBody.conversationHistory && Array.isArray(parsedBody.conversationHistory)) {
      conversationHistory = parsedBody.conversationHistory;
    }
    
    console.log("Parsed request body successfully");
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return res.json({ 
      content: "I couldn't understand your request. Please try rephrasing it.",
      contentType: "text",
      timestamp: new Date().toISOString(),
      conversationHistory: [],
      error: "Invalid request format",
      errorType: "validation_error"
    });
  }
  
  // Step 2: Check API key
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.log("Gemini API key not configured");
    return res.json({ 
      content: "I'm sorry, but the AI service is currently unavailable. Please try again later.",
      contentType: userContentType,
      timestamp: new Date().toISOString(),
      conversationHistory: [
        ...conversationHistory,
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: "I'm sorry, but the AI service is currently unavailable. Please try again later." }] }
      ],
      error: "Gemini API key not configured",
      errorType: "configuration_error"
    });
  }
  
  console.log("Using Gemini API Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));
  
  // Step 3: Prepare request
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature: 1.5,
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 40
    }
  };
  
  // Step 4: Try different models
  const modelsToTry = ['gemini-1.5-pro', 'gemini-pro'];
  let aiResponse = "";
  let success = false;
  
  for (const model of modelsToTry) {
    if (success) break;
    
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log(`Response from ${model}, status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error with model ${model}:`, errorText);
        continue; // Try next model
      }
      
      const data = await response.json();
      console.log(`Successful response from model ${model}`);
      
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Generated text:", aiResponse.substring(0, 100) + "...");
      
      if (aiResponse) {
        success = true;
        break;
      }
    } catch (modelError) {
      console.error(`Error trying model ${model}:`, modelError);
    }
  }
  
  // Step 5: Handle successful response or fallback
  if (success) {
    // Success case - return normal response
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: aiResponse }] }
    ];
    
    return res.json({
      content: aiResponse,
      contentType: userContentType,
      timestamp: new Date().toISOString(),
      conversationHistory: updatedHistory
    });
  } else {
    // Fallback case - return graceful error
    const fallbackMessage = "I apologize, but I'm having trouble generating a response right now. This could be due to temporary issues with the AI service. Please try again in a moment.";
    
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: fallbackMessage }] }
    ];
    
    return res.json({
      content: fallbackMessage,
      contentType: userContentType,
      timestamp: new Date().toISOString(),
      conversationHistory: updatedHistory,
      error: "Could not generate response with available models",
      errorType: "generation_failed"
    });
  }
}

// Handler for generating images with Gemini
async function handleGenerateImage(req: Request, res: Response) {
  try {
    console.log("Gemini image generation request received:", req.body);
    const { prompt } = generateImageSchema.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("Gemini API key not configured");
      return res.status(500).json({ 
        error: "Gemini API key not configured",
        message: "Please configure a Gemini API key to use image generation features."
      });
    }

    console.log("Using Gemini API Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));
    
    // Use specifically gemini-1.5-flash model as recommended for image generation
    const modelToUse = "gemini-1.5-flash";
    console.log("Using Gemini image model:", modelToUse);
    console.log("Image prompt:", prompt);

    // Enhanced prompt with more specific instructions for better image generation
    const enhancedPrompt = `
Generate a detailed, high-quality image of the following:
${prompt}

The image should be:
- High resolution and visually clear
- Detailed with rich colors and proper lighting
- Professional quality suitable for marketing purposes
- Without any text or watermarks embedded in the image
- Optimized for visual appeal with balanced composition

This is for a marketing platform, so the image needs to look professional.
`.trim();

    // Prepare request body for image generation with Gemini
    const requestBody = {
      contents: [
        {
          parts: [{ 
            text: enhancedPrompt
          }]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096
      }
    };
    
    console.log("Image generation payload:", JSON.stringify(requestBody, null, 2));

    try {
      console.log(`Requesting image generation from model: ${modelToUse}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log(`Response from ${modelToUse}, status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error with image generation model ${modelToUse}:`, errorText);
        
        // También intenta con gemini-1.5-pro como alternativa si el flash no funciona
        console.log("Attempting with fallback model gemini-1.5-pro...");
        
        const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!fallbackResponse.ok) {
          const fallbackErrorText = await fallbackResponse.text();
          console.error(`Error with fallback model:`, fallbackErrorText);
          return res.status(fallbackResponse.status).json({ 
            error: "Failed to generate image with both primary and fallback models", 
            details: fallbackErrorText,
            message: "The image generation service encountered an error. Please try again with a different prompt."
          });
        }
        
        // Procesar la respuesta del modelo de respaldo
        const fallbackData = await fallbackResponse.json();
        console.log("Successful response from fallback model for image generation");
        
        return processAndReturnImageData(fallbackData, "gemini-1.5-pro", prompt, res);
      }
      
      const data = await response.json();
      console.log(`Successful response from model ${modelToUse} for image generation`);
      
      return processAndReturnImageData(data, modelToUse, prompt, res);
    } catch (error) {
      console.error("Error in Gemini image generation request:", error);
      return res.status(500).json({ 
        error: "Failed to generate image", 
        message: "An error occurred during image generation. Please try again later."
      });
    }
  } catch (error: any) {
    console.error("Error in image generation handler:", error);
    return res.status(400).json({ 
      error: error.message || "An error occurred", 
      message: "There was a problem with your image generation request. Please check your input and try again."
    });
  }
}

// Helper function to process and return image data from Gemini API response
function processAndReturnImageData(data: any, model: string, prompt: string, res: Response) {
  // Extract image data from response
  const images = [];
  
  if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inline_data) {
        images.push({
          mimeType: part.inline_data.mime_type,
          data: part.inline_data.data // This is the base64 image data
        });
      }
    }
  }
  
  console.log(`Found ${images.length} images in response`);
  
  if (images.length === 0) {
    console.log("No images found in response, checking for text-only response:");
    
    // Log additional details about the response structure to help debug
    if (data.candidates && data.candidates.length > 0) {
      console.log("Response has candidates");
      if (data.candidates[0].content) {
        console.log("First candidate has content");
        if (data.candidates[0].content.parts) {
          console.log("Content has parts:", JSON.stringify(data.candidates[0].content.parts));
        }
      }
    } else {
      console.log("Full response structure:", JSON.stringify(data, null, 2));
    }
    
    return res.status(400).json({ 
      error: "No images generated", 
      message: "The model did not return any images. Please try with a different prompt.",
      modelUsed: model,
      imagesReceived: 0
    });
  }
  
  console.log(`Successfully generated ${images.length} images`);
  
  return res.json({
    images: images,
    model: model,
    prompt: prompt,
    timestamp: new Date().toISOString(),
    imagesReceived: images.length
  });
}

// Health check endpoint for Gemini
async function handleHealthCheck(_req: Request, res: Response) {
  const apiKey = process.env.GEMINI_API_KEY;
  const timestamp = new Date().toISOString();
  
  if (!apiKey) {
    return res.json({ 
      status: "inactive", 
      message: "Gemini API key not configured",
      timestamp
    });
  }
  
  // Simple health check
  return res.json({ 
    status: "operational", 
    message: "Gemini endpoints are available",
    timestamp
  });
}

// Create Gemini router
export function createGeminiRouter() {
  const router = Router();

  // Core endpoints
  router.post("/generate", handleGenerateContent);
  router.post("/chat", handleChatGeneration);
  router.post("/generate-image", handleGenerateImage);
  
  // Health check endpoint
  router.get("/health", handleHealthCheck);

  // Special test endpoint for direct testing (no CSRF required)
  router.get("/test-api", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: false, error: "No API key configured" });
    }
    
    // Return first 5 characters to verify we have a key
    return res.json({ 
      success: true, 
      message: "Gemini API key is configured", 
      keyFirstChars: apiKey.substring(0, 5) + "..." 
    });
  });
  
  // Test endpoint for image generation (no CSRF required)
  router.get("/test-image-generation", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ success: false, error: "No API key configured" });
      }
      
      // Simple test prompt
      const testPrompt = "A minimalist logo with a blue circle";
      console.log("Testing Gemini image generation with prompt:", testPrompt);
      
      const model = "gemini-1.5-pro";
      const requestBody = {
        contents: [
          {
            parts: [{ 
              text: "Generate an image of: " + testPrompt + ". Create a detailed, high-quality image. Do not add any text to the image."
            }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096
        }
      };
      
      console.log("Test request payload:", JSON.stringify(requestBody, null, 2));
      
      console.log(`Requesting test image generation from model: ${model}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log(`Test image generation response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error with test image generation:`, errorText);
        return res.json({ 
          success: false, 
          status: response.status,
          error: errorText
        });
      }
      
      const data = await response.json();
      
      // Check if we got images back
      const images = [];
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inline_data) {
            // Just count the images, don't return the full data to keep the response small
            images.push({
              mimeType: part.inline_data.mime_type,
              size: part.inline_data.data.length
            });
          }
        }
      }
      
      return res.json({
        success: true,
        message: "Test image generation completed",
        status: response.status,
        imagesReceived: images.length,
        imageInfo: images
      });
    } catch (error) {
      console.error("Error in test image generation:", error);
      return res.json({ 
        success: false, 
        error: String(error)
      });
    }
  });

  return router;
}