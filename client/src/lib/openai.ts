import { apiRequest } from "@/lib/queryClient";

// Interface for content generation response
interface ContentResponse {
  content: string;
  error?: string;
  errorType?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
  debug?: {
    requestTime?: number;
    responseSize?: number;
    apiEndpoint?: string;
    statusCode?: number;
    retryCount?: number;
    recoveryMethod?: string;
    secondaryError?: string;
  };
}

/**
 * Validates the response from content generation
 * @param response The API response to validate
 * @returns An object with validation results
 */
function validateContentResponse(response: any): { 
  isValid: boolean; 
  error: string; 
  content?: string;
} {
  // Check if response exists and is an object
  if (!response || typeof response !== 'object') {
    return { 
      isValid: false, 
      error: "Invalid API response format: expected object, got " + (response ? typeof response : "null") 
    };
  }
  
  // Check for content property
  if (!response.hasOwnProperty('content')) {
    return { 
      isValid: false, 
      error: "API response missing content property" 
    };
  }
  
  // Check if content is a string
  if (typeof response.content !== 'string') {
    return { 
      isValid: false, 
      error: `Invalid content format: expected string, got ${typeof response.content}` 
    };
  }
  
  // Check if content is empty
  if (response.content.trim().length === 0) {
    return { 
      isValid: false, 
      error: "API returned empty content" 
    };
  }
  
  return { isValid: true, error: "", content: response.content };
}

/**
 * Function to generate text content using AI
 * 
 * @param prompt The input prompt for content generation
 * @param type The type of content to generate (text, conversation, etc.)
 * @returns An object with the generated content and any error information
 */
export async function generateContent(prompt: string, type = "text"): Promise<ContentResponse> {
  console.log(`Generating content of type: ${type}, prompt length: ${prompt.length}`);
  // Create tracking info for debugging
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 1; // Only retry once to avoid long delays
  
  try {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Empty prompt provided");
    }
    
    const data = {
      prompt,
      type,
      timestamp: new Date().toISOString() // Include timestamp for logging
    };
    
    let response = null;
    let validationResult = { isValid: false, error: "Not validated yet" };
    
    // Try with retries if the initial response is invalid
    while (retryCount <= maxRetries) {
      try {
        // Makes the API request to the Gemini endpoint
        console.log(`Making API request to /api/gemini/generate (attempt ${retryCount + 1})...`);
        response = await apiRequest("/api/gemini/generate", "POST", data);
        
        // Store response debug info
        const requestTime = Date.now() - startTime;
        console.log(`API response received in ${requestTime}ms:`, 
                   response ? (typeof response === 'object' ? 'object' : typeof response) : 'null');
        
        // Validate response structure and content
        validationResult = validateContentResponse(response);
        
        if (validationResult.isValid) {
          // If validation passes, break the retry loop
          break;
        } else {
          console.warn(`Validation failed (attempt ${retryCount + 1}):`, validationResult.error);
          if (retryCount < maxRetries) {
            retryCount++;
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount * 2)));
          } else {
            // If all retries failed, throw the validation error
            throw new Error(validationResult.error);
          }
        }
      } catch (requestError) {
        console.error(`API request failed (attempt ${retryCount + 1}):`, requestError);
        if (retryCount < maxRetries) {
          retryCount++;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount * 2)));
        } else {
          // If all retries failed, throw the error
          throw requestError;
        }
      }
    }
    
    // Check if the response contains a warning but still has valid content
    if (response.error) {
      console.warn("Content generation warning:", response.error);
      console.warn("Error type:", response.errorType || "unknown");
    }
    
    // Add timestamp and debug information to the response
    return {
      ...response,
      timestamp: new Date().toISOString(),
      debug: {
        requestTime: Date.now() - startTime,
        responseSize: JSON.stringify(response).length,
        apiEndpoint: "/api/gemini/generate",
        retryCount
      }
    };
  } catch (error) {
    console.error("Error generating content with primary method:", error);
    
    // Include debugging information for error tracking
    const debugInfo = {
      requestTime: Date.now() - startTime,
      apiEndpoint: "/api/gemini/generate",
      retryCount
    };
    
    // Log details to console for troubleshooting
    console.log("Content generation failed after", debugInfo.requestTime, "ms with", retryCount, "retries");
    localStorage.setItem('lastContentGenerationError', JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      debug: debugInfo
    }));
    
    // Try alternate direct approach before giving up
    console.log("Attempting alternate direct method for content generation...");
    
    try {
      // Send request directly to the direct-gemini-message endpoint instead
      const directResponse = await apiRequest("/direct-gemini-message", "POST", {
        message: prompt,
        contentType: type
      });
      
      console.log("Received response from alternate endpoint:", directResponse ? "success" : "failed");
      
      if (directResponse && directResponse.content && typeof directResponse.content === 'string') {
        console.log("Alternate method successful, content length:", directResponse.content.length);
        return {
          content: directResponse.content,
          timestamp: new Date().toISOString(),
          metadata: { source: "alternate_endpoint" },
          debug: {
            ...debugInfo,
            requestTime: Date.now() - startTime,
            apiEndpoint: "/direct-gemini-message",
            recoveryMethod: "alternate_endpoint"
          }
        };
      }
      
      throw new Error("Alternate method failed to produce valid content");
    } catch (backupError) {
      console.error("Backup content generation method also failed:", backupError);
      
      // After all attempts fail, return a structured error response
      return {
        content: "I apologize, but I couldn't generate the content you requested. The AI service might be temporarily unavailable or experiencing issues processing your request. Please try again in a few moments, or adjust your content requirements.",
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: "client_error",
        timestamp: new Date().toISOString(),
        debug: {
          ...debugInfo,
          secondaryError: backupError instanceof Error ? backupError.message : "Unknown error"
        }
      };
    }
  }
}

// Function to analyze SEO keywords
export async function analyzeSEO(keywords: string[], content: string) {
  try {
    const data = {
      keywords,
      content
    };
    
    return await apiRequest("/api/ai/analyze-seo", "POST", data);
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    throw error;
  }
}

// Function to generate image
export async function generateImage(prompt: string) {
  try {
    const data = { prompt };
    
    return await apiRequest("/api/ai/generate-image", "POST", data);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Function to optimize ad copy
export async function optimizeAdCopy(copy: string, target: string, platform: string) {
  try {
    const data = {
      copy,
      target,
      platform
    };
    
    return await apiRequest("/api/ai/optimize-ad", "POST", data);
  } catch (error) {
    console.error("Error optimizing ad copy:", error);
    throw error;
  }
}