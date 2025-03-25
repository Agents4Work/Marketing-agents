/**
 * API Configuration Routes
 * 
 * This module provides API endpoints for configuring API keys and other settings
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/auth';

// Create a router instance
const router = Router();

// Test route that doesn't require authentication
router.get('/test', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Config API is working',
    timestamp: new Date().toISOString()
  });
});

// Schema for API key validation
const apiKeysSchema = z.object({
  apiKeys: z.object({
    OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
    DEEPSEEK_API_KEY: z.string().optional(),
    LANGSMITH_API_KEY: z.string().optional(),
    LANGSMITH_PROJECT: z.string().optional(),
    GOOGLE_ACCESS_TOKEN: z.string().optional(),
    GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
    GOOGLE_CLOUD_LOCATION: z.string().optional().default('us-central1'),
  })
});

// Path to .env file
const envFilePath = path.resolve(process.cwd(), '.env');

/**
 * Helper function to update the .env file
 */
function updateEnvFile(keyValues: Record<string, string>): boolean {
  try {
    // Read current .env file if it exists
    let envContent = '';
    try {
      if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
      }
    } catch (err) {
      console.error('Error reading .env file:', err);
      // If file doesn't exist, start with empty content
      envContent = '';
    }

    // Parse the existing content to a key-value map
    const envMap: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalsIndex = trimmedLine.indexOf('=');
        if (equalsIndex > 0) {
          const key = trimmedLine.substring(0, equalsIndex).trim();
          const value = trimmedLine.substring(equalsIndex + 1).trim();
          envMap[key] = value;
        }
      }
    });

    // Update with new values
    Object.entries(keyValues).forEach(([key, value]) => {
      envMap[key] = value;
    });

    // Convert back to a string
    const newEnvContent = Object.entries(envMap)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write back to the file
    fs.writeFileSync(envFilePath, newEnvContent);

    // Update the current process.env
    Object.entries(keyValues).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return true;
  } catch (error) {
    console.error('Error updating .env file:', error);
    return false;
  }
}

/**
 * @route POST /api/config/apikeys
 * @desc Update API keys
 * @access Private
 */
router.post('/apikeys', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { apiKeys } = apiKeysSchema.parse(req.body);

    // Update .env file with all API keys
    const success = updateEnvFile(apiKeys);

    if (success) {
      return res.status(200).json({
        success: true,
        message: 'API keys updated successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to update API keys'
      });
    }
  } catch (error: any) {
    console.error('Error updating API keys:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid API keys'
    });
  }
});

/**
 * @route GET /api/config/status
 * @desc Get configuration status
 * @access Private
 */
router.get('/status', authMiddleware, async (_req: Request, res: Response) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasLangSmith = !!process.env.LANGSMITH_API_KEY;
  const langSmithProject = process.env.LANGSMITH_PROJECT || '';
  const hasCustomWorkflow = true; // We always have our custom workflow engine
  
  // Google Vertex AI configuration status
  const hasGoogleAccessToken = !!process.env.GOOGLE_ACCESS_TOKEN;
  const hasGoogleProjectId = !!process.env.GOOGLE_CLOUD_PROJECT_ID;
  const googleCloudLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const hasVertexAI = hasGoogleAccessToken && hasGoogleProjectId;

  return res.status(200).json({
    apiKeys: {
      OPENAI_API_KEY: hasOpenAI,
      DEEPSEEK_API_KEY: hasDeepSeek,
      LANGSMITH_API_KEY: hasLangSmith,
      LANGSMITH_PROJECT: langSmithProject,
      GOOGLE_ACCESS_TOKEN: hasGoogleAccessToken,
      GOOGLE_CLOUD_PROJECT_ID: hasGoogleProjectId,
      GOOGLE_CLOUD_LOCATION: googleCloudLocation,
    },
    services: {
      openai: hasOpenAI ? 'connected' : 'disconnected',
      deepseek: hasDeepSeek ? 'connected' : 'disconnected',
      langchain: hasOpenAI ? 'connected' : 'disconnected', // Will update to use either OpenAI or VertexAI
      langsmith: hasLangSmith ? 'connected' : 'disconnected',
      langflow: false,
      workflow: hasCustomWorkflow ? 'connected' : 'disconnected',
      vertexai: hasVertexAI ? 'connected' : 'disconnected',
    }
  });
});

export const configRouter = router;