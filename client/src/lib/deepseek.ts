/**
 * DeepSeek AI API Integration
 * 
 * This module provides client-side utilities for interacting with the DeepSeek AI API
 * for advanced text generation and analysis capabilities.
 */

import { apiRequest } from "./queryClient";

/**
 * Generate content using the DeepSeek API
 * @param prompt The text prompt to send to DeepSeek
 * @param options Additional options for the API request
 */
export async function generateContent(
  prompt: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    model?: string;
    type?: "text" | "code";
  } = {}
) {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
    
    const body = {
      prompt,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      model: options.model ?? "deepseek-chat",
      type: options.type ?? "text"
    };

    const response = await apiRequest("/api/deepseek/generate", requestOptions, body);

    return {
      success: true,
      content: response.content
    };
  } catch (error) {
    console.error("Error generating content with DeepSeek:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content"
    };
  }
}

/**
 * Analyze content using the DeepSeek API
 * @param content The text content to analyze
 * @param type The type of analysis to perform (sentiment, keywords, seo)
 */
export async function analyzeContent(content: string, type: 'sentiment' | 'keywords' | 'seo' = 'sentiment') {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
    
    const body = {
      content,
      type
    };

    const response = await apiRequest("/api/deepseek/analyze", requestOptions, body);

    return {
      success: true,
      analysis: response.analysis
    };
  } catch (error) {
    console.error(`Error analyzing content with DeepSeek (${type}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze content"
    };
  }
}

/**
 * Check DeepSeek API health status
 */
export async function checkDeepSeekHealth() {
  try {
    const response = await apiRequest("/api/deepseek/health");

    return {
      success: true,
      status: response.status,
      message: response.message
    };
  } catch (error) {
    console.error("Error checking DeepSeek API health:", error);
    return {
      success: false,
      status: "error",
      message: error instanceof Error ? error.message : "Failed to check API health"
    };
  }
}

/**
 * Check if DeepSeek API key is configured
 * @returns Boolean indicating if the API key is available
 */
export async function isDeepSeekConfigured() {
  try {
    const response = await apiRequest("/api/config/status");

    return !!response?.apiKeys?.DEEPSEEK_API_KEY;
  } catch (error) {
    console.error("Error checking DeepSeek API configuration:", error);
    return false;
  }
}