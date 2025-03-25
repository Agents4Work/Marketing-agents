/**
 * LangFlow Integration Module
 * 
 * This module provides integration with LangFlow for visual flow building
 * and workflow management.
 */

import { Request, Response, Router } from "express";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize models
const apiKey = process.env.OPENAI_API_KEY;

// Create model instances
const chatModel = new ChatOpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7
});

// Schema for flow import
const flowImportSchema = z.object({
  flow: z.record(z.any()),
  name: z.string().optional(),
  description: z.string().optional(),
});

// Schema for flow execution
const flowExecutionSchema = z.object({
  flowId: z.string(),
  inputs: z.record(z.any()),
});

/**
 * Safe wrapper for LangFlow requests
 */
async function safeLangFlowRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("LangFlow error:", error);
    
    if (error.message.includes("OpenAI")) {
      return [null, "OpenAI API error: " + error.message];
    } else {
      return [null, error.message || "An unexpected error occurred with the LangFlow service."];
    }
  }
}

/**
 * Handle importing a flow from LangFlow JSON format
 */
async function handleImportFlow(req: Request, res: Response) {
  try {
    const { flow, name, description } = flowImportSchema.parse(req.body);
    
    // Store the flow in our internal format
    // Note: In a real implementation, this would convert LangFlow format to our format
    // and store it in the database
    
    // This is a simplified demonstration
    const convertedFlow = {
      id: `flow-${Date.now()}`,
      name: name || "Imported Flow",
      description: description || "Imported from LangFlow",
      nodes: flow.nodes || [],
      edges: flow.edges || [],
      createdAt: new Date().toISOString(),
      metadata: {
        source: "langflow",
        originalFormat: "langflow_json",
      }
    };
    
    return res.json({
      success: true,
      flowId: convertedFlow.id,
      message: "Flow imported successfully",
      flow: convertedFlow
    });
  } catch (error: any) {
    console.error("Error importing flow:", error);
    return res.status(400).json({ error: error.message || "Invalid flow data" });
  }
}

/**
 * Handle exporting a flow to LangFlow JSON format
 */
async function handleExportFlow(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would fetch the flow from our database
    // and convert it to LangFlow format
    
    // This is a simplified demonstration
    const langflowFormat = {
      name: "Exported Flow",
      description: "Exported to LangFlow format",
      nodes: [],
      edges: [],
      metadata: {
        target: "langflow",
        exportedAt: new Date().toISOString()
      }
    };
    
    return res.json(langflowFormat);
  } catch (error: any) {
    console.error("Error exporting flow:", error);
    return res.status(400).json({ error: error.message || "Invalid flow data" });
  }
}

/**
 * Execute a simple test flow (demonstrates compatibility with LangFlow execution model)
 */
async function handleExecuteFlow(req: Request, res: Response) {
  try {
    const { flowId, inputs } = flowExecutionSchema.parse(req.body);
    
    // In a real implementation, this would fetch the flow from the database
    // and execute it with the provided inputs
    
    // For this example, we'll execute a simple hardcoded flow
    const [result, error] = await safeLangFlowRequest(async () => {
      // Create a simple chain that mimics a LangFlow execution
      const prompt = PromptTemplate.fromTemplate(
        "You are a marketing expert. Create content about {topic} for {platform}."
      );
      
      const chain = prompt.pipe(chatModel).pipe(new StringOutputParser());
      
      // Execute the chain with the provided inputs
      const output = await chain.invoke({
        topic: inputs.topic || "AI marketing",
        platform: inputs.platform || "social media"
      });
      
      return {
        output,
        flowId,
        executionId: `exec-${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };
    });
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json(result);
  } catch (error: any) {
    console.error("Error executing flow:", error);
    return res.status(400).json({ error: error.message || "Invalid flow execution request" });
  }
}

/**
 * Handle flow health check
 */
function handleHealthCheck(req: Request, res: Response) {
  try {
    // Simple configuration check without making API calls
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(200).json({
        status: "error",
        message: "LangFlow compatibility issue - Missing OpenAI API key"
      });
    }
    
    return res.status(200).json({
      status: "operational",
      message: "LangFlow compatibility layer is configured properly",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("LangFlow health check error:", error);
    return res.status(200).json({
      status: "error",
      message: "LangFlow configuration issue",
      error: error.message || "Unknown error"
    });
  }
}

/**
 * Create LangFlow router with API endpoints
 */
export function createLangFlowRouter() {
  const router = Router();
  
  // Flow import/export endpoints
  router.post("/flow/import", handleImportFlow);
  router.get("/flow/export/:id", handleExportFlow);
  
  // Flow execution endpoint
  router.post("/flow/execute", handleExecuteFlow);
  
  // Health check endpoint
  router.get("/health", handleHealthCheck);
  
  return router;
}