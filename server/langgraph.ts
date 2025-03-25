import { Router, Request, Response } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

// Import LangGraph specific components
import { StateGraph, createFlow } from "@langchain/langgraph";

// Initialize models with API key
const apiKey = process.env.OPENAI_API_KEY;

// Create model instances with appropriate settings
const chatModel = new ChatOpenAI({
  openAIApiKey: apiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.7
});

/**
 * Safe wrapper for handling LangGraph requests
 */
async function safeLangGraphRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error("LangGraph error:", error);
    
    if (error.message.includes("OpenAI")) {
      return [null, "OpenAI API error: " + error.message];
    } else {
      return [null, error.message || "An unexpected error occurred with the LangGraph service."];
    }
  }
}

// Workflow request schema
const workflowRequestSchema = z.object({
  campaignGoal: z.string(),
  targetAudience: z.string(),
  contentType: z.string(),
  platforms: z.array(z.string()),
  budget: z.number().optional(),
  timeline: z.string().optional(),
});

// State interface for workflow
type WorkflowState = {
  campaignGoal: string;
  targetAudience: string;
  contentType: string;
  platforms: string[];
  budget?: number;
  timeline?: string;
  status: string;
  strategyPlan?: string;
  contentIdeas?: string[];
  distributionPlan?: string;
  analyticsSetup?: string;
};

/**
 * Marketing Strategy Node - Creates a comprehensive marketing strategy
 */
async function generateMarketingStrategy(state: WorkflowState): Promise<WorkflowState> {
  try {
    const template = `
    Create a comprehensive marketing strategy for the following campaign:
    
    Goal: {campaignGoal}
    Target Audience: {targetAudience}
    Content Type: {contentType}
    Platforms: {platforms}
    Budget: {budget}
    Timeline: {timeline}
    
    Your strategy should include:
    1. Overall approach and key messaging
    2. Specific tactics for each platform
    3. Timeline and milestone recommendations
    4. Budget allocation if applicable
    5. Success metrics and KPIs
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const result = await chain.invoke({
      campaignGoal: state.campaignGoal,
      targetAudience: state.targetAudience,
      contentType: state.contentType,
      platforms: state.platforms.join(", "),
      budget: state.budget?.toString() || "Not specified",
      timeline: state.timeline || "Not specified"
    });
    
    return {
      ...state,
      status: "strategy_completed",
      strategyPlan: result
    };
  } catch (error) {
    console.error("Error generating marketing strategy:", error);
    return {
      ...state,
      status: "strategy_failed"
    };
  }
}

/**
 * Content Planning Node - Generates content ideas based on strategy
 */
async function generateContentIdeas(state: WorkflowState): Promise<WorkflowState> {
  try {
    // Skip if strategy failed
    if (state.status === "strategy_failed") {
      return {
        ...state,
        status: "content_skipped"
      };
    }
    
    const template = `
    Based on the following marketing strategy, generate 5 specific content ideas:
    
    Strategy: {strategy}
    Target Audience: {targetAudience}
    Content Type: {contentType}
    Platforms: {platforms}
    
    For each content idea, provide:
    1. A catchy title
    2. Brief description (2-3 sentences)
    3. Target platform
    4. Call to action
    
    Format as a JSON array of objects with title, description, platform, and cta properties.
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const result = await chain.invoke({
      strategy: state.strategyPlan,
      targetAudience: state.targetAudience,
      contentType: state.contentType,
      platforms: state.platforms.join(", ")
    });
    
    // Parse JSON response from LLM
    let contentIdeas: string[] = [];
    try {
      const jsonResponse = JSON.parse(result);
      contentIdeas = Array.isArray(jsonResponse) ? jsonResponse : [result];
    } catch (e) {
      // If LLM doesn't return valid JSON, just use the text
      contentIdeas = [result];
    }
    
    return {
      ...state,
      status: "content_completed",
      contentIdeas
    };
  } catch (error) {
    console.error("Error generating content ideas:", error);
    return {
      ...state,
      status: "content_failed"
    };
  }
}

/**
 * Distribution Planning Node - Creates a distribution plan based on platforms
 */
async function createDistributionPlan(state: WorkflowState): Promise<WorkflowState> {
  try {
    // Skip if previous steps failed
    if (state.status === "strategy_failed" || state.status === "content_failed") {
      return {
        ...state,
        status: "distribution_skipped"
      };
    }
    
    const template = `
    Create a distribution plan for the following campaign:
    
    Strategy: {strategy}
    Content Ideas: {contentIdeas}
    Platforms: {platforms}
    Timeline: {timeline}
    
    For each platform, provide:
    1. Posting schedule and frequency
    2. Best times to post
    3. Content adaptation recommendations
    4. Audience targeting suggestions
    5. Paid promotion recommendations if applicable
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const result = await chain.invoke({
      strategy: state.strategyPlan,
      contentIdeas: JSON.stringify(state.contentIdeas),
      platforms: state.platforms.join(", "),
      timeline: state.timeline || "Not specified"
    });
    
    return {
      ...state,
      status: "distribution_completed",
      distributionPlan: result
    };
  } catch (error) {
    console.error("Error creating distribution plan:", error);
    return {
      ...state,
      status: "distribution_failed"
    };
  }
}

/**
 * Analytics Setup Node - Recommends analytics and tracking
 */
async function setupAnalytics(state: WorkflowState): Promise<WorkflowState> {
  try {
    // Skip if previous steps failed
    if (state.status === "strategy_failed" || 
        state.status === "content_failed" || 
        state.status === "distribution_failed") {
      return {
        ...state,
        status: "analytics_skipped"
      };
    }
    
    const template = `
    Create an analytics and tracking plan for the following marketing campaign:
    
    Strategy: {strategy}
    Distribution Plan: {distributionPlan}
    Platforms: {platforms}
    
    Your analytics plan should include:
    1. Key metrics to track for each platform
    2. Recommended tracking tools and setup
    3. Reporting schedule
    4. Success criteria and benchmarks
    5. A/B testing recommendations if applicable
    `;
    
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const outputParser = new StringOutputParser();
    
    const chain = promptTemplate.pipe(chatModel).pipe(outputParser);
    
    const result = await chain.invoke({
      strategy: state.strategyPlan,
      distributionPlan: state.distributionPlan,
      platforms: state.platforms.join(", ")
    });
    
    return {
      ...state,
      status: "completed",
      analyticsSetup: result
    };
  } catch (error) {
    console.error("Error setting up analytics:", error);
    return {
      ...state,
      status: "analytics_failed",
      analyticsSetup: "Failed to generate analytics recommendations"
    };
  }
}

/**
 * Defines the workflow graph for a marketing campaign
 */
function defineMarketingWorkflow() {
  // Create a new state graph
  const workflow = new StateGraph<WorkflowState>({
    channels: {
      status: {},
    },
  });
  
  // Add nodes for each step in the workflow
  workflow.addNode("strategy", async (state) => generateMarketingStrategy(state));
  workflow.addNode("content", async (state) => generateContentIdeas(state));
  workflow.addNode("distribution", async (state) => createDistributionPlan(state));
  workflow.addNode("analytics", async (state) => setupAnalytics(state));

  // Define edges between nodes based on state.status
  workflow.addEdge({
    from: "strategy",
    to: "content",
    condition: (state) => state.status === "strategy_completed",
  });
  
  workflow.addEdge({
    from: "content",
    to: "distribution",
    condition: (state) => state.status === "content_completed",
  });
  
  workflow.addEdge({
    from: "distribution",
    to: "analytics",
    condition: (state) => state.status === "distribution_completed",
  });
  
  // Set the entry point
  workflow.setEntryPoint("strategy");
  
  // Compile the workflow
  return workflow.compile();
}

/**
 * Route handler for creating a marketing workflow with LangGraph
 */
async function handleCreateMarketingWorkflow(req: Request, res: Response) {
  try {
    const {
      campaignGoal,
      targetAudience,
      contentType,
      platforms,
      budget,
      timeline
    } = workflowRequestSchema.parse(req.body);
    
    // Initialize workflow state
    const initialState: WorkflowState = {
      campaignGoal,
      targetAudience,
      contentType,
      platforms,
      budget,
      timeline,
      status: "initialized"
    };
    
    // Create the workflow graph
    const marketingWorkflow = defineMarketingWorkflow();
    
    // Execute the workflow
    const [result, error] = await safeLangGraphRequest(async () => {
      const workflowExecutor = marketingWorkflow.stream();
      let finalState: WorkflowState = initialState;
      
      for await (const output of workflowExecutor.invoke(initialState)) {
        if (output.finalState) {
          finalState = output.finalState;
        }
      }
      
      return finalState;
    });
    
    if (error) {
      return res.status(500).json({ error });
    }
    
    return res.json({
      success: true,
      workflow: result
    });
  } catch (error: any) {
    console.error("Error creating marketing workflow:", error);
    return res.status(400).json({ 
      error: error.message || "An error occurred during workflow creation" 
    });
  }
}

/**
 * Route handler for the health check endpoint
 */
async function handleHealthCheck(req: Request, res: Response) {
  const [result, error] = await safeLangGraphRequest(async () => {
    // Create a simple test workflow
    const testWorkflow = new StateGraph({
      channels: { result: {} },
    });
    
    testWorkflow.addNode("test", async () => ({ result: "healthy" }));
    testWorkflow.setEntryPoint("test");
    
    const compiledWorkflow = testWorkflow.compile();
    const workflowExecutor = compiledWorkflow.invoke({});
    
    return { status: "healthy" };
  });
  
  if (error) {
    return res.status(500).json({ 
      status: "error", 
      message: "LangGraph connectivity issue", 
      error 
    });
  }
  
  return res.json({ 
    status: "operational", 
    message: "LangGraph is connected and working properly" 
  });
}

/**
 * Create the LangGraph router
 */
export function createLangGraphRouter() {
  const router = Router();
  
  // Workflow creation endpoint
  router.post("/workflow/marketing", handleCreateMarketingWorkflow);
  
  // Health check endpoint
  router.get("/health", handleHealthCheck);
  
  return router;
}