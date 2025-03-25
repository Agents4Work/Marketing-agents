/**
 * LangChain Ecosystem Integration SDK for the frontend
 * 
 * This module provides client-side utilities for interacting with 
 * LangChain, LangSmith, LangGraph, and LangFlow services
 */

import { apiRequest } from '@/lib/queryClient';

// Types for LangChain integrations
export interface ContentGenerationParams {
  topic: string;
  audience: string;
  tone: string;
  purpose: string;
  length: string;
}

export interface CampaignAnalysisParams {
  campaignData: Record<string, any>;
  goals: string[];
}

// Types for LangSmith integrations
export interface TraceData {
  runId?: string;
  name: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface FeedbackData {
  runId: string;
  key: string;
  score?: number;
  value?: any;
  comment?: string;
}

// Types for LangFlow integrations
export interface FlowData {
  flow: Record<string, any>;
  name?: string;
  description?: string;
}

export interface FlowExecutionParams {
  flowId: string;
  inputs: Record<string, any>;
}

// Types for workflow integrations
export interface MarketingWorkflowParams {
  campaignGoal: string;
  targetAudience: string;
  contentType: string;
  platforms: string[];
  budget?: number;
  timeline?: string;
}

export interface WorkflowResult {
  success: boolean;
  workflow: {
    campaignGoal: string;
    targetAudience: string;
    contentType: string;
    platforms: string[];
    status: string;
    strategyPlan?: string;
    contentIdeas?: string[];
    distributionPlan?: string;
    analyticsSetup?: string;
  };
}

// Types for LegoWorkflow with Vertex AI
export interface LegoWorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    id?: string;
    label: string;
    type?: string;
    description?: string;
    agentType?: string;
    color?: string;
    nodeType?: {
      type: string;
      agentType?: string;
    };
    category?: string;
    [key: string]: any;
  };
}

export interface LegoWorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: {
    type?: string;
    label?: string;
  };
}

export interface LegoWorkflowExecutionParams {
  workflow: string;
  nodes: LegoWorkflowNode[];
  edges: LegoWorkflowEdge[];
  initialState: {
    campaign?: string;
    objective?: string;
    audience?: string;
    [key: string]: any;
  };
  model?: string;
}

export interface LegoWorkflowExecutionResult {
  success: boolean;
  executionId: string;
  workflow: string;
  state: {
    status: string;
    executionComplete: boolean;
    executionTime: number;
    nodesProcessed: number;
    timestamp: string;
    [key: string]: any;
  };
  nodeResults: Record<string, any>;
  errors?: Array<{
    nodeId: string;
    error: string;
    timestamp: string;
  }>;
  executionTime: number;
  startTime: string;
  endTime: string;
}

/**
 * LangChain Content Generation API
 */
export async function generateContent(params: ContentGenerationParams): Promise<{ content: string }> {
  const result = await apiRequest('/api/langchain/generate-content', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  return result;
}

/**
 * LangChain Campaign Analysis API
 */
export async function analyzeCampaign(params: CampaignAnalysisParams): Promise<{ analysis: string; timestamp: string }> {
  const result = await apiRequest('/api/langchain/analyze-campaign', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  return result;
}

/**
 * LangSmith Trace API
 */
export async function createTrace(traceData: TraceData): Promise<{ runId: string }> {
  const result = await apiRequest('/api/langsmith/trace', {
    method: 'POST',
    body: JSON.stringify(traceData)
  });
  return result;
}

/**
 * LangSmith Feedback API
 */
export async function submitFeedback(feedbackData: FeedbackData): Promise<{ success: boolean }> {
  const result = await apiRequest('/api/langsmith/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
  return result;
}

/**
 * LangFlow Import API
 */
export async function importFlow(flowData: FlowData): Promise<{ flowId: string; flow: Record<string, any> }> {
  const result = await apiRequest('/api/langflow/flow/import', {
    method: 'POST',
    body: JSON.stringify(flowData)
  });
  return result;
}

/**
 * LangFlow Export API
 */
export async function exportFlow(flowId: string): Promise<Record<string, any>> {
  const result = await apiRequest(`/api/langflow/flow/export/${flowId}`);
  return result;
}

/**
 * LangFlow Execute API
 */
export async function executeFlow(params: FlowExecutionParams): Promise<{ output: string; executionId: string }> {
  const result = await apiRequest('/api/langflow/flow/execute', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  return result;
}

/**
 * Marketing Workflow Creation API
 */
export async function createMarketingWorkflow(params: MarketingWorkflowParams): Promise<WorkflowResult> {
  const result = await apiRequest('/api/workflows/ai/create-marketing-workflow', {
    method: 'POST',
    body: JSON.stringify(params)
  });
  return result;
}

/**
 * Execute a Lego-style workflow graph using Vertex AI
 */
export async function executeLegoWorkflow(params: LegoWorkflowExecutionParams): Promise<LegoWorkflowExecutionResult> {
  try {
    console.log("Executing Lego workflow with Vertex AI:", params.workflow);
    
    const result = await apiRequest('/api/vertexai/workflow/execute', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    
    return result;
  } catch (error) {
    console.error("Error executing Lego workflow:", error);
    throw error;
  }
}

/**
 * Get available Vertex AI models
 */
export async function getAvailableAIModels(): Promise<{
  success: boolean;
  models: Array<{
    id: string;
    name: string;
    capabilities: string[];
    maxTokens: number;
    description: string;
  }>;
}> {
  try {
    const result = await apiRequest('/api/vertexai/models');
    return result;
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return {
      success: false,
      models: []
    };
  }
}

/**
 * Health Check APIs for all LangChain ecosystem services
 */
export interface ServiceHealthResult {
  status: string;
  message: string;
  details?: any;
  timestamp?: string;
}

export async function checkLangChainHealth(): Promise<ServiceHealthResult> {
  try {
    const result = await apiRequest('/api/langchain/health');
    return result;
  } catch (error) {
    console.error('Error checking LangChain health:', error);
    // Create properly typed error response
    const errorResponse: ServiceHealthResult = {
      status: 'error', 
      message: 'LangChain service unavailable',
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

export async function checkLangSmithHealth(): Promise<ServiceHealthResult> {
  try {
    const result = await apiRequest('/api/langsmith/health');
    return result;
  } catch (error) {
    console.error('Error checking LangSmith health:', error);
    // Create properly typed error response
    const errorResponse: ServiceHealthResult = {
      status: 'error', 
      message: 'LangSmith service unavailable',
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

export async function checkLangFlowHealth(): Promise<ServiceHealthResult> {
  try {
    const result = await apiRequest('/api/langflow/health');
    return result;
  } catch (error) {
    console.error('Error checking LangFlow health:', error);
    // Create properly typed error response
    const errorResponse: ServiceHealthResult = {
      status: 'error', 
      message: 'LangFlow service unavailable',
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

export interface WorkflowHealthResult {
  status: string;
  openai: string;
  workflow: string;
  message?: string;
  timestamp?: string;
}

export async function checkWorkflowHealth(): Promise<WorkflowHealthResult> {
  try {
    const result = await apiRequest('/api/workflows/ai/health');
    return result;
  } catch (error) {
    console.error('Error checking Workflow health:', error);
    // Create properly typed error response
    const errorResponse: WorkflowHealthResult = {
      status: 'error', 
      openai: 'disconnected', 
      workflow: 'disconnected',
      message: 'Workflow service unavailable',
      timestamp: new Date().toISOString()
    };
    return errorResponse;
  }
}

/**
 * Check API configuration status
 */
export async function checkApiConfiguration(): Promise<{ 
  apiKeys: { 
    OPENAI_API_KEY: boolean;
    LANGSMITH_API_KEY: boolean;
    LANGSMITH_PROJECT: string; 
  };
  services: {
    openai: string;
    langchain: string;
    langsmith: string;
    langflow: boolean | string;
    workflow: string;
  };
}> {
  try {
    const result = await apiRequest('/api/config/status');
    return result;
  } catch (error) {
    console.error('Error checking API configuration:', error);
    return {
      apiKeys: {
        OPENAI_API_KEY: false,
        LANGSMITH_API_KEY: false,
        LANGSMITH_PROJECT: '',
      },
      services: {
        openai: 'disconnected',
        langchain: 'disconnected',
        langsmith: 'disconnected',
        langflow: false,
        workflow: 'disconnected',
      }
    };
  }
}

export interface AllServicesHealthResult {
  openai: string;
  langchain: ServiceHealthResult;
  langsmith: ServiceHealthResult;
  langflow: ServiceHealthResult;
  workflow: WorkflowHealthResult;
  error?: string;
}

/**
 * Comprehensive health check for the entire LangChain ecosystem
 */
export async function checkAllLangChainServices(): Promise<AllServicesHealthResult> {
  try {
    // Get API configuration status first
    const configStatus = await checkApiConfiguration();
    
    // Only check other services if OpenAI is configured
    let langchainResult: ServiceHealthResult = { status: 'error', message: 'Not configured' };
    let langsmithResult: ServiceHealthResult = { status: 'error', message: 'Not configured' };
    let langflowResult: ServiceHealthResult = { status: 'error', message: 'Not configured' };
    let workflowResult: WorkflowHealthResult = { 
      status: 'error', 
      openai: 'disconnected', 
      workflow: 'disconnected',
      message: 'Not configured' 
    };
    
    if (configStatus.apiKeys.OPENAI_API_KEY) {
      // Check other services in parallel
      const results = await Promise.all([
        checkLangChainHealth().catch(err => ({ 
          status: 'error', 
          message: err instanceof Error ? err.message : String(err) 
        } as ServiceHealthResult)),
        
        checkLangSmithHealth().catch(err => ({ 
          status: 'error', 
          message: err instanceof Error ? err.message : String(err) 
        } as ServiceHealthResult)),
        
        checkLangFlowHealth().catch(err => ({ 
          status: 'error', 
          message: err instanceof Error ? err.message : String(err) 
        } as ServiceHealthResult)),
        
        checkWorkflowHealth().catch(err => ({ 
          status: 'error', 
          openai: 'disconnected', 
          workflow: 'disconnected',
          message: err instanceof Error ? err.message : String(err)
        } as WorkflowHealthResult))
      ]);
      
      langchainResult = results[0];
      langsmithResult = results[1];
      langflowResult = results[2];
      workflowResult = results[3];
    }

    return {
      openai: configStatus.services.openai,
      langchain: langchainResult,
      langsmith: langsmithResult,
      langflow: langflowResult,
      workflow: workflowResult
    };
  } catch (error) {
    console.error('Error checking all services:', error);
    return {
      error: 'Failed to check services',
      openai: 'disconnected',
      langchain: { status: 'error', message: 'Check failed' },
      langsmith: { status: 'error', message: 'Check failed' },
      langflow: { status: 'error', message: 'Check failed' },
      workflow: {
        status: 'error',
        openai: 'disconnected',
        workflow: 'disconnected',
        message: 'Check failed'
      }
    };
  }
}