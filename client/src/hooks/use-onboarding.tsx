'use client';

import { useState, useEffect } from 'react';

// Common onboarding tour types
export type TourType = 'dashboard' | 'workflow' | 'contentHub' | 'aiTools';

export interface OnboardingState {
  // Track which tours have been completed
  completedTours: Record<TourType, boolean>;
  // When the user last saw the tour
  lastSeenDate: Record<TourType, string | null>;
  // Whether to show tours automatically
  showTours: boolean;
}

// Initialize default onboarding state
const defaultOnboardingState: OnboardingState = {
  completedTours: {
    dashboard: false,
    workflow: false,
    contentHub: false,
    aiTools: false
  },
  lastSeenDate: {
    dashboard: null,
    workflow: null,
    contentHub: null,
    aiTools: null
  },
  showTours: true
};

/**
 * Custom hook to manage onboarding tours state
 */
export const useOnboarding = () => {
  // State to track onboarding progress
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  
  // State to control which tour is currently active
  const [activeTour, setActiveTour] = useState<TourType | null>(null);

  // On mount, load onboarding state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem('aiMarketing_onboardingState');
    if (storedState) {
      try {
        setOnboardingState(JSON.parse(storedState));
      } catch (error) {
        console.error('Error parsing onboarding state:', error);
        // Reset to default if JSON is invalid
        setOnboardingState(defaultOnboardingState);
      }
    } else {
      // First visit - show dashboard tour automatically
      setActiveTour('dashboard');
    }
  }, []);

  // Whenever onboarding state changes, save to localStorage
  useEffect(() => {
    localStorage.setItem('aiMarketing_onboardingState', JSON.stringify(onboardingState));
  }, [onboardingState]);

  // Check if a specific tour should be shown automatically
  const shouldShowTour = (tourType: TourType): boolean => {
    if (!onboardingState.showTours) return false;
    if (onboardingState.completedTours[tourType]) return false;
    
    // If the tour has been seen before but not completed, check the time elapsed
    if (onboardingState.lastSeenDate[tourType]) {
      const lastSeen = new Date(onboardingState.lastSeenDate[tourType] as string);
      const now = new Date();
      // Don't show the tour again if it was seen in the last 24 hours
      const hoursSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSeen < 24) return false;
    }
    
    return true;
  };

  // Mark a tour as started
  const startTour = (tourType: TourType): void => {
    setActiveTour(tourType);
    setOnboardingState(prev => ({
      ...prev,
      lastSeenDate: {
        ...prev.lastSeenDate,
        [tourType]: new Date().toISOString()
      }
    }));
  };

  // Mark a tour as completed
  const completeTour = (tourType: TourType): void => {
    setActiveTour(null);
    setOnboardingState(prev => ({
      ...prev,
      completedTours: {
        ...prev.completedTours,
        [tourType]: true
      }
    }));
  };

  // Skip a tour without marking it as completed
  const skipTour = (tourType: TourType): void => {
    setActiveTour(null);
  };

  // Reset all onboarding progress
  const resetOnboarding = (): void => {
    setOnboardingState(defaultOnboardingState);
    setActiveTour(null);
  };

  // Toggle whether to show tours automatically
  const toggleShowTours = (): void => {
    setOnboardingState(prev => ({
      ...prev,
      showTours: !prev.showTours
    }));
  };

  return {
    onboardingState,
    activeTour,
    shouldShowTour,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding,
    toggleShowTours
  };
};

export default useOnboarding;