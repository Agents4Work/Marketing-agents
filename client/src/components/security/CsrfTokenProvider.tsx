import { useState, useEffect, ReactNode } from 'react';
import { CsrfContext, fetchCsrfToken } from '@/contexts/CsrfContext';

interface CsrfTokenProviderProps {
  children: ReactNode;
}

export default function CsrfTokenProvider({ children }: CsrfTokenProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to refresh the CSRF token
  const refreshToken = async (): Promise<string | null> => {
    setLoading(true);
    try {
      const token = await fetchCsrfToken();
      setCsrfToken(token);
      setIsTokenValid(!!token);
      setLoading(false);
      return token;
    } catch (error) {
      console.error('Error refreshing CSRF token:', error);
      setIsTokenValid(false);
      setLoading(false);
      return null;
    }
  };

  // Fetch CSRF token on initial load
  useEffect(() => {
    refreshToken();
  }, []);

  // Setup interval to refresh token periodically (optional)
  useEffect(() => {
    // Refresh token every 30 minutes if the app is active
    const intervalId = setInterval(() => {
      // Only refresh if the document is visible (user is active)
      if (document.visibilityState === 'visible') {
        refreshToken();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CsrfContext.Provider
      value={{
        csrfToken,
        setCsrfToken,
        isTokenValid,
        setIsTokenValid,
        loading,
        setLoading,
        refreshToken
      }}
    >
      {children}
    </CsrfContext.Provider>
  );
}