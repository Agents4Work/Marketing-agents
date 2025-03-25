/**
 * Helper function for making API requests
 * This function uses fetch with the appropriate headers
 * It automatically handles JSON parsing and error responses
 */
export default async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Check if the response is successful
  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    } catch (error) {
      // If parsing fails, throw generic error
      throw new Error(`HTTP error ${response.status}`);
    }
  }

  // Check if there's a response to parse
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

/**
 * Get CSRF token from meta tag
 */
function getCsrfToken(): string | null {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
}