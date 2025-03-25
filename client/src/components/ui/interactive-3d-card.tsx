'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SHADOWS, BORDERS } from '@/styles/modern-3d-design-system';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  backgroundColor?: string;
  borderRadius?: string;
  shadow?: string;
  border?: string;
  hoverScale?: number;
  rotationIntensity?: number;
  disableRotation?: boolean;
  disableDepth?: boolean;
  fullWidth?: boolean;
  optimizePerformance?: boolean; // New prop to enable performance optimizations
}

/**
 * Interactive 3D Card Component (Optimized)
 * 
 * Creates an interactive 3D card that responds to mouse movements with depth effects.
 * Optimized for performance with GPU acceleration and reduced calculations.
 */
const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className,
  depth = 3,
  backgroundColor = 'bg-white dark:bg-gray-800',
  borderRadius = 'rounded-xl',
  shadow = SHADOWS.md,
  border = BORDERS.sm,
  hoverScale = 1.02,
  rotationIntensity = 0.5,
  disableRotation = false,
  disableDepth = false,
  fullWidth = false,
  optimizePerformance = false,
}) => {
  // Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseMoveThrottleRef = useRef<number | null>(null);
  
  // State
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for tracking mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring configuration - memoized to avoid re-creating on every render
  const springConfig = useMemo(() => ({
    stiffness: optimizePerformance ? 120 : 150,
    damping: optimizePerformance ? 20 : 15
  }), [optimizePerformance]);
  
  // Springs for smooth animation
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Calculate rotation based on mouse position
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  
  // Calculate actual rotation based on intensity
  const actualRotateX = useTransform(rotateX, value => value * rotationIntensity);
  const actualRotateY = useTransform(rotateY, value => value * rotationIntensity);
  
  // Calculate depth effect
  const translateZ = useMemo(() => 
    disableDepth ? '0px' : `${depth * 4}px`, 
  [disableDepth, depth]);
  
  // Animation configuration
  const animationConfig = useMemo(() => ({
    initial: { opacity: 0, y: optimizePerformance ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: optimizePerformance ? 0.3 : 0.4, 
      ease: "easeOut" 
    }
  }), [optimizePerformance]);
  
  // Update rotation on mouse move with throttling for better performance
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;
    
    // Skip if we're already processing a mouse move and optimizing for performance
    if (mouseMoveThrottleRef.current !== null && optimizePerformance) return;
    
    // Use requestAnimationFrame for smoother updates
    mouseMoveThrottleRef.current = window.requestAnimationFrame(() => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      
      // Calculate normalized mouse position (-0.5 to 0.5)
      const xPos = (e.clientX - rect.left) / rect.width - 0.5;
      const yPos = (e.clientY - rect.top) / rect.height - 0.5;
      
      mouseX.set(xPos);
      mouseY.set(yPos);
      
      mouseMoveThrottleRef.current = null;
    });
  };
  
  // Reset rotation when not hovering
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    
    // Cancel any pending animation frame
    if (mouseMoveThrottleRef.current !== null) {
      cancelAnimationFrame(mouseMoveThrottleRef.current);
      mouseMoveThrottleRef.current = null;
    }
  };
  
  // Mark as mounted to enable animations after hydration
  useEffect(() => {
    setIsMounted(true);
    
    // Clean up any animation frames when component unmounts
    return () => {
      if (mouseMoveThrottleRef.current !== null) {
        cancelAnimationFrame(mouseMoveThrottleRef.current);
      }
    };
  }, []);
  
  // Return a static version for SSR
  if (!isMounted) {
    return (
      <div
        className={cn(
          backgroundColor,
          borderRadius,
          shadow,
          border,
          "overflow-hidden relative",
          fullWidth ? "w-full" : "w-auto",
          className
        )}
      >
        {children}
      </div>
    );
  }
  
  // Get props for the card element - with proper type casting for Framer Motion
  const cardProps: any = {
    ref: cardRef,
    className: cn(
      backgroundColor,
      borderRadius,
      shadow,
      border,
      "overflow-hidden relative",
      fullWidth ? "w-full" : "w-auto",
      className
    ),
    style: {
      perspective: '1200px',
      willChange: 'transform, opacity',
      transform: 'translateZ(0)', // Force GPU acceleration
    },
    onMouseMove: disableRotation ? undefined : handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    whileHover: hoverScale === 1 ? undefined : { 
      scale: hoverScale,
      transition: { duration: 0.2 } // Faster scale for better responsiveness
    },
    ...animationConfig
  };
  
  return (
    <motion.div {...cardProps}>
      <motion.div
        className="h-full w-full"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)', // Force GPU acceleration
          rotateX: disableRotation ? 0 : actualRotateX,
          rotateY: disableRotation ? 0 : actualRotateY,
          z: isHovered ? translateZ : '0px',
        } as any}
      >
        {/* Add a subtle lighting effect on hover - only render when needed */}
        {!disableDepth && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 dark:from-white/0 dark:via-white/0 dark:to-white/5 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ willChange: 'opacity' }}
          />
        )}
        
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Interactive3DCard;