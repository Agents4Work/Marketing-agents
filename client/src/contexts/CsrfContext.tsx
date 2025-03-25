import { createContext, useContext } from 'react';

export interface CsrfContextType {
  csrfToken: string | null;
  setCsrfToken: (token: string | null) => void;
  isTokenValid: boolean;
  setIsTokenValid: (valid: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<string | null>;
}

// Create context with default values
const defaultContext: CsrfContextType = {
  csrfToken: null,
  setCsrfToken: () => {},
  isTokenValid: false,
  setIsTokenValid: () => {},
  loading: true,
  setLoading: () => {},
  refreshToken: async () => null,
};

// Export as named export to avoid Vite hot reload issues
export const CsrfContext = createContext<CsrfContextType>(defaultContext);

// Hook for components to easily access the CSRF token context
export const useCsrfToken = () => useContext(CsrfContext);

// Helper function to fetch a new CSRF token
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf-token');
    if (response.ok) {
      const data = await response.json();
      // The API returns token, not csrfToken
      return data.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}