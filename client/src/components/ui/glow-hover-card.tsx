'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SHADOWS, BORDERS } from '@/styles/modern-3d-design-system';

interface GlowHoverCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  shadow?: string;
  border?: string;
  hoverScale?: number;
  glowIntensity?: number;
  glowSize?: number;
}

/**
 * Glow Hover Card Component
 * 
 * Creates a card with a dynamic glow effect that follows the mouse cursor.
 * 
 * @param children - The content to render inside the card
 * @param className - Additional classes to apply to the card
 * @param glowColor - Color of the glow effect (tailwind class)
 * @param backgroundColor - Background color of the card
 * @param borderRadius - Border radius of the card
 * @param shadow - Shadow style for the card (from modern-3d-design-system)
 * @param border - Border style for the card (from modern-3d-design-system)
 * @param hoverScale - Scale factor on hover (1.0 = no scale)
 * @param glowIntensity - Intensity of the glow effect (0.0-1.0)
 * @param glowSize - Size of the glow effect (1-10)
 */
const GlowHoverCard: React.FC<GlowHoverCardProps> = ({
  children,
  className,
  glowColor = 'from-blue-500/20 via-blue-500/10 to-blue-500/0',
  backgroundColor = 'bg-white dark:bg-gray-800',
  borderRadius = 'rounded-xl',
  shadow = SHADOWS.md,
  border = BORDERS.sm,
  hoverScale = 1.02,
  glowIntensity = 0.4,
  glowSize = 5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate glow position
  const mouseXTemplate = useMotionTemplate`${mouseX}px`;
  const mouseYTemplate = useMotionTemplate`${mouseY}px`;
  
  // Size of glow in px based on glowSize param
  const glowSizePx = glowSize * 80;
  
  // Calculate glow opacity based on intensity
  const glowOpacity = isHovered ? glowIntensity : 0;
  
  // Handle mouse movement with throttling for performance
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    });
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        backgroundColor,
        borderRadius, 
        shadow,
        border,
        "relative overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hoverScale === 1 ? undefined : { scale: hoverScale }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* The glow effect */}
      <motion.div
        className={cn(
          'absolute pointer-events-none opacity-0 bg-gradient-radial',
          glowColor
        )}
        style={{
          width: `${glowSizePx}px`,
          height: `${glowSizePx}px`,
          left: mouseXTemplate,
          top: mouseYTemplate,
          transform: 'translate(-50%, -50%)',
          opacity: glowOpacity,
          transition: 'opacity 0.15s',
        }}
      />
      
      {/* Content with subtle border shimmer */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlowHoverCard;