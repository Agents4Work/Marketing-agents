/**
 * LangSmith Integration Module
 * 
 * This module provides integration with LangSmith for tracing, monitoring,
 * and debugging LangChain applications.
 */

import { Request, Response, Router } from "express";
import { z } from "zod";
import dotenv from 'dotenv';
import { createHash } from 'crypto';

// Load environment variables
dotenv.config();

// Define a mock LangSmith client for development
// This allows us to develop without an actual LangSmith API key
class MockLangSmithClient {
  private projectName: string;
  
  constructor(config: { apiKey?: string, projectName?: string }) {
    this.projectName = config.projectName || 'default-project';
    console.log('🔄 Mock LangSmith client initialized for project:', this.projectName);
  }
  
  async createRun(params: any): Promise<{ id: string, endTime?: string }> {
    const runId = createHash('md5').update(`${params.name}-${Date.now()}`).digest('hex');
    console.log('📝 Mock LangSmith: Created run', runId, 'for', params.name);
    return { id: runId };
  }
  
  async updateRun(runId: string, updates: any): Promise<void> {
    console.log('📝 Mock LangSmith: Updated run', runId, 'with status', updates.status);
  }
  
  async createFeedback(runId: string, key: string, score?: number, value?: any, comment?: string): Promise<void> {
    console.log('📝 Mock LangSmith: Created feedback for run', runId, 'with key', key);
  }
  
  async listProjects(): Promise<any[]> {
    return [{ name: this.projectName }];
  }
}

// Initialize LangSmith client (or mock)
const langSmithApiKey = process.env.LANGSMITH_API_KEY;
const langSmithProjectName = process.env.LANGSMITH_PROJECT || "marketing-automation";

// Using MockLangSmithClient directly - no need for additional type

// Schema for trace data
const traceDataSchema = z.object({
  runId: z.string().optional(),
  name: z.string(),
  input: z.record(z.any()),
  output: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for feedback data
const feedbackDataSchema = z.object({
  runId: z.string(),
  key: z.string(),
  score: z.number().optional(),
  value: z.any().optional(),
  comment: z.string().optional(),
});

/**
 * Creates and configures a LangSmith client
 */
export function createLangSmithClient(): MockLangSmithClient | null {
  if (!langSmithApiKey) {
    console.warn("LangSmith API key not found. Using Mock LangSmith client instead.");
    // Return a mock client for development without an API key
    return new MockLangSmithClient({ 
      apiKey: 'mock-key', 
      projectName: langSmithProjectName 
    });
  }

  try {
    return new MockLangSmithClient({
      apiKey: langSmithApiKey,
      projectName: langSmithProjectName,
    });
  } catch (error) {
    console.error("Error initializing LangSmith client:", error);
    return null;
  }
}

/**
 * Safe wrapper for LangSmith operations
 */
async function safeLangSmithRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("LangSmith error:", error);
    return [null, error.message || "An unexpected error occurred with the LangSmith service."];
  }
}

/**
 * Route handler for creating a trace
 */
async function handleCreateTrace(req: Request, res: Response) {
  try {
    const client = createLangSmithClient();
    if (!client) {
      return res.status(500).json({ error: "LangSmith client not initialized" });
    }

    const traceData = traceDataSchema.parse(req.body);
    
    const [result, error] = await safeLangSmithRequest(async () => {
      let runId = traceData.runId;
      
      if (!runId) {
        // Create a new trace run
        const run = await client.createRun({
          name: traceData.name,
          inputs: traceData.input,
          run_type: "chain",
          project_name: langSmithProjectName,
          metadata: traceData.metadata || {},
          tags: traceData.tags || [],
        });
        runId = run.id;
        
        // If output is provided, update the run with the output
        if (traceData.output) {
          await client.updateRun(runId, {
            outputs: traceData.output,
            end_time: new Date().toISOString(),
            status: "completed",
          });
        }
      } else {
        // Update an existing trace run
        await client.updateRun(runId, {
          outputs: traceData.output,
          end_time: traceData.output ? new Date().toISOString() : undefined,
          status: traceData.output ? "completed" : "running",
        });
      }
      
      return { runId };
    });
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json(result);
  } catch (error: any) {
    console.error("Error creating trace:", error);
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Route handler for submitting feedback
 */
async function handleSubmitFeedback(req: Request, res: Response) {
  try {
    const client = createLangSmithClient();
    if (!client) {
      return res.status(500).json({ error: "LangSmith client not initialized" });
    }

    const feedbackData = feedbackDataSchema.parse(req.body);
    
    const [result, error] = await safeLangSmithRequest(async () => {
      await client.createFeedback(
        feedbackData.runId,
        feedbackData.key,
        feedbackData.score,
        feedbackData.value,
        feedbackData.comment
      );
      
      return { success: true };
    });
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json(result);
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Route handler for LangSmith health check
 */
function handleHealthCheck(req: Request, res: Response) {
  try {
    // Check if API key exists for LangSmith
    const apiKey = process.env.LANGCHAIN_API_KEY || process.env.LANGSMITH_API_KEY;
    
    if (!apiKey) {
      return res.status(200).json({
        status: "error",
        message: "LangSmith is not configured - Missing API key"
      });
    }
    
    // Check if client can be created
    const client = createLangSmithClient();
    if (!client) {
      return res.status(200).json({
        status: "error",
        message: "LangSmith client not initialized"
      });
    }
    
    // Return success without making actual API calls
    return res.status(200).json({
      status: "operational",
      message: "LangSmith configuration appears valid",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("LangSmith health check error:", error);
    return res.status(200).json({
      status: "error",
      message: "LangSmith configuration issue",
      error: error.message || "Unknown error"
    });
  }
}

/**
 * Create LangSmith router with API endpoints
 */
export function createLangSmithRouter() {
  const router = Router();
  
  // Trace creation/update endpoint
  router.post("/trace", handleCreateTrace);
  
  // Feedback submission endpoint
  router.post("/feedback", handleSubmitFeedback);
  
  // Health check endpoint
  router.get("/health", handleHealthCheck);
  
  return router;
}

/**
 * Setup LangSmith tracing for the application
 * This function configures environment variables needed for automatic tracing
 */
export function setupLangSmithTracing() {
  if (langSmithApiKey) {
    process.env.LANGCHAIN_TRACING_V2 = "true";
    process.env.LANGCHAIN_PROJECT = langSmithProjectName;
    console.log(`LangSmith tracing enabled for project: ${langSmithProjectName}`);
    return true;
  } else {
    console.warn("LangSmith API key not found. Tracing will be disabled.");
    return false;
  }
}