import OpenAI from "openai";
import { Router, Request, Response } from "express";
import { z } from "zod";

// Initialize OpenAI client with error handling
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

// Enhanced error handling for AI requests
async function safeOpenAIRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
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

// Content generation schema
const generateContentSchema = z.object({
  prompt: z.string().min(1),
  type: z.string().default("text")
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

// Handler for content generation
async function handleGenerateContent(req: Request, res: Response) {
  try {
    const { prompt, type } = generateContentSchema.parse(req.body);
    
    let systemPrompt = "You are an expert marketing content creator.";
    let model = "gpt-3.5-turbo"; // Default to faster model
    
    // Customize system prompt based on content type
    switch (type) {
      case "blog":
        systemPrompt += " Create a well-structured, SEO-optimized blog post with headings, subheadings, and engaging paragraphs.";
        // Use GPT-4 for longer blog content
        model = "gpt-4";
        break;
      case "social":
        systemPrompt += " Create engaging social media posts with appropriate hashtags and calls to action.";
        break;
      case "email":
        systemPrompt += " Create a professional email with subject line, greeting, body content, and call to action.";
        break;
      case "ad":
        systemPrompt += " Create compelling ad copy optimized for conversions, with attention-grabbing headlines and clear value propositions.";
        break;
      default:
        systemPrompt += " Create high-quality, engaging content optimized for the specified purpose and audience.";
        break;
    }

    const [response, error] = await safeOpenAIRequest(() => 
      openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    );
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json({
      content: response?.choices[0].message.content || "",
      usage: response?.usage || null
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
    const [response, apiError] = await safeOpenAIRequest(() =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using 3.5-turbo for faster response times
        messages: [
          { role: "system", content: "You are an SEO expert who analyzes content and provides actionable recommendations. Respond in valid JSON format only." },
          { role: "user", content: promptText }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    );
    
    if (apiError) {
      return res.status(500).json({ error: apiError });
    }
    
    const content_str = response?.choices[0].message.content || "{}";
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
    
    const [response, error] = await safeOpenAIRequest(() =>
      openai.images.generate({
        model: "dall-e-2", // Using DALL-E 2 for faster response times and lower cost
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      })
    );
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json({ url: response?.data[0].url || "" });
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

    const [response, apiError] = await safeOpenAIRequest(() =>
      openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using 3.5-turbo for faster response times
        messages: [
          { role: "system", content: "You are an expert marketing copywriter specializing in optimizing ad copy for maximum conversions. Respond in valid JSON format only." },
          { role: "user", content: promptText }
        ],
        temperature: 0.5,
        max_tokens: 700
      })
    );
    
    if (apiError) {
      return res.status(500).json({ error: apiError });
    }
    
    const content = response?.choices[0].message.content || "{}";
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

// Create OpenAI router
export function createOpenAIRouter() {
  const router = Router();

  // Core AI endpoints
  router.post("/generate", handleGenerateContent);
  router.post("/analyze-seo", handleAnalyzeSEO);
  router.post("/generate-image", handleGenerateImage);
  router.post("/optimize-ad", handleOptimizeAdCopy);
  
  // Chat-based conversation endpoint for the conversation view
  router.post("/generate-chat", async (req: Request, res: Response) => {
    try {
      const { message, contentType, conversationHistory } = req.body;
      
      // Simple validation
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Log the request for debugging
      console.log('AI Generate Chat Request:', { message, contentType });
      
      // In a production environment, this would call your AI service
      // For now, we'll return a simulated response
      const aiResponse = `Thank you for your message about "${message.substring(0, 30)}..."
      
This is a simulated AI response for content type: ${contentType || 'general'}.

In production, this would integrate with:
- OpenAI for general content
- Vertex AI for enterprise-grade responses
- Custom LangChain pipelines for specialized marketing content

Your conversation now has ${conversationHistory?.length || 0} messages.`;

      // Add a short delay to simulate processing time
      setTimeout(() => {
        res.json({ 
          content: aiResponse,
          contentType,
          timestamp: new Date().toISOString()
        });
      }, 500);
    } catch (error: any) {
      console.error('Error in AI generate chat endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to generate AI response' });
    }
  });
  
  // Health check endpoint for OpenAI connectivity
  router.get("/health", async (_req, res) => {
    const timestamp = new Date().toISOString();
    
    // Simple health check that doesn't require OpenAI API to be configured
    return res.json({ 
      status: "operational", 
      message: "AI endpoints are available",
      timestamp
    });
  });
  
  // Test endpoint for chat feature that doesn't require OpenAI API to be configured
  router.get("/chat-test", (_req, res) => {
    res.json({
      status: "success",
      message: "Chat endpoint is working",
      timestamp: new Date().toISOString()
    });
  });

  return router;
}