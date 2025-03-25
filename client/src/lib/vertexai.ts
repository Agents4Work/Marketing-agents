/**
 * Google Vertex AI Enterprise Client Integration
 * 
 * This module provides sophisticated client-side utilities for interacting with 
 * Google's Vertex AI platform for enterprise-scale text generation, content analysis,
 * and marketing automation. Designed for high-volume, data-intensive workloads.
 */

import axios from 'axios';

// Content generation request parameters
export interface GenerateContentParams {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  useCaching?: boolean;
}

// Batch content generation parameters
export interface BatchGenerateContentParams {
  prompts: string[];
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  useCaching?: boolean;
}

// Content generation response format
export interface GenerateContentResponse {
  success: boolean;
  content?: string;
  model?: string;
  cached?: boolean;
  error?: string;
}

// Batch content generation response
export interface BatchGenerateContentResponse {
  success: boolean;
  results?: string[];
  contents?: string[];  // For backwards compatibility
  model?: string;
  processedCount?: number;
  totalCount?: number;
  error?: string;
  errors?: Array<{ index: number, error: string }>;
}

// Content analysis request parameters
export interface AnalyzeContentParams {
  content: string;
  type: 'sentiment' | 'keywords' | 'seo' | 'market' | 'brand';
  model?: string;
  useCaching?: boolean;
}

// Analysis result type
export interface AnalysisResult {
  // For sentiment analysis
  score?: number; 
  explanation?: string;
  
  // For keyword analysis
  keywords?: string[];
  summary?: string;
  
  // For SEO analysis
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  
  // For market analysis
  targetAudience?: string[];
  competitiveAdvantages?: string[];
  opportunities?: string[];
  
  // For brand analysis
  attributes?: string[];
  values?: string[];
  suggestions?: string[];
  
  // Fallback for raw text
  raw?: string;
}

// Batch content analysis parameters
export interface BatchAnalyzeContentParams {
  contents: string[];
  contentItems?: string[]; // Alternative name for contents
  type?: 'sentiment' | 'keywords' | 'seo' | 'market' | 'brand';
  types?: Array<'sentiment' | 'keywords' | 'seo' | 'market' | 'brand'>;
  model?: string;
  useCaching?: boolean;
}

// Content analysis response format
export interface AnalyzeContentResponse {
  success: boolean;
  analysis?: AnalysisResult;
  type?: string;
  model?: string;
  cached?: boolean;
  error?: string;
}

// Batch analysis response result item
export interface BatchAnalysisResultItem {
  analysis: AnalysisResult;
  type: string;
  cached: boolean;
  raw?: string;
  score?: number;
  explanation?: string;
  keywords?: string[];
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
}

// Batch analysis response
export interface BatchAnalyzeContentResponse {
  success: boolean;
  results?: Array<BatchAnalysisResultItem | string>;
  model?: string;
  processedCount?: number;
  totalCount?: number;
  error?: string;
  errors?: Array<{ index: number, error: string }>;
}

// Vertex AI model information
export interface VertexAIModel {
  id: string;
  name: string;
  capabilities: string[];
  maxTokens: number;
  description: string;
}

// Bulk operation status
export interface BulkOperationStatus {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  completed: boolean;
  resultsCount: number;
  errorsCount: number;
  startTime: string;
  endTime?: string;
  elapsedTime: number;
}

/**
 * Generate content using Google's Vertex AI API
 * @param params The parameters for content generation
 */
export async function generateContent(
  params: GenerateContentParams
): Promise<GenerateContentResponse> {
  try {
    const response = await axios.post('/api/vertexai/generate', params);
    return response.data;
  } catch (error: any) {
    console.error('Error generating content with Vertex AI:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to connect to Vertex AI'
    };
  }
}

/**
 * Generate multiple content items in batch mode
 * @param params The parameters for batch content generation
 */
export async function generateContentBatch(
  params: BatchGenerateContentParams
): Promise<BatchGenerateContentResponse> {
  try {
    const response = await axios.post('/api/vertexai/generate', params);
    return response.data;
  } catch (error: any) {
    console.error('Error batch generating content with Vertex AI:', error);
    return {
      success: false,
      errors: [{ index: -1, error: error.response?.data?.error || error.message || 'Failed to connect to Vertex AI' }]
    };
  }
}

/**
 * Analyze content using Google's Vertex AI API
 * @param params The parameters for content analysis
 */
export async function analyzeContent(
  params: AnalyzeContentParams
): Promise<AnalyzeContentResponse> {
  try {
    const response = await axios.post('/api/vertexai/analyze', params);
    return response.data;
  } catch (error: any) {
    console.error('Error analyzing content with Vertex AI:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to connect to Vertex AI'
    };
  }
}

/**
 * Analyze multiple content items in batch mode
 * @param params The parameters for batch content analysis
 */
export async function analyzeContentBatch(
  params: BatchAnalyzeContentParams
): Promise<BatchAnalyzeContentResponse> {
  try {
    const response = await axios.post('/api/vertexai/analyze', params);
    return response.data;
  } catch (error: any) {
    console.error('Error batch analyzing content with Vertex AI:', error);
    return {
      success: false,
      errors: [{ index: -1, error: error.response?.data?.error || error.message || 'Failed to connect to Vertex AI' }]
    };
  }
}

/**
 * Check if the Vertex AI API is configured and accessible
 */
export async function isVertexAIConfigured(): Promise<boolean> {
  try {
    const response = await axios.get('/api/vertexai/status');
    return response.data.configured;
  } catch (error) {
    console.error('Error checking Vertex AI configuration:', error);
    return false;
  }
}

/**
 * Check the health status of the Vertex AI API connection
 */
export async function checkVertexAIHealth(): Promise<boolean> {
  try {
    const response = await axios.get('/api/vertexai/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Error checking Vertex AI health:', error);
    return false;
  }
}

// Response type for the models endpoint
export interface ModelsResponse {
  success: boolean;
  models: VertexAIModel[];
  timestamp?: string;
  error?: string;
}

/**
 * Get a list of supported Vertex AI models
 */
export async function getSupportedModels(): Promise<ModelsResponse> {
  try {
    const response = await axios.get<ModelsResponse>('/api/vertexai/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching Vertex AI models:', error);
    return {
      success: false,
      models: [],
      error: error instanceof Error ? error.message : 'Unknown error fetching models'
    };
  }
}

/**
 * Check the status of a bulk operation
 * @param operationId The ID of the bulk operation to check
 */
export async function checkBulkOperationStatus(operationId: string): Promise<BulkOperationStatus | null> {
  try {
    const response = await axios.get(`/api/vertexai/operations/${operationId}`);
    return response.data.operation;
  } catch (error) {
    console.error('Error checking bulk operation status:', error);
    return null;
  }
}

/**
 * Get metrics about Vertex AI usage
 */
export async function getVertexAIMetrics(): Promise<any> {
  try {
    const response = await axios.get('/api/vertexai/metrics');
    return response.data.metrics;
  } catch (error) {
    console.error('Error fetching Vertex AI metrics:', error);
    return null;
  }
}

/**
 * Clear the Vertex AI response cache (admin only)
 * @param adminKey Admin API key for authentication
 */
export async function clearVertexAICache(adminKey: string): Promise<boolean> {
  try {
    const response = await axios.get('/api/vertexai/cache', {
      params: { operation: 'clear' },
      headers: { 'x-admin-key': adminKey }
    });
    return response.data.success;
  } catch (error) {
    console.error('Error clearing Vertex AI cache:', error);
    return false;
  }
}