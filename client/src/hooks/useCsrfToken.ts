/**
 * Dummy CSRF Token Hook
 * 
 * This version removes the actual CSRF token functionality
 * and just returns a dummy token to avoid causing network errors.
 */

import { useState, useCallback } from 'react';

interface UseCsrfTokenResult {
  token: string | null;
  loading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

/**
 * Simplified hook that provides a dummy CSRF token
 */
export default function useCsrfToken(): UseCsrfTokenResult {
  // Always return a fixed dummy token
  const [token] = useState<string | null>("dummy-csrf-token");
  const [loading] = useState<boolean>(false);
  const [error] = useState<Error | null>(null);

  // Dummy refresh function that does nothing
  const refreshToken = useCallback(async () => {
    console.log("CSRF token functionality disabled");
    return Promise.resolve();
  }, []);

  return {
    token,
    loading,
    error,
    refreshToken
  };
}