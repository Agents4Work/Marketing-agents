import { apiRequest } from './queryClient';

/**
 * Interface for Marketing Workflow input parameters
 */
export interface MarketingWorkflowParams {
  campaignGoal: string;
  targetAudience: string;
  contentType: string;
  platforms: string[];
  budget?: number;
  timeline?: string;
}

/**
 * Interface for Marketing Workflow state/result
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
 * Generate a complete marketing campaign workflow using our custom workflow engine
 * This creates a comprehensive multi-step AI workflow for marketing planning
 */
export async function createMarketingWorkflow(params: MarketingWorkflowParams) {
  try {
    const response = await apiRequest('/api/workflows/ai/create-marketing-workflow', 'POST', params);
    
    if (!response.success) {
      throw new Error(response.error || 'Unknown workflow error');
    }
    
    return response.result as MarketingWorkflowState;
  } catch (error: any) {
    console.error('Error creating marketing workflow:', error);
    throw new Error(`Failed to generate marketing workflow: ${error.message || 'Please try again.'}`);
  }
}

/**
 * Check workflow health status
 * Verifies connectivity with the workflow service and OpenAI
 */
export async function checkWorkflowHealth() {
  try {
    const response = await apiRequest('/api/workflows/ai/health', 'GET');
    
    return {
      status: response.status || 'unknown',
      openai: response.openai || 'unknown',
      workflow: response.workflow || 'unknown',
      message: 'Workflow system health check'
    };
  } catch (error: any) {
    console.error('Error checking workflow health:', error);
    return {
      status: 'error',
      openai: 'unknown',
      workflow: 'unavailable',
      message: error.message || 'Workflow service is not available'
    };
  }
}