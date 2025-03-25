import { apiRequest } from './queryClient';

/**
 * Generate advanced AI content using LangChain
 * This uses more sophisticated content generation with better context handling
 */
export async function generateAIContent({ 
  topic, 
  audience, 
  tone, 
  purpose, 
  length 
}: { 
  topic: string; 
  audience: string; 
  tone: string; 
  purpose: string;
  length: string;
}) {
  try {
    const data = {
      topic,
      audience,
      tone,
      purpose,
      length
    };
    
    const response = await apiRequest<{ content: string }>('/api/langchain/generate-content', 'POST', data);
    
    return response.content;
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}

/**
 * Analyze a marketing campaign using LangChain
 * Provides sophisticated analysis with specialized marketing insights
 */
export async function analyzeCampaign({ 
  campaignData, 
  goals 
}: { 
  campaignData: Record<string, any>; 
  goals: string[];
}) {
  try {
    const data = {
      campaignData,
      goals
    };
    
    const response = await apiRequest<{ analysis: string; timestamp: string }>('/api/langchain/analyze-campaign', 'POST', data);
    
    return response;
  } catch (error) {
    console.error('Error analyzing campaign:', error);
    throw new Error('Failed to analyze campaign. Please try again.');
  }
}

/**
 * Check LangChain health status
 * Verifies connectivity with the LangChain service
 */
export async function checkLangChainHealth() {
  try {
    const response = await apiRequest<{ status: string; message: string }>('/api/langchain/health', 'GET');
    return response;
  } catch (error) {
    console.error('Error checking LangChain health:', error);
    return {
      status: 'error',
      message: 'LangChain service is not available'
    };
  }
}