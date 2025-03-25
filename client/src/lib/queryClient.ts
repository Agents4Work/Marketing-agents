import { QueryClient, QueryKey, QueryFunction } from '@tanstack/react-query';

// Development mode flag
const DEV_MODE = import.meta.env.DEV;

// Helper function to check if a response is ok and throw an error if not
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse error message from response
    try {
      const errorText = await res.text();
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      } catch (parseError) {
        // If we can't parse JSON, use the raw error text
        if (errorText) {
          throw new Error(`Response error: ${errorText}`);
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e; // Rethrow parsed errors
      }
      // Fallback if we couldn't read the response at all
    }
    
    // If we reach here, we couldn't extract a specific error message
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
}

// Get the development auth headers if in development mode
function getDevAuthHeaders(): Record<string, string> {
  if (DEV_MODE) {
    return {
      'X-Dev-Bypass-Auth': 'true',
      'Authorization': 'Bearer mock-token-for-development'
    };
  }
  return {};
}

// Get auth headers from current user if available
function getAuthHeaders(): Record<string, string> {
  // For development mode, use the dev headers
  if (DEV_MODE) {
    return getDevAuthHeaders();
  }
  
  // In a production environment, we'd get the token from authentication state
  // This would typically come from a user context or auth state
  return {};
}

// Get CSRF token from cookie or local storage
function getCsrfToken(): string | null {
  // First try to get from cookie
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf_token='));
  if (csrfCookie) {
    return csrfCookie.split('=')[1].trim();
  }
  
  // Then try from localStorage as fallback
  return localStorage.getItem('csrfToken');
}

// Include CSRF token in security headers
function getSecurityHeaders(): Record<string, string> {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    return {
      'X-CSRF-Token': csrfToken
    };
  }
  return {};
}

/**
 * Enhanced API request function with robust error handling, retry logic, and debugging
 * 
 * @param endpoint The API endpoint to request
 * @param options Request options (can be a string method or RequestInit object)
 * @param body Optional request body (for POST, PUT, etc.)
 * @returns Promise resolving to the parsed JSON response
 */
export async function apiRequest(
  endpoint: string,
  options?: RequestInit | string,
  body?: any
): Promise<any> {
  // For tracking request timing
  const requestStart = Date.now();
  let requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  let retryCount = 0;
  const maxRetries = endpoint.includes('/api/gemini/') ? 2 : 1; // More retries for AI endpoints
  const retryDelay = 1000; // Base delay in ms
  
  // Function to perform a single request attempt
  const performRequest = async (): Promise<any> => {
    try {
      // Ensure leading slash for endpoint
      if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
      }
      
      // Get authentication and security headers
      const authHeaders = getAuthHeaders();
      const securityHeaders = getSecurityHeaders();
      
      // Prepare request options
      let requestOptions: RequestInit;
      
      if (typeof options === 'string') {
        // Legacy support for method string
        requestOptions = {
          method: options,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-Retry-Count': retryCount.toString(),
            ...authHeaders,
            ...securityHeaders,
          },
        };
        
        // Add body if provided
        if (body && options !== "GET") {
          requestOptions.body = JSON.stringify(body);
        }
      } else if (options && typeof options === 'object') {
        // Handle options object
        requestOptions = {
          method: options.method || 'GET',
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-Retry-Count': retryCount.toString(),
            ...authHeaders,
            ...securityHeaders,
            ...options.headers,
          },
        };
        
        // If body is provided as a separate parameter, use it
        if (body && requestOptions.method !== "GET") {
          requestOptions.body = JSON.stringify(body);
        }
      } else {
        // Default to GET with no options
        requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-Retry-Count': retryCount.toString(),
            ...authHeaders,
            ...securityHeaders,
          },
        };
      }
      
      // Make the request
      console.log(`[${requestId}] Making ${requestOptions.method} request to ${endpoint}${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`);
      
      if (body && requestOptions.method !== "GET") {
        // Log request payload for debugging (avoid logging sensitive data)
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'api_key'];
        const sanitizedBody = { ...body };
        
        // Sanitize sensitive fields for logging
        for (const field of sensitiveFields) {
          if (sanitizedBody[field]) {
            sanitizedBody[field] = '******';
          }
        }
        
        console.log(`[${requestId}] Request payload:`, sanitizedBody);
      }
      
      // Actual fetch request with timeout (30s for normal requests, 45s for AI requests)
      const timeoutDuration = endpoint.includes('/api/gemini/') || endpoint.includes('/api/ai/') ? 45000 : 30000;
      
      const response = await Promise.race([
        fetch(endpoint, requestOptions),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timeout after ${timeoutDuration/1000}s`)), timeoutDuration);
        })
      ]) as Response;
      
      const requestDuration = Date.now() - requestStart;
      console.log(`[${requestId}] Response received in ${requestDuration}ms with status: ${response.status}`);
      
      // Store response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // Check for rate limiting and apply exponential backoff if needed
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        let waitTime = retryDelay * Math.pow(2, retryCount); // Exponential backoff
        
        if (retryAfter) {
          waitTime = parseInt(retryAfter, 10) * 1000;
        }
        
        console.warn(`[${requestId}] Rate limited, waiting ${waitTime/1000}s before retry`);
        
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return performRequest();
        }
      }
      
      // For 401 responses, log warning
      if (response.status === 401) {
        console.warn(`[${requestId}] Authentication required. User may need to log in.`);
        
        // Add auth error details to localStorage for debugging
        localStorage.setItem('lastAuthError', JSON.stringify({
          endpoint,
          status: response.status,
          timestamp: new Date().toISOString(),
          headers: securityHeaders
        }));
      }
      
      // Special handling for AI endpoints that may return partial results
      if (endpoint.includes('/api/gemini/') || endpoint.includes('/api/ai/')) {
        if (response.status >= 200 && response.status < 300) {
          try {
            const contentType = response.headers.get('Content-Type') || '';
            
            if (contentType.includes('application/json')) {
              const data = await response.json();
              
              // Enhanced logging for AI responses
              console.log(`[${requestId}] AI endpoint success:`, {
                hasContent: !!data.content,
                contentLength: data.content ? data.content.length : 0,
                hasError: !!data.error,
                responseTime: requestDuration,
                statusCode: response.status
              });
              
              // If the response has error but retries are available, retry
              if (data.error && data.errorType === 'server_error' && retryCount < maxRetries) {
                console.warn(`[${requestId}] AI endpoint returned server error, retrying...`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
                return performRequest();
              }
              
              // Add metadata to the response
              return {
                ...data,
                _metadata: {
                  requestId,
                  responseTime: requestDuration,
                  endpoint,
                  retryCount
                }
              };
            } else {
              const textData = await response.text();
              console.warn(`[${requestId}] Non-JSON response from AI endpoint:`, textData.substring(0, 200));
              
              // Try to automatically detect and parse JSON even if Content-Type is wrong
              if (textData.trim().startsWith('{') && textData.trim().endsWith('}')) {
                try {
                  const parsedData = JSON.parse(textData);
                  console.log(`[${requestId}] Successfully parsed JSON despite incorrect Content-Type`);
                  return {
                    ...parsedData,
                    _metadata: {
                      requestId,
                      responseTime: requestDuration,
                      endpoint,
                      retryCount,
                      contentTypeIssue: true
                    }
                  };
                } catch (e) {
                  // If parsing fails, continue with the error
                  console.error(`[${requestId}] Failed to parse response despite JSON-like format`);
                }
              }
              
              // If retries are available, retry on non-JSON response
              if (retryCount < maxRetries) {
                console.warn(`[${requestId}] Retrying due to non-JSON response`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
                return performRequest();
              }
              
              throw new Error('AI endpoint returned non-JSON response');
            }
          } catch (parseError) {
            console.error(`[${requestId}] Error parsing AI response:`, parseError);
            
            // Retry on parse errors
            if (retryCount < maxRetries) {
              console.warn(`[${requestId}] Retrying due to parse error`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
              return performRequest();
            }
            
            throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }
        } else if (response.status >= 500 && retryCount < maxRetries) {
          // Retry on server errors for AI endpoints
          console.warn(`[${requestId}] Server error ${response.status}, retrying...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
          return performRequest();
        }
      }

      // Check if response is ok for all other endpoints
      // This will throw an error for non-200 responses that weren't handled above
      await throwIfResNotOk(response);
      
      // Parse JSON response
      try {
        const data = await response.json();
        return {
          ...data,
          _metadata: {
            requestId,
            responseTime: requestDuration,
            endpoint,
            retryCount
          }
        };
      } catch (parseError) {
        console.error(`[${requestId}] Error parsing JSON:`, parseError);
        
        // Attempt to read text response instead
        const textResponse = await response.text();
        if (textResponse) {
          console.log(`[${requestId}] Text response:`, textResponse.substring(0, 150) + (textResponse.length > 150 ? '...' : ''));
          
          // Store the error details for debugging
          localStorage.setItem('lastJsonParseError', JSON.stringify({
            endpoint,
            statusCode: response.status,
            responsePreview: textResponse.substring(0, 500),
            timestamp: new Date().toISOString()
          }));
          
          // Retry on parse errors for important endpoints
          if ((endpoint.includes('/api/') || endpoint.includes('/gemini/')) && retryCount < maxRetries) {
            console.warn(`[${requestId}] Retrying due to JSON parse error`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
            return performRequest();
          }
          
          throw new Error('Invalid JSON response');
        } else {
          throw new Error('Empty response');
        }
      }
    } catch (error) {
      // Network errors and timeouts should be retried
      if (
        error instanceof TypeError || 
        (error instanceof Error && error.message.includes('timeout')) &&
        retryCount < maxRetries
      ) {
        console.warn(`[${requestId}] Network error, retrying (${retryCount + 1}/${maxRetries})...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        return performRequest();
      }
      
      // Log detailed error information
      console.error(`[${requestId}] API request error after ${retryCount} retries:`, error);
      
      // For debugging purposes
      localStorage.setItem('lastApiError', JSON.stringify({
        requestId,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        retryCount
      }));
      
      throw error;
    }
  };
  
  // Start the request process
  return performRequest();
}

// Custom query function type
type CustomQueryFn<TData> = QueryFunction<TData, QueryKey>;

// Query function generator with authentication handling
export function createQueryFn<TData>(options: { on401: "returnNull" | "throw" }): CustomQueryFn<TData> {
  return async (context) => {
    // Extract the URL from the query key
    const url = Array.isArray(context.queryKey) ? context.queryKey[0] : context.queryKey;
    
    if (typeof url !== 'string') {
      throw new Error('Query key must be a string or start with a string');
    }
    
    try {
      return await apiRequest(url) as TData;
    } catch (error: any) {
      console.error('Query function error:', error);
      
      // Handle 401 errors according to the options
      if (error.message?.includes('401') || error.message?.includes('Authentication required')) {
        if (options.on401 === "throw") {
          throw error;
        }
        return null as TData;
      }
      
      throw error;
    }
  };
}

// Configure the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});