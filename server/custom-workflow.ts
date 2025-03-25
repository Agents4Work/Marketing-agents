/**
 * Custom Workflow Engine to replace LangGraph
 * This implementation provides a simple directed graph workflow system
 * that works with our existing LangChain installation while avoiding
 * the dependency issues with LangGraph
 */

import { Request, Response, Router } from "express";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simple workflow implementation that avoids LangGraph dependencies
 */
export class CustomWorkflow<T> {
  private nodes: Map<string, (state: T) => Promise<T>> = new Map();
  private transitions: Map<string, Array<{ target: string, condition: (state: T) => boolean }>> = new Map();
  
  constructor() {
    // Initialize with start and end nodes
    this.nodes.set("__start__", async (state: T) => state);
    this.nodes.set("__end__", async (state: T) => state);
    this.transitions.set("__start__", []);
    this.transitions.set("__end__", []);
  }
  
  addNode(name: string, handler: (state: T) => Promise<T>): CustomWorkflow<T> {
    this.nodes.set(name, handler);
    this.transitions.set(name, []);
    return this;
  }
  
  addTransition(from: string, to: string, condition?: (state: T) => boolean): CustomWorkflow<T> {
    const transitions = this.transitions.get(from) || [];
    transitions.push({
      target: to,
      condition: condition || (() => true)
    });
    this.transitions.set(from, transitions);
    return this;
  }
  
  async execute(initialState: T): Promise<T> {
    let currentState = initialState;
    let currentNode = "__start__";
    
    console.log(`Starting workflow execution at node: ${currentNode}`);
    
    while (currentNode !== "__end__") {
      // Execute the current node
      const nodeHandler = this.nodes.get(currentNode);
      if (!nodeHandler) {
        throw new Error(`Node "${currentNode}" not found in workflow`);
      }
      
      try {
        // Update state by executing the current node
        currentState = await nodeHandler(currentState);
        console.log(`Executed node: ${currentNode}`);
      } catch (error) {
        console.error(`Error executing node ${currentNode}:`, error);
        throw error;
      }
      
      // Find the next node based on transitions
      const transitions = this.transitions.get(currentNode) || [];
      let nextNode: string | null = null;
      
      for (const transition of transitions) {
        if (transition.condition(currentState)) {
          nextNode = transition.target;
          console.log(`Following transition to: ${nextNode}`);
          break;
        }
      }
      
      if (nextNode === null) {
        throw new Error(`No valid transition from node "${currentNode}"`);
      }
      
      currentNode = nextNode;
    }
    
    return currentState;
  }
}

/**
 * Safe wrapper for handling workflow requests
 */
export async function safeWorkflowRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error('Workflow request error:', error);
    
    if (error.message && error.message.includes("OpenAI")) {
      return [null, "OpenAI API error: " + error.message];
    }
    
    const errorMessage = error.message || 'Unknown workflow error';
    return [null, errorMessage];
  }
}

/**
 * Marketing workflow state interface
 */
export interface MarketingWorkflowState {
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
}

/**
 * Marketing Strategy Node - Creates a comprehensive marketing strategy
 */
export async function generateMarketingStrategy(state: MarketingWorkflowState): Promise<MarketingWorkflowState> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set");
  }

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: apiKey
  });

  const strategyTemplate = `
  Create a comprehensive marketing strategy based on the following:
  
  Campaign Goal: {campaignGoal}
  Target Audience: {targetAudience}
  Content Type: {contentType}
  Platforms: {platforms}
  Budget: {budget}
  Timeline: {timeline}
  
  Provide a detailed strategy plan that aligns with these parameters and will help achieve the campaign goal.
  Include:
  1. Overall approach and key messaging
  2. Specific tactics for each platform
  3. Timeline and milestone recommendations
  4. Budget allocation if applicable
  5. Success metrics and KPIs
  `;

  const prompt = PromptTemplate.fromTemplate(strategyTemplate);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    campaignGoal: state.campaignGoal,
    targetAudience: state.targetAudience,
    contentType: state.contentType,
    platforms: state.platforms.join(", "),
    budget: state.budget || "Unspecified",
    timeline: state.timeline || "Unspecified"
  });

  return {
    ...state,
    strategyPlan: result,
    status: "strategy_created"
  };
}

/**
 * Content Planning Node - Generates content ideas based on strategy
 */
export async function generateContentIdeas(state: MarketingWorkflowState): Promise<MarketingWorkflowState> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set");
  }

  // Skip if strategy failed
  if (state.status !== "strategy_created") {
    return {
      ...state,
      status: "content_skipped"
    };
  }

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.8,
    openAIApiKey: apiKey
  });

  const contentTemplate = `
  Based on the following marketing strategy and parameters, generate 5 compelling content ideas:
  
  Campaign Goal: {campaignGoal}
  Target Audience: {targetAudience}
  Content Type: {contentType}
  Strategy Plan: {strategyPlan}
  
  For each content idea, provide:
  1. A catchy title
  2. Brief description (2-3 sentences)
  3. Target platform
  4. Call to action
  
  Format as a numbered list with clear separation between ideas.
  `;

  const prompt = PromptTemplate.fromTemplate(contentTemplate);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const resultText = await chain.invoke({
    campaignGoal: state.campaignGoal,
    targetAudience: state.targetAudience,
    contentType: state.contentType,
    strategyPlan: state.strategyPlan
  });

  // Parse the text into an array of content ideas
  const contentIdeas = resultText.split(/\d+\./)
    .filter(item => item.trim().length > 0)
    .map(item => item.trim());

  return {
    ...state,
    contentIdeas,
    status: "content_planned"
  };
}

/**
 * Distribution Planning Node - Creates a distribution plan based on platforms
 */
export async function createDistributionPlan(state: MarketingWorkflowState): Promise<MarketingWorkflowState> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set");
  }

  // Skip if previous steps failed
  if (state.status !== "content_planned") {
    return {
      ...state,
      status: "distribution_skipped"
    };
  }

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: apiKey
  });

  const distributionTemplate = `
  Create a content distribution plan for the following campaign:
  
  Campaign Goal: {campaignGoal}
  Target Audience: {targetAudience}
  Content Ideas: {contentIdeas}
  Platforms: {platforms}
  Timeline: {timeline}
  
  For each platform, provide specific recommendations on:
  1. Best times to post
  2. Content format adjustments for the platform
  3. Engagement strategies
  4. Frequency of posting
  5. Paid promotion recommendations if applicable
  `;

  const prompt = PromptTemplate.fromTemplate(distributionTemplate);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    campaignGoal: state.campaignGoal,
    targetAudience: state.targetAudience,
    contentIdeas: state.contentIdeas?.join("\n\n") || "No content ideas available",
    platforms: state.platforms.join(", "),
    timeline: state.timeline || "Unspecified"
  });

  return {
    ...state,
    distributionPlan: result,
    status: "distribution_planned"
  };
}

/**
 * Analytics Setup Node - Recommends analytics and tracking
 */
export async function setupAnalytics(state: MarketingWorkflowState): Promise<MarketingWorkflowState> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set");
  }

  // Skip if previous steps failed
  if (state.status !== "distribution_planned") {
    return {
      ...state,
      status: "analytics_skipped"
    };
  }

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: apiKey
  });

  const analyticsTemplate = `
  Create an analytics and tracking plan for the following marketing campaign:
  
  Campaign Goal: {campaignGoal}
  Target Audience: {targetAudience}
  Content Type: {contentType}
  Platforms: {platforms}
  
  Your analytics plan should include:
  1. Key metrics to track for each platform
  2. Recommended tracking tools and setup
  3. Reporting schedule
  4. Success criteria and benchmarks
  5. A/B testing recommendations if applicable
  `;

  const prompt = PromptTemplate.fromTemplate(analyticsTemplate);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    campaignGoal: state.campaignGoal,
    targetAudience: state.targetAudience,
    contentType: state.contentType,
    platforms: state.platforms.join(", ")
  });

  return {
    ...state,
    analyticsSetup: result,
    status: "completed"
  };
}

/**
 * Creates a marketing workflow
 */
export function createMarketingWorkflow() {
  // Create the workflow
  const workflow = new CustomWorkflow<MarketingWorkflowState>();
  
  // Add nodes
  workflow.addNode("strategy", generateMarketingStrategy);
  workflow.addNode("content", generateContentIdeas);
  workflow.addNode("distribution", createDistributionPlan);
  workflow.addNode("analytics", setupAnalytics);
  
  // Add transitions
  workflow.addTransition("__start__", "strategy");
  workflow.addTransition("strategy", "content", state => state.status === "strategy_created");
  workflow.addTransition("content", "distribution", state => state.status === "content_planned");
  workflow.addTransition("distribution", "analytics", state => state.status === "distribution_planned");
  workflow.addTransition("analytics", "__end__", state => state.status === "completed");
  
  // Add error handling transitions
  workflow.addTransition("strategy", "__end__", state => state.status !== "strategy_created");
  workflow.addTransition("content", "__end__", state => state.status !== "content_planned" && state.status !== "strategy_created");
  workflow.addTransition("distribution", "__end__", state => state.status !== "distribution_planned" && state.status !== "content_planned");
  
  return workflow;
}

/**
 * Route handler for creating a marketing workflow
 */
export async function handleCreateMarketingWorkflow(req: Request, res: Response) {
  const [data, error] = await safeWorkflowRequest(async () => {
    // Extract request parameters
    const { 
      campaignGoal, 
      targetAudience, 
      contentType, 
      platforms, 
      budget, 
      timeline 
    } = req.body;

    // Input validation
    if (!campaignGoal || !targetAudience || !contentType || !platforms) {
      throw new Error('Missing required fields: campaignGoal, targetAudience, contentType, or platforms');
    }

    // Create initial state
    const initialState: MarketingWorkflowState = {
      campaignGoal,
      targetAudience,
      contentType,
      platforms: Array.isArray(platforms) ? platforms : [platforms],
      budget,
      timeline,
      status: "initialized"
    };

    // Create and execute workflow
    const workflow = createMarketingWorkflow();
    const finalState = await workflow.execute(initialState);
    
    return finalState;
  });

  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ 
      success: true,
      result: data 
    });
  }
}

/**
 * Route handler for the health check endpoint
 */
export function handleHealthCheck(req: Request, res: Response) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  try {
    // Simple configuration check without making API calls
    if (!apiKey) {
      return res.status(200).json({ 
        status: 'error', 
        openai: 'disconnected',
        workflow: 'available',
        message: 'OpenAI API key is not set'
      });
    }
    
    return res.status(200).json({ 
      status: 'ok', 
      openai: 'connected',
      workflow: 'available',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Custom workflow health check error:", error);
    return res.status(200).json({ 
      status: 'error', 
      openai: 'error',
      workflow: 'available',
      message: error.message || 'Unknown error'
    });
  }
}

/**
 * Create the workflow router
 */
export function createCustomWorkflowRouter() {
  const router = Router();

  // Marketing workflow endpoints
  router.post('/create-marketing-workflow', handleCreateMarketingWorkflow);
  
  // Health check endpoint
  router.get('/health', handleHealthCheck);

  return router;
}