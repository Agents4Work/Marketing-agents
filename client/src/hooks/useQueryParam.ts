import { useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to get a query parameter value from the URL
 * @param param - The query parameter name to get
 * @returns The query parameter value or null if not found
 */
export function useQueryParam(param: string): string | null {
  const [location] = useLocation();
  
  return useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
  }, [location, param]);
}

/**
 * Custom hook to set a query parameter value in the URL
 * @param param - The query parameter name to set
 * @returns A function to set the query parameter value
 */
export function useSetQueryParam(param: string): (value: string | null) => void {
  const [, navigate] = useLocation();
  
  return useCallback((value: string | null) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    if (value === null) {
      searchParams.delete(param);
    } else {
      searchParams.set(param, value);
    }
    
    const newSearch = searchParams.toString();
    const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
    
    navigate(newPath, { replace: true });
  }, [navigate, param]);
}