/**
 * Direct Text Component
 * 
 * This is a simple replacement for the i18n system.
 * It directly renders text without any translation infrastructure.
 */
import { useMemo } from 'react';

export function useDirectText() {
  // Memoize to prevent unnecessary re-renders
  return useMemo(() => {
    console.log("Direct text implementation initialized once"); // Will only show once
    return {
      // This is just a pass-through function that returns the text directly
      t: (key: string) => key
    };
  }, []);
}