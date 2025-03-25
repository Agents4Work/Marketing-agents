import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initial?: any;
  animate?: any;
  exit?: any;
}

/**
 * AnimatedSection component for smooth page transitions and element animations
 * Uses Framer Motion for fluid animations with configurable parameters
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  duration = 0.5,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  exit = { opacity: 0, y: -20 },
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCard component for card elements with hover animations
 */
export function AnimatedCard({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedList component for staggered list item animations
 */
export function AnimatedList({
  children,
  className,
  staggerChildren = 0.1,
  ...props
}: AnimatedSectionProps & { staggerChildren?: number }) {
  return (
    <motion.div
      className={cn('space-y-4', className)}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
          },
        },
        hidden: {
          opacity: 0,
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedListItem component for use within AnimatedList
 */
export function AnimatedListItem({
  children,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        visible: { opacity: 1, x: 0 },
        hidden: { opacity: 0, x: -20 },
      }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedSection;