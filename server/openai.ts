import { Router, Request, Response } from "express";
import { z } from "zod";

// Initialize Gemini client with error handling
const apiKey = process.env.GEMINI_API_KEY;

// Type definitions for Gemini API response
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usage?: {
    promptTokens?: number;
    candidateTokens?: number;
    totalTokens?: number;
  };
}

// Enhanced error handling for AI requests
async function safeGeminiRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Handle specific error types
    if (error.status === 429) {
      return [null, "Rate limit exceeded. Please try again later."];
    } else if (error.status === 401) {
      return [null, "Authentication error. Please check your API key."];
    } else if (error.status === 400) {
      return [null, `Bad request: ${error.message}`];
    } else {
      return [null, error.message || "An unexpected error occurred with the AI service."];
    }
  }
}

// Safe JSON parser for AI responses
function safeJSONParse(str: string): [any | null, string | null] {
  try {
    const parsed = JSON.parse(str);
    return [parsed, null];
  } catch (error: any) {
    console.error("JSON parsing error:", error);
    return [null, "Failed to parse JSON response from AI service."];
  }
}

// Schema for content generation request
const generateContentSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(1).optional(),
});

// SEO analysis schema
const analyzeSEOSchema = z.object({
  keywords: z.array(z.string()),
  content: z.string()
});

// Image generation schema
const generateImageSchema = z.object({
  prompt: z.string().min(1)
});

// Ad copy optimization schema
const optimizeAdSchema = z.object({
  copy: z.string().min(1),
  target: z.string(),
  platform: z.string()
});

// Handle content generation request
async function handleGenerateContent(req: Request, res: Response) {
  try {
    const validationResult = generateContentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request parameters",
        details: validationResult.error.issues
      });
    }

    const { prompt, model = 'gemini-pro', temperature = 0.7, maxTokens = 1000 } = validationResult.data;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
        topK: 40
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json() as GeminiResponse;
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({
      content: aiResponse,
      usage: data.usage || null
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    return res.status(400).json({ error: error.message || "An error occurred during content generation" });
  }
}

// Handler for SEO analysis
async function handleAnalyzeSEO(req: Request, res: Response) {
  try {
    const { keywords, content } = analyzeSEOSchema.parse(req.body);
    
    const promptText = `Analyze the following content for SEO optimization with respect to these keywords: ${keywords.join(", ")}
    
Content to analyze:
${content}

Provide the following analyses:
1. Keyword density and placement analysis
2. Content readability score
3. Suggested improvements
4. Overall SEO score (out of 100)

Respond in JSON format with the following structure:
{
  "keywordAnalysis": { "keyword": "analysis" },
  "readabilityScore": number,
  "suggestedImprovements": [ "suggestion1", "suggestion2" ],
  "overallScore": number
}`;

    // Using our safe request wrapper
    const [response, apiError] = await safeGeminiRequest(() =>
      fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40
          }
        })
      })
    );
    
    if (apiError) {
      return res.status(500).json({ error: apiError });
    }
    
    const content_str = response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const [parsedContent, parseError] = safeJSONParse(content_str);
    
    if (parseError) {
      return res.status(500).json({ error: parseError });
    }
    
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error analyzing SEO:", error);
    return res.status(400).json({ error: error.message || "An error occurred during SEO analysis" });
  }
}

// Handler for image generation
async function handleGenerateImage(req: Request, res: Response) {
  try {
    const { prompt } = generateImageSchema.parse(req.body);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({ url: aiResponse });
  } catch (error: any) {
    console.error("Error generating image:", error);
    return res.status(400).json({ error: error.message || "An error occurred during image generation" });
  }
}

// Handler for ad copy optimization
async function handleOptimizeAdCopy(req: Request, res: Response) {
  try {
    const { copy, target, platform } = optimizeAdSchema.parse(req.body);
    
    const promptText = `Optimize the following ad copy for the ${platform} platform, targeting ${target}:
    
Original copy:
${copy}

Provide the following in your response:
1. Optimized headline (max 60 characters)
2. Optimized body copy (max 120 characters)
3. Suggested call to action
4. Optimization rationale

Respond in JSON format with the following structure:
{
  "headline": "string",
  "bodyCopy": "string",
  "callToAction": "string",
  "rationale": "string"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 700,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const [parsedContent, parseError] = safeJSONParse(content);
    
    if (parseError) {
      return res.status(500).json({ error: parseError });
    }
    
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Error optimizing ad copy:", error);
    return res.status(400).json({ error: error.message || "An error occurred during ad copy optimization" });
  }
}

// Create router with all endpoints
export function createOpenAIRouter() {
  const router = Router();

  router.post("/generate", handleGenerateContent);
  router.post("/analyze-seo", handleAnalyzeSEO);
  router.post("/generate-image", handleGenerateImage);
  router.post("/optimize-ad", handleOptimizeAdCopy);
  
  // Health check endpoint for Gemini connectivity
  router.get("/health", async (_req, res) => {
    const timestamp = new Date().toISOString();
    
    return res.json({ 
      status: "operational", 
      message: "AI endpoints are available",
      timestamp
    });
  });
  
  // Test endpoint for chat feature
  router.get("/chat-test", (_req, res) => {
    res.json({
      status: "success",
      message: "Chat endpoint is working",
      timestamp: new Date().toISOString()
    });
  });

  return router;
}