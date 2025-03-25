import * as functions from 'firebase-functions';
import OpenAI from 'openai';

/**
 * Initialize OpenAI client with the API key from environment variables or Firebase config
 */
export function getOpenAIClient(): OpenAI {
  // First check for the API key in Firebase config
  const apiKey = 
    process.env.OPENAI_API_KEY || 
    functions.config().openai?.apikey;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Some features will not work properly.');
    
    // In development mode, we can use a placeholder for testing
    if (process.env.NODE_ENV === 'development') {
      return new OpenAI({
        apiKey: 'development-mode-placeholder',
        baseURL: 'https://api.openai.com/v1'
      });
    }
    
    throw new Error('OpenAI API key is required.');
  }
  
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.openai.com/v1'
  });
}

/**
 * Safe wrapper for OpenAI operations
 */
export async function safeOpenAICall<T>(
  operation: () => Promise<T>,
  defaultValue?: T
): Promise<[T | undefined, string | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    const errorMessage = 
      error?.response?.data?.error?.message || 
      error?.message || 
      'Unknown error with OpenAI API';
    
    return [defaultValue, errorMessage];
  }
}

/**
 * Generate content using OpenAI
 */
export async function generateContent(
  prompt: string, 
  options?: { 
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<[string | undefined, string | null]> {
  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI marketing assistant for a premium enterprise SaaS platform. Provide high-quality, professional marketing content based on the user\'s request.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const content = completion.choices[0]?.message?.content || '';
    return [content, null];
  } catch (error: any) {
    console.error('Error generating content with OpenAI:', error);
    
    const errorMessage = 
      error?.response?.data?.error?.message || 
      error?.message || 
      'Failed to generate content with OpenAI';
    
    return [undefined, errorMessage];
  }
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(
  prompt: string,
  options?: {
    model?: string;
    size?: string;
    quality?: string;
    n?: number;
  }
): Promise<[string | undefined, string | null]> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.images.generate({
      model: options?.model || 'dall-e-3',
      prompt,
      n: options?.n || 1,
      size: (options?.size || '1024x1024') as '1024x1024' | '512x512' | '256x256' | '1792x1024' | '1024x1792',
      quality: (options?.quality || 'standard') as 'standard' | 'hd',
      response_format: 'url',
    });
    
    const imageUrl = response.data[0]?.url;
    return [imageUrl, null];
  } catch (error: any) {
    console.error('Error generating image with DALL-E:', error);
    
    const errorMessage = 
      error?.response?.data?.error?.message || 
      error?.message || 
      'Failed to generate image with DALL-E';
    
    return [undefined, errorMessage];
  }
}

/**
 * Analyze text for sentiment and content classification
 */
export async function analyzeText(
  text: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<[any | undefined, string | null]> {
  try {
    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      temperature: options?.temperature ?? 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI marketing analyst. Analyze the provided text and return a JSON object with sentiment, key topics, and content classification.'
        },
        {
          role: 'user',
          content: `Analyze the following text and provide a structured analysis: "${text}"`
        }
      ]
    });
    
    const content = completion.choices[0]?.message?.content || '{}';
    return [JSON.parse(content), null];
  } catch (error: any) {
    console.error('Error analyzing text with OpenAI:', error);
    
    const errorMessage = 
      error?.response?.data?.error?.message || 
      error?.message || 
      'Failed to analyze text with OpenAI';
    
    return [undefined, errorMessage];
  }
}