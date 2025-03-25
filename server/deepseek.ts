/**
 * DeepSeek AI Integration Module
 * 
 * This module provides integration with the DeepSeek AI API for text
 * generation and analysis capabilities.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Base URL for DeepSeek API
const DEEPSEEK_API_BASE_URL = 'https://api.deepseek.com/v1';

/**
 * Safe wrapper for DeepSeek API operations
 */
async function safeDeepSeekRequest<T>(requestFn: () => Promise<T>): Promise<[T | null, string | null]> {
  try {
    const result = await requestFn();
    return [result, null];
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    const errorMessage = error.response?.data?.error?.message || 
                         error.message || 
                         'Unknown error occurred with DeepSeek API';
    return [null, errorMessage];
  }
}

/**
 * Helper for safely parsing JSON
 */
function safeJSONParse(str: string): [any | null, string | null] {
  try {
    const result = JSON.parse(str);
    return [result, null];
  } catch (error: any) {
    return [null, error.message];
  }
}

/**
 * Get DeepSeek API key from environment variables
 */
function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('DeepSeek API key not found in environment variables');
  }
  return apiKey || '';
}

/**
 * Request handler for generating content with DeepSeek
 */
async function handleGenerateContent(req: Request, res: Response) {
  const apiKey = getDeepSeekApiKey();
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'DeepSeek API key not configured'
    });
  }

  // Validate request body
  const schema = z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    temperature: z.number().min(0).max(1).default(0.7),
    max_tokens: z.number().min(1).max(4096).default(1024),
    model: z.string().default('deepseek-chat'),
    type: z.enum(['text', 'code']).default('text')
  });

  try {
    const { prompt, temperature, max_tokens, model, type } = schema.parse(req.body);

    const [response, error] = await safeDeepSeekRequest(async () => {
      const apiResponse = await axios.post(
        `${DEEPSEEK_API_BASE_URL}/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: max_tokens,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return apiResponse.data;
    });

    if (error) {
      return res.status(500).json({
        success: false,
        error
      });
    }

    // Extract the generated content from the API response
    const content = response?.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      success: true,
      content
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
}

/**
 * Request handler for analyzing content with DeepSeek
 */
async function handleAnalyzeContent(req: Request, res: Response) {
  const apiKey = getDeepSeekApiKey();
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'DeepSeek API key not configured'
    });
  }

  // Validate request body
  const schema = z.object({
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['sentiment', 'keywords', 'seo']).default('sentiment')
  });

  try {
    const { content, type } = schema.parse(req.body);

    // Build analysis prompt based on the type
    let analysisPrompt = '';
    
    switch (type) {
      case 'sentiment':
        analysisPrompt = `Analyze the sentiment of the following text. Provide a score from -1.0 (very negative) to 1.0 (very positive) and explain your reasoning:

${content}

Return your response in a JSON format with the following structure:
{
  "score": [number between -1.0 and 1.0],
  "explanation": [detailed explanation of the sentiment analysis]
}`;
        break;
        
      case 'keywords':
        analysisPrompt = `Extract the main keywords and provide a brief summary of the following text:

${content}

Return your response in a JSON format with the following structure:
{
  "summary": [brief summary of the text],
  "keywords": [array of the most important keywords, max 10]
}`;
        break;
        
      case 'seo':
        analysisPrompt = `Analyze the following content for SEO optimization. Identify strengths, weaknesses, and suggest improvements:

${content}

Return your response in a JSON format with the following structure:
{
  "strengths": [array of SEO strengths],
  "weaknesses": [array of SEO weaknesses],
  "improvements": [array of specific actionable recommendations]
}`;
        break;
    }

    const [response, error] = await safeDeepSeekRequest(async () => {
      const apiResponse = await axios.post(
        `${DEEPSEEK_API_BASE_URL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: analysisPrompt }],
          temperature: 0.3,
          max_tokens: 2048,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return apiResponse.data;
    });

    if (error) {
      return res.status(500).json({
        success: false,
        error
      });
    }

    // Extract the analysis from the API response
    const analysisText = response?.choices?.[0]?.message?.content || '';
    
    // Try to parse the JSON response from the AI
    const [analysisJson, parseError] = safeJSONParse(analysisText);
    
    if (parseError || !analysisJson) {
      // If parsing fails, return the raw text
      return res.status(200).json({
        success: true,
        analysis: { 
          raw: analysisText,
          note: "Failed to parse structured response, returning raw output"
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      analysis: analysisJson
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
}

/**
 * Request handler for health check
 */
function handleHealthCheck(req: Request, res: Response) {
  const apiKey = getDeepSeekApiKey();
  
  return res.status(200).json({
    success: true,
    status: apiKey ? 'connected' : 'disconnected',
    message: apiKey 
      ? 'DeepSeek API is configured and ready to use' 
      : 'DeepSeek API key is not configured'
  });
}

/**
 * Create DeepSeek router with API endpoints
 */
export function createDeepSeekRouter() {
  const router = Router();
  
  // Content generation endpoint
  router.post('/generate', handleGenerateContent);
  
  // Content analysis endpoint
  router.post('/analyze', handleAnalyzeContent);
  
  // Health check endpoint
  router.get('/health', handleHealthCheck);
  
  return router;
}