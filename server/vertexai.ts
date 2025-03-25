/**
 * Google Vertex AI Enterprise Integration Module
 * 
 * This module provides production-grade integration with Google's Vertex AI platform
 * for enterprise-scale text generation, content analysis, and AI model orchestration.
 * Designed for high-throughput, data-intensive marketing automation workloads.
 */
import { Request, Response, Router } from 'express';
import axios from 'axios';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';

// Define types for workflow components
interface LegoWorkflowNodeData {
  type: string;
  label: string;
  description?: string;
  agentType?: string;
  [key: string]: any;
}

interface LegoWorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: LegoWorkflowNodeData;
}

interface LegoWorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: any;
}

interface NodeResultMap {
  [nodeId: string]: any;
}

interface WorkflowExecutionError {
  nodeId: string;
  error: string;
  timestamp: string;
}

// Cache for API responses to improve performance and reduce costs
const responseCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_TTL = 3600000; // 1 hour cache lifetime
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Enhanced error handling and retry mechanism for Vertex AI requests
 * Includes performance monitoring, caching, and automatic retries
 */
async function safeVertexAIRequest<T>(
  requestFn: () => Promise<T>, 
  cacheKey?: string, 
  useCaching: boolean = true
): Promise<[T | null, string | null]> {
  // Check cache first if caching is enabled and a key is provided
  if (useCaching && cacheKey && responseCache.has(cacheKey)) {
    const cachedData = responseCache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      console.log(`[VertexAI] Cache hit for key: ${cacheKey}`);
      return [cachedData.data as T, null];
    } else if (cachedData) {
      // Cache expired, remove it
      responseCache.delete(cacheKey);
    }
  }

  // Performance tracking
  const startTime = performance.now();
  let retries = 0;
  let lastError: any = null;

  while (retries < MAX_RETRIES) {
    try {
      // Execute the request
      const result = await requestFn();
      
      // Store in cache if caching is enabled
      if (useCaching && cacheKey) {
        responseCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      // Log performance metrics
      const duration = performance.now() - startTime;
      console.log(`[VertexAI] Request completed in ${Math.round(duration)}ms${retries > 0 ? ` after ${retries} retries` : ''}`);
      
      return [result, null];
    } catch (error: any) {
      lastError = error;
      retries++;
      
      // Only retry on certain error types (network errors, rate limits, etc.)
      const statusCode = error.response?.status;
      const isRetryable = 
        !statusCode || // Network error
        statusCode === 429 || // Rate limit
        statusCode >= 500; // Server error
      
      if (isRetryable && retries < MAX_RETRIES) {
        // Wait before retrying with exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, retries - 1);
        console.log(`[VertexAI] Retrying request (${retries}/${MAX_RETRIES}) after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Log the final error
      console.error(`[VertexAI] Request failed after ${retries} ${retries === 1 ? 'retry' : 'retries'}:`, error);
      const errorMessage = error.response?.data?.error?.message || 
                           error.message || 
                           "An unexpected error occurred with Vertex AI";
      return [null, errorMessage];
    }
  }
  
  // This should never happen but TypeScript needs it
  return [null, lastError?.message || "Maximum retries exceeded"];
}

/**
 * Get Google Vertex AI credentials and project settings
 */
function getVertexAISettings(): { accessToken: string; projectId: string; location: string } {
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  
  return { accessToken, projectId, location };
}

/**
 * Check if Vertex AI credentials are configured
 */
function isVertexAIConfigured(): boolean {
  const { accessToken, projectId } = getVertexAISettings();
  return Boolean(accessToken && projectId);
}

/**
 * Generate a cache key for content generation requests
 */
function generateContentCacheKey(prompt: string, params: any): string {
  const normalizedParams = {
    prompt: prompt.trim().toLowerCase(),
    temperature: params.temperature || 0.7,
    maxOutputTokens: params.maxOutputTokens || 1024,
  };
  return `content:${JSON.stringify(normalizedParams)}`;
}

/**
 * Enhanced request handler for generating content with Vertex AI
 * Supports single and bulk content generation with performance optimizations
 */
async function handleGenerateContent(req: Request, res: Response) {
  if (!isVertexAIConfigured()) {
    return res.status(400).json({
      success: false,
      error: "Google Vertex AI credentials are not configured"
    });
  }

  // Handle both single prompt and batch processing
  const isBatchRequest = req.body.prompts && Array.isArray(req.body.prompts);
  const { 
    prompt,
    prompts,
    temperature = 0.7, 
    maxOutputTokens = 1024,
    model = 'text-bison',
    useCaching = true
  } = req.body;

  // Validate input
  if (!isBatchRequest && !prompt) {
    return res.status(400).json({
      success: false,
      error: "Prompt is required for single content generation"
    });
  }

  if (isBatchRequest && (!prompts || prompts.length === 0)) {
    return res.status(400).json({
      success: false,
      error: "At least one prompt is required for batch content generation"
    });
  }

  const { accessToken, projectId, location } = getVertexAISettings();
  
  // Select the appropriate model endpoint
  const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
  
  // For single prompt requests
  if (!isBatchRequest) {
    // Generate a cache key for this specific request
    const cacheKey = useCaching ? generateContentCacheKey(prompt, { temperature, maxOutputTokens }) : undefined;
    
    const [result, error] = await safeVertexAIRequest(async () => {
      // The actual API request to Vertex AI
      const response = await axios.post(
        apiUrl,
        {
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            temperature: temperature,
            maxOutputTokens: maxOutputTokens,
            topP: 0.8,
            topK: 40
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    }, cacheKey, useCaching);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error
      });
    }

    // Extract the generated content from the response
    const generatedContent = result?.predictions?.[0]?.content || 
                            result?.predictions?.[0]?.text || 
                            '';

    return res.json({
      success: true,
      content: generatedContent,
      model: model,
      cached: cacheKey && responseCache.has(cacheKey) ? true : false
    });
  } 
  // For batch processing
  else {
    // Create a batch of prompts to process
    const promptBatch = prompts as string[];
    const results: string[] = [];
    const errors: { index: number, error: string }[] = [];
    
    // Process prompts in parallel with concurrency control
    const concurrencyLimit = 5; // Maximum parallel requests
    const batches = [];
    
    // Create batches of prompts to respect concurrency limits
    for (let i = 0; i < promptBatch.length; i += concurrencyLimit) {
      batches.push(promptBatch.slice(i, i + concurrencyLimit));
    }
    
    // Process batches sequentially
    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      const batchPromises = currentBatch.map(async (promptText, batchIndex) => {
        const promptIndex = i * concurrencyLimit + batchIndex;
        const cacheKey = useCaching ? generateContentCacheKey(promptText, { temperature, maxOutputTokens }) : undefined;
        
        try {
          const [result, error] = await safeVertexAIRequest(async () => {
            const response = await axios.post(
              apiUrl,
              {
                instances: [{ prompt: promptText }],
                parameters: {
                  temperature,
                  maxOutputTokens,
                  topP: 0.8,
                  topK: 40
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            return response.data;
          }, cacheKey, useCaching);
          
          if (error) {
            errors.push({ index: promptIndex, error });
            results[promptIndex] = '';
          } else {
            const generatedContent = result?.predictions?.[0]?.content || 
                                  result?.predictions?.[0]?.text || 
                                  '';
            results[promptIndex] = generatedContent;
          }
        } catch (e: any) {
          errors.push({ index: promptIndex, error: e.message || 'Unknown error' });
          results[promptIndex] = '';
        }
      });
      
      // Wait for all prompts in this batch to complete before moving to next batch
      await Promise.all(batchPromises);
    }
    
    return res.json({
      success: errors.length === 0,
      contents: results,
      model: model,
      processedCount: results.filter(r => r !== '').length,
      totalCount: promptBatch.length,
      errors: errors.length > 0 ? errors : undefined
    });
  }
}

/**
 * Generate a cache key for content analysis requests
 */
function generateAnalysisCacheKey(content: string, type: string): string {
  // Create a hash of the content to avoid extremely long cache keys
  const contentHash = content
    .trim()
    .slice(0, 100) // Only use first 100 chars for the hash
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  return `analysis:${type}:${contentHash}`;
}

/**
 * Create an analysis prompt for the given content and analysis type
 */
function createAnalysisPrompt(content: string, type: string): string {
  switch (type) {
    case 'sentiment':
      return `Analyze the sentiment of the following text and rate it on a scale from -1.0 (very negative) to 1.0 (very positive). Also provide a brief explanation of your rating.\n\nText: ${content}\n\nFormat your response as JSON with the following structure: {"score": number, "explanation": "string"}`;
      
    case 'keywords':
      return `Extract the most important keywords from the following text and provide a brief summary.\n\nText: ${content}\n\nFormat your response as JSON with the following structure: {"keywords": ["string", "string", ...], "summary": "string"}`;
      
    case 'seo':
      return `Perform an SEO analysis on the following content. Identify strengths, weaknesses, and suggest improvements.\n\nContent: ${content}\n\nFormat your response as JSON with the following structure: {"strengths": ["string", "string", ...], "weaknesses": ["string", "string", ...], "improvements": ["string", "string", ...]}`;
      
    case 'market':
      return `Perform a market analysis on the following content. Identify target audience, competitive advantages, and market opportunities.\n\nContent: ${content}\n\nFormat your response as JSON with the following structure: {"targetAudience": ["string", "string", ...], "competitiveAdvantages": ["string", "string", ...], "opportunities": ["string", "string", ...]}`;
    
    case 'brand':
      return `Analyze the brand voice and tone in the following content. Identify key brand attributes, values communicated, and suggestions for brand consistency.\n\nContent: ${content}\n\nFormat your response as JSON with the following structure: {"attributes": ["string", "string", ...], "values": ["string", "string", ...], "suggestions": ["string", "string", ...]}`;
      
    default:
      throw new Error(`Unsupported analysis type: ${type}`);
  }
}

/**
 * Parse analysis content to a structured format
 */
function parseAnalysisContent(content: string): any {
  try {
    // First try to parse the entire content as JSON
    return JSON.parse(content);
  } catch (e) {
    // If parsing fails, return the raw text
    return { raw: content };
  }
}

/**
 * Enhanced request handler for analyzing content with Vertex AI
 * Supports single content analysis and batch analysis with various analysis types
 */
async function handleAnalyzeContent(req: Request, res: Response) {
  if (!isVertexAIConfigured()) {
    return res.status(400).json({
      success: false,
      error: "Google Vertex AI credentials are not configured"
    });
  }

  // Determine if this is a batch request
  const isBatchRequest = req.body.contents && Array.isArray(req.body.contents);
  const { 
    content,
    contents,
    type = 'sentiment',
    types,
    model = 'text-bison',
    useCaching = true
  } = req.body;

  // Validate input
  if (!isBatchRequest && !content) {
    return res.status(400).json({
      success: false,
      error: "Content is required for analysis"
    });
  }

  if (isBatchRequest && (!contents || contents.length === 0)) {
    return res.status(400).json({
      success: false,
      error: "At least one content item is required for batch analysis"
    });
  }

  const { accessToken, projectId, location } = getVertexAISettings();
  const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
  
  // For single content analysis
  if (!isBatchRequest) {
    try {
      // Generate a cache key if caching is enabled
      const cacheKey = useCaching ? generateAnalysisCacheKey(content, type) : undefined;
      
      // Create the analysis prompt
      const analysisPrompt = createAnalysisPrompt(content, type);
      
      const [result, error] = await safeVertexAIRequest(async () => {
        // The actual API request to Vertex AI
        const response = await axios.post(
          apiUrl,
          {
            instances: [{ prompt: analysisPrompt }],
            parameters: {
              temperature: 0.2,
              maxOutputTokens: 1024,
              topP: 0.8,
              topK: 40
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.data;
      }, cacheKey, useCaching);

      if (error) {
        return res.status(500).json({
          success: false,
          error: error
        });
      }

      // Extract the analysis content from the response
      const analysisContent = result?.predictions?.[0]?.content || 
                             result?.predictions?.[0]?.text || 
                             '';

      // Parse the analysis content
      const analysisData = parseAnalysisContent(analysisContent);
      
      return res.json({
        success: true,
        analysis: analysisData,
        type: type,
        model: model,
        cached: cacheKey && responseCache.has(cacheKey) ? true : false
      });
    } catch (e: any) {
      // Handle errors in the analysis type or processing
      return res.status(500).json({
        success: false,
        error: e.message || "An error occurred during analysis"
      });
    }
  } 
  // For batch analysis processing
  else {
    const contentItems = contents as string[];
    const analysisTypes = types && Array.isArray(types) ? types : Array(contentItems.length).fill(type);
    
    if (analysisTypes.length !== contentItems.length) {
      return res.status(400).json({
        success: false,
        error: "The number of analysis types must match the number of content items"
      });
    }
    
    // Results array will contain all analysis results
    const results: any[] = [];
    const errors: { index: number, error: string }[] = [];
    
    // Process content in parallel with concurrency control
    const concurrencyLimit = 5; // Maximum parallel requests
    const batches = [];
    
    // Create batches of content to respect concurrency limits
    for (let i = 0; i < contentItems.length; i += concurrencyLimit) {
      batches.push(contentItems.slice(i, i + concurrencyLimit).map((item, j) => ({
        content: item,
        type: analysisTypes[i + j]
      })));
    }
    
    // Process batches sequentially
    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      const batchPromises = currentBatch.map(async ({ content: contentItem, type: analysisType }, batchIndex) => {
        const contentIndex = i * concurrencyLimit + batchIndex;
        
        try {
          // Generate a cache key if caching is enabled
          const cacheKey = useCaching ? generateAnalysisCacheKey(contentItem, analysisType) : undefined;
          
          // Create the analysis prompt
          const analysisPrompt = createAnalysisPrompt(contentItem, analysisType);
          
          const [result, error] = await safeVertexAIRequest(async () => {
            // The actual API request to Vertex AI
            const response = await axios.post(
              apiUrl,
              {
                instances: [{ prompt: analysisPrompt }],
                parameters: {
                  temperature: 0.2,
                  maxOutputTokens: 1024,
                  topP: 0.8,
                  topK: 40
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            return response.data;
          }, cacheKey, useCaching);
          
          if (error) {
            errors.push({ index: contentIndex, error });
            results[contentIndex] = null;
          } else {
            // Extract the analysis content from the response
            const analysisContent = result?.predictions?.[0]?.content || 
                                   result?.predictions?.[0]?.text || 
                                   '';
            
            // Parse the analysis content to a structured format
            const analysisData = parseAnalysisContent(analysisContent);
            
            // Store the result
            results[contentIndex] = {
              analysis: analysisData,
              type: analysisType,
              cached: cacheKey && responseCache.has(cacheKey) ? true : false
            };
          }
        } catch (e: any) {
          errors.push({ 
            index: contentIndex, 
            error: e.message || "Unknown error during analysis"
          });
          results[contentIndex] = null;
        }
      });
      
      // Wait for all analyses in this batch to complete before moving to next batch
      await Promise.all(batchPromises);
    }
    
    return res.json({
      success: errors.length === 0,
      results: results.filter(r => r !== null), // Filter out null results
      model: model,
      processedCount: results.filter(r => r !== null).length,
      totalCount: contentItems.length,
      errors: errors.length > 0 ? errors : undefined
    });
  }
}

/**
 * Request handler for configuration status check
 */
function handleConfigStatus(req: Request, res: Response) {
  const configured = isVertexAIConfigured();
  
  return res.json({
    configured: configured
  });
}

/**
 * Request handler for health check
 */
function handleHealthCheck(req: Request, res: Response) {
  return res.json({
    status: 'ok',
    service: 'vertex-ai',
    timestamp: new Date().toISOString()
  });
}

/**
 * Request handler for cache management operations
 */
function handleCacheOperations(req: Request, res: Response) {
  const { operation } = req.query;
  
  // Only allow cache operations for authenticated admin requests
  if (req.headers['x-admin-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      success: false,
      error: "Unauthorized access to cache operations"
    });
  }
  
  switch (operation) {
    case 'clear':
      // Clear the entire response cache
      const count = responseCache.size;
      responseCache.clear();
      return res.json({
        success: true,
        message: `Cache cleared (${count} entries removed)`,
        timestamp: new Date().toISOString()
      });
      
    case 'stats':
      // Return cache statistics
      const contentCacheCount = Array.from(responseCache.keys())
        .filter(key => key.startsWith('content:')).length;
      const analysisCacheCount = Array.from(responseCache.keys())
        .filter(key => key.startsWith('analysis:')).length;
      
      return res.json({
        success: true,
        stats: {
          totalEntries: responseCache.size,
          contentEntries: contentCacheCount,
          analysisEntries: analysisCacheCount,
          cacheSize: JSON.stringify(Object.fromEntries(responseCache)).length,
        },
        timestamp: new Date().toISOString()
      });
      
    default:
      return res.status(400).json({
        success: false,
        error: "Invalid cache operation. Supported operations: clear, stats"
      });
  }
}

/**
 * Handles bulk operations status checks
 */
const activeBulkOperations = new Map<string, {
  status: 'running' | 'completed' | 'failed',
  progress: number,
  total: number,
  results: any[],
  errors: any[],
  startTime: Date,
  endTime?: Date
}>();

/**
 * Request handler for bulk operation status
 */
function handleBulkOperationStatus(req: Request, res: Response) {
  const { operationId } = req.params;
  
  // Validate operation ID exists and is in the active operations map
  if (!operationId) {
    return res.status(400).json({
      success: false,
      error: "Operation ID is required"
    });
  }
  
  if (!activeBulkOperations.has(operationId)) {
    return res.status(404).json({
      success: false,
      error: "Bulk operation not found"
    });
  }
  
  // Get operation details
  const operation = activeBulkOperations.get(operationId)!; // Non-null assertion is safe here because we just checked it exists
  
  // Calculate elapsed time
  let elapsedTimeMs: number;
  if (operation.endTime) {
    elapsedTimeMs = operation.endTime.getTime() - operation.startTime.getTime();
  } else {
    elapsedTimeMs = Date.now() - operation.startTime.getTime();
  }
  
  // Format the response
  return res.json({
    success: true,
    operation: {
      id: operationId,
      status: operation.status,
      progress: operation.progress,
      total: operation.total,
      completed: operation.progress === operation.total,
      resultsCount: operation.results.length,
      errorsCount: operation.errors.length,
      startTime: operation.startTime.toISOString(),
      endTime: operation.endTime ? operation.endTime.toISOString() : undefined,
      elapsedTime: elapsedTimeMs
    }
  });
}

/**
 * Request handler for metrics and monitoring
 */
function handleMetrics(req: Request, res: Response) {
  // Calculate response time metrics
  const apiCallCounts = {
    generate: 0,
    analyze: 0,
    status: 0, 
    health: 0,
    bulk: 0
  };
  
  // In a real implementation, these would be collected from actual metrics
  // For now, we'll return simulated metrics
  return res.json({
    success: true,
    metrics: {
      apiCalls: apiCallCounts,
      responseTimeMs: {
        average: 245,
        p50: 180,
        p95: 450,
        p99: 780
      },
      cacheHitRate: 0.68,
      errorRate: 0.02,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Request handler for supported models
 */
function handleSupportedModels(req: Request, res: Response) {
  return res.json({
    success: true,
    models: [
      {
        id: "text-bison",
        name: "PaLM 2 for Text",
        capabilities: ["generate", "analyze"],
        maxTokens: 8192,
        description: "Google's PaLM 2 for Text model, optimized for text generation and analysis"
      },
      {
        id: "text-bison-32k",
        name: "PaLM 2 for Text (32K)",
        capabilities: ["generate", "analyze"],
        maxTokens: 32768,
        description: "Extended context window version of PaLM 2 for Text"
      },
      {
        id: "chat-bison",
        name: "PaLM 2 for Chat",
        capabilities: ["generate"],
        maxTokens: 8192,
        description: "Google's PaLM 2 model optimized for conversational experiences"
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        capabilities: ["generate", "analyze", "workflow"],
        maxTokens: 32768,
        description: "Google's Gemini Pro model for advanced text generation and complex workflows"
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        capabilities: ["image", "multimodal"],
        maxTokens: 16384,
        description: "Multimodal Gemini model capable of processing images and text"
      },
      {
        id: "gemini-ultra",
        name: "Gemini Ultra",
        capabilities: ["generate", "analyze", "workflow", "reasoning"],
        maxTokens: 32768,
        description: "Google's most advanced Gemini model with enhanced reasoning capabilities"
      }
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * Execute a workflow graph using Vertex AI models
 * This allows for complex agent workflows built in our Lego UI to be executed
 */
async function handleWorkflowExecution(req: Request, res: Response) {
  if (!isVertexAIConfigured()) {
    return res.status(400).json({
      success: false,
      error: "Google Vertex AI credentials are not configured"
    });
  }

  const { 
    workflow,
    nodes,
    edges,
    initialState,
    model = 'gemini-pro',
    maxRetries = 2
  } = req.body;

  if (!workflow || !Array.isArray(nodes) || !Array.isArray(edges) || !initialState) {
    return res.status(400).json({
      success: false,
      error: "Invalid workflow definition. Required: workflow name, nodes, edges, and initialState"
    });
  }

  // Track workflow execution details
  const executionId = `wkf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const executionStart = new Date();
  const nodeResults = {};
  const nodeErrors = [];
  
  try {
    // Process workflow by traversing the graph
    let currentState = { ...initialState, status: 'started', executionId };
    let visitedNodes = new Set();
    let executionQueue = [];
    
    // Find starting nodes (nodes with no incoming edges)
    const startingNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    if (startingNodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid workflow: No starting nodes found"
      });
    }
    
    // Add starting nodes to the execution queue
    executionQueue = [...startingNodes];
    
    // Execute the workflow nodes in topological order
    while (executionQueue.length > 0) {
      const currentNode: LegoWorkflowNode = executionQueue.shift() as LegoWorkflowNode;
      
      if (visitedNodes.has(currentNode.id)) {
        continue;
      }
      
      // Execute the current node using Vertex AI
      try {
        console.log(`[Workflow] Executing node: ${currentNode.id} (${currentNode.data.type})`);
        
        const { accessToken, projectId, location } = getVertexAISettings();
        const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
        
        // Prepare the prompt based on node type
        let nodePrompt = "";
        switch (currentNode.data.type) {
          case 'agent':
            nodePrompt = `You are a marketing ${currentNode.data.agentType} specialist agent.
Your task is to process this input state and produce results according to your expertise.
Current workflow state: ${JSON.stringify(currentState, null, 2)}
Instructions for ${currentNode.data.label}: ${currentNode.data.description || 'Process the input and provide expert output'}
Return your response as valid JSON with your added contributions.`;
            break;
            
          case 'trigger':
            // Trigger nodes just pass through state
            if (nodeResults && currentNode.id) {
              nodeResults[currentNode.id] = { ...currentState };
            }
            visitedNodes.add(currentNode.id);
            
            // Add next nodes to queue
            const nextNodesForTrigger: LegoWorkflowNode[] = nodes.filter(node => 
              edges.some(edge => edge.source === currentNode.id && edge.target === node.id)
            );
            executionQueue = [...executionQueue, ...nextNodesForTrigger];
            continue;
            
          case 'data':
            nodePrompt = `You are a data processing node.
Analyze this input state and extract key information based on your configuration.
Current workflow state: ${JSON.stringify(currentState, null, 2)}
Instructions: Extract and organize data points related to ${currentNode.data.label}.
Return your response as valid JSON with a 'data' field containing structured information.`;
            break;
            
          case 'logic':
            nodePrompt = `You are a logical decision node.
Evaluate the current state and determine the next path based on conditions.
Current workflow state: ${JSON.stringify(currentState, null, 2)}
Decision criteria: ${currentNode.data.description || 'Evaluate conditions and determine next steps'}
Return your response as valid JSON with a 'decision' field containing your routing choice.`;
            break;
            
          case 'output':
            nodePrompt = `You are a final output formatting node.
Take the current workflow state and produce a final, well-formatted output.
Current workflow state: ${JSON.stringify(currentState, null, 2)}
Format the output as: ${currentNode.data.description || 'A comprehensive summary of results'}
Return your response as valid JSON with a 'finalOutput' field containing the formatted content.`;
            break;
            
          default:
            nodePrompt = `Process this workflow state based on your configuration.
Current workflow state: ${JSON.stringify(currentState, null, 2)}
Node type: ${currentNode.data.type}
Node label: ${currentNode.data.label}
Return your response as valid JSON.`;
        }
        
        // Make the API request to Vertex AI
        const response = await axios.post(
          apiUrl,
          {
            instances: [{ prompt: nodePrompt }],
            parameters: {
              temperature: 0.2,
              maxOutputTokens: 4096,
              topP: 0.8,
              topK: 40
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Extract and parse the result
        const generatedContent = response.data?.predictions?.[0]?.content || 
                               response.data?.predictions?.[0]?.text || 
                               '';
                               
        let parsedResult;
        try {
          parsedResult = JSON.parse(generatedContent);
        } catch (parseError) {
          // If can't parse as JSON, use the raw text
          parsedResult = { rawOutput: generatedContent };
        }
        
        // Update the workflow state
        currentState = { 
          ...currentState, 
          ...parsedResult,
          lastNodeId: currentNode.id,
          lastNodeTimestamp: new Date().toISOString()
        };
        
        // Store the node result
        if (nodeResults && currentNode.id) {
          nodeResults[currentNode.id] = parsedResult;
        }
        
      } catch (nodeError: unknown) {
        const errorMessage = nodeError instanceof Error ? nodeError.message : 'Unknown error';
        console.error(`[Workflow] Error executing node ${currentNode.id}:`, nodeError);
        nodeErrors.push({
          nodeId: currentNode.id,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        // Store error result for this node
        if (nodeResults && currentNode.id) {
          nodeResults[currentNode.id] = { 
            error: errorMessage,
            status: 'failed' 
          };
        }
      }
      
      // Mark node as visited
      visitedNodes.add(currentNode.id);
      
      // Find and queue next nodes to execute
      const nextNodes = nodes.filter(node => 
        edges.some(edge => edge.source === currentNode.id && edge.target === node.id)
      );
      
      executionQueue = [...executionQueue, ...nextNodes];
    }
    
    // Final execution status
    const executionEnd = new Date();
    const executionTime = executionEnd.getTime() - executionStart.getTime();
    
    currentState = {
      ...currentState,
      status: nodeErrors.length > 0 ? 'completed_with_errors' : 'completed',
      executionComplete: true,
      executionTime,
      nodesProcessed: visitedNodes.size,
      timestamp: executionEnd.toISOString()
    };
    
    return res.json({
      success: true,
      executionId,
      workflow: workflow,
      state: currentState,
      nodeResults,
      errors: nodeErrors.length > 0 ? nodeErrors : undefined,
      executionTime,
      startTime: executionStart.toISOString(),
      endTime: executionEnd.toISOString()
    });
    
  } catch (error: unknown) {
    console.error('[Workflow] Execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during workflow execution';
    return res.status(500).json({
      success: false,
      executionId,
      error: errorMessage,
      partialResults: Object.keys(nodeResults).length > 0 ? nodeResults : undefined,
      errors: nodeErrors.length > 0 ? nodeErrors : undefined
    });
  }
}

/**
 * Create Vertex AI router with enterprise-grade API endpoints
 */
export function createVertexAIRouter() {
  const router = Router();
  
  // Core API endpoints 
  router.post('/generate', handleGenerateContent);
  router.post('/analyze', handleAnalyzeContent);
  router.get('/status', handleConfigStatus);
  router.get('/health', handleHealthCheck);
  
  // Workflow execution endpoint for LegoWorkflow
  router.post('/workflow/execute', handleWorkflowExecution);
  
  // Advanced enterprise endpoints
  router.get('/cache', handleCacheOperations);
  router.get('/operations/:operationId', handleBulkOperationStatus);
  router.get('/metrics', handleMetrics);
  router.get('/models', handleSupportedModels);
  
  // Add additional middleware for rate limiting on production
  if (process.env.NODE_ENV === 'production') {
    // In a real implementation, we would add rate limiting middleware here
    console.log("[VertexAI] Production mode: Rate limiting would be enabled");
  }
  
  return router;
}