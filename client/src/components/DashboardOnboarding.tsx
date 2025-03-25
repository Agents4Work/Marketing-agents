'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHADOWS, BORDERS, BUTTON_3D_STYLES } from '@/styles/modern-3d-design-system';
import { cn } from '@/lib/utils';

// Tour step interface
interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  spotlight?: boolean; // Whether to show a spotlight effect
  showArrow?: boolean;
  arrowPosition?: {
    x: number;
    y: number;
  };
}

interface DashboardOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

const DashboardOnboarding: React.FC<DashboardOnboardingProps> = ({
  onComplete,
  onSkip,
  isOpen
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(isOpen);

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: '👋 Welcome to Your AI Marketing Hub!',
      description: 'Let\'s take a quick tour to help you get the most out of your new AI marketing platform. We\'ll show you how to create content, manage workflows, and more.',
      target: 'body',
      position: 'center',
    },
    {
      id: 'ai-input',
      title: '✨ Your AI Assistant',
      description: 'Ask any marketing question or request content here. Try "Write a social media post about our new product launch" or "Create an email newsletter about AI trends".',
      target: '.ai-input-container',
      position: 'bottom',
      spotlight: true,
    },
    {
      id: 'quick-actions',
      title: '⚡ Quick Actions',
      description: 'These buttons provide one-click access to the most common content generation tasks. Try them for faster workflows!',
      target: '.quick-actions',
      position: 'top',
      spotlight: true,
    },
    {
      id: 'content-categories',
      title: '📚 Marketing Categories',
      description: 'Browse specialized AI tools organized by marketing category. Each category contains purpose-built tools for specific marketing tasks.',
      target: '.categories-container',
      position: 'top',
      spotlight: true,
    },
    {
      id: 'sidebar',
      title: '🧭 Navigation Sidebar',
      description: 'Access all platform features from here. Click the icons to explore different sections like the AI Content Hub, Workflows, and Analytics.',
      target: '.sidebar',
      position: 'right',
      spotlight: true,
    },
    {
      id: 'complete',
      title: '🎉 You\'re All Set!',
      description: 'You now know the basics of your AI Marketing Platform. Ready to create some amazing content? You can always access this tour again from the help menu.',
      target: 'body',
      position: 'center',
    }
  ];

  // Position the tooltip based on the target element
  useEffect(() => {
    if (!isVisible) return;

    const step = tourSteps[currentStep];
    if (!step) return;

    // Function to position the tooltip
    const positionTooltip = () => {
      // For center position steps, center in the viewport
      if (step.position === 'center') {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        setPosition({
          top: viewportHeight / 2 - 150,
          left: viewportWidth / 2 - 200,
          width: 400,
          height: 300
        });
        return;
      }

      // For targeted elements, position next to them
      const targetElement = document.querySelector(step.target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 300;
      const tooltipHeight = 180;
      const margin = 20;

      let newPosition = { top: 0, left: 0, width: rect.width, height: rect.height };

      switch (step.position) {
        case 'top':
          newPosition.top = rect.top - tooltipHeight - margin;
          newPosition.left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'right':
          newPosition.top = rect.top + rect.height / 2 - tooltipHeight / 2;
          newPosition.left = rect.right + margin;
          break;
        case 'bottom':
          newPosition.top = rect.bottom + margin;
          newPosition.left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          newPosition.top = rect.top + rect.height / 2 - tooltipHeight / 2;
          newPosition.left = rect.left - tooltipWidth - margin;
          break;
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (newPosition.left < 20) newPosition.left = 20;
      if (newPosition.left + tooltipWidth > viewportWidth - 20) {
        newPosition.left = viewportWidth - tooltipWidth - 20;
      }
      if (newPosition.top < 20) newPosition.top = 20;
      if (newPosition.top + tooltipHeight > viewportHeight - 20) {
        newPosition.top = viewportHeight - tooltipHeight - 20;
      }

      setPosition(newPosition);
    };

    // Execute positioning once
    positionTooltip();

    // Add window resize listener
    window.addEventListener('resize', positionTooltip);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', positionTooltip);
    };
  }, [currentStep, isVisible]);

  // Update visibility based on isOpen prop
  useEffect(() => {
    if (isVisible !== isOpen) {
      setIsVisible(isOpen);
    }
  }, [isOpen, isVisible]);

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // Last step, complete the tour
      setIsVisible(false);
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isWelcomeOrComplete = currentStep === 0 || currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-all duration-300" 
        style={{ 
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
      />

      {/* Spotlight effect for highlighting elements */}
      {currentTourStep.spotlight && !isWelcomeOrComplete && (
        <div 
          className="fixed z-[51] transition-all duration-500 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            borderRadius: '8px'
          }}
        />
      )}

      {/* Tour tooltip */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed z-[55] w-[300px] bg-white dark:bg-gray-900 rounded-xl",
              SHADOWS.lg,
              BORDERS.md,
              "p-5 overflow-hidden"
            )}
            style={{
              top: `${isWelcomeOrComplete ? position.top : position.top}px`,
              left: `${isWelcomeOrComplete ? position.left : position.left}px`,
              maxWidth: isWelcomeOrComplete ? '400px' : '300px',
              width: isWelcomeOrComplete ? '400px' : '300px',
            }}
          >
            {/* Progress indicators */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {tourSteps.map((_, index) => (
                <div 
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "bg-primary w-4" 
                      : "bg-gray-300 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>

            {/* Close button */}
            <button 
              onClick={handleSkip}
              className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              aria-label="Close tour"
            >
              <X size={14} />
            </button>

            {/* Tour step content */}
            <div className="mt-4 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  {currentTourStep.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {currentTourStep.description}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              {!isFirstStep ? (
                <Button
                  onClick={handlePrevStep}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </Button>
              ) : (
                <div></div>
              )}
              
              <Button
                onClick={handleNextStep}
                className={cn(
                  "px-4 py-1 text-sm",
                  BUTTON_3D_STYLES.base,
                  BUTTON_3D_STYLES.primary,
                  BUTTON_3D_STYLES.interaction.moveOnHover
                )}
              >
                <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                {!isLastStep && <ChevronRight size={14} />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardOnboarding;