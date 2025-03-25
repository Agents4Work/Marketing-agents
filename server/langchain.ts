import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Router, Request, Response } from "express";
import { z } from "zod";

// Initialize models
const apiKey = process.env.OPENAI_API_KEY;

// Create model instances
const chatModel = new ChatOpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7
});

// Content generation schema
const generateAIContentSchema = z.object({
  topic: z.string().min(1),
  audience: z.string(),
  tone: z.string(),
  purpose: z.string(),
  length: z.string()
});

// Campaign analysis schema
const analyzeCampaignSchema = z.object({
  campaignData: z.record(z.any()),
  goals: z.array(z.string())
});

// Create safe request wrapper
async function safeLangChainRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("LangChain error:", error);
    
    if (error.message.includes("OpenAI")) {
      return [null, "OpenAI API error: " + error.message];
    } else {
      return [null, error.message || "An unexpected error occurred with the LangChain service."];
    }
  }
}

/**
 * Advanced content generation using LangChain
 */
async function handleGenerateAIContent(req: Request, res: Response) {
  try {
    const { topic, audience, tone, purpose, length } = generateAIContentSchema.parse(req.body);
    
    const template = `
    Create {length} content about {topic}. 
    The audience is {audience}. 
    The tone should be {tone}. 
    The purpose is {purpose}.
    
    Make sure to:
    1. Include an engaging headline
    2. Create well-structured content with headings and subheadings
    3. Add relevant facts and statistics if appropriate
    4. End with a clear call to action
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const [response, error] = await safeLangChainRequest(() => 
      chain.invoke({
        topic,
        audience,
        tone,
        length,
        purpose
      })
    );
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json({ content: response });
  } catch (error: any) {
    console.error("Error generating AI content:", error);
    return res.status(400).json({ error: error.message || "An error occurred during AI content generation" });
  }
}

/**
 * Analyze marketing campaign with LangChain
 */
async function handleAnalyzeCampaign(req: Request, res: Response) {
  try {
    const { campaignData, goals } = analyzeCampaignSchema.parse(req.body);
    
    const template = `
    Analyze this marketing campaign data and provide insights on how well it's meeting these goals: {goals}
    
    Campaign Data:
    {campaignData}
    
    Provide the following in your analysis:
    1. Overall effectiveness score (0-100)
    2. Strengths of the campaign
    3. Areas for improvement
    4. Specific recommendations for each goal
    5. Key metrics to track going forward
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const [response, error] = await safeLangChainRequest(() => 
      chain.invoke({
        campaignData: JSON.stringify(campaignData, null, 2),
        goals: goals.join(", ")
      })
    );
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json({ 
      analysis: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error analyzing campaign:", error);
    return res.status(400).json({ error: error.message || "An error occurred during campaign analysis" });
  }
}

/**
 * Create LangChain router with advanced AI capabilities
 */
export function createLangChainRouter() {
  const router = Router();
  
  // Advanced content generation endpoint using LangChain
  router.post("/generate-content", handleGenerateAIContent);
  
  // Campaign analysis endpoint using LangChain
  router.post("/analyze-campaign", handleAnalyzeCampaign);
  
  // Health check endpoint for LangChain
  router.get("/health", (_req, res) => {
    // Simple health check without async or model validation
    try {
      // Check if the API key is available (basic check without invoking the model)
      if (!process.env.OPENAI_API_KEY) {
        return res.status(200).json({
          status: "error",
          message: "LangChain connectivity issue",
          error: "Missing OpenAI API key"
        });
      }
      
      return res.status(200).json({
        status: "ok",
        message: "LangChain configuration appears valid",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("LangChain health check error:", error);
      return res.status(200).json({
        status: "error",
        message: "LangChain configuration issue",
        error: error.message || "Unknown error"
      });
    }
  });
  
  return router;
}