import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
  width?: string;
  className?: string;
  alwaysShow?: boolean;
  /** Shows a pulse animation to highlight new or important elements */
  highlight?: boolean;
  /** Advanced properties for interactive tooltips */
  interactive?: boolean;
  /** Actions for interactive tooltips */
  actions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  icon,
  color = "bg-blue-500",
  position = "top",
  delay = 400,
  width = "w-64",
  className = "",
  alwaysShow = false,
  highlight = false,
  interactive = false,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(alwaysShow);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handles the event when cursor enters the element
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!alwaysShow) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  // Handles the event when cursor leaves the element
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!alwaysShow && !interactive) {
      setIsVisible(false);
    } else if (interactive) {
      // For interactive tooltips, we use a timeout before hiding
      timeoutRef.current = setTimeout(() => {
        if (!isHovered) {
          setIsVisible(false);
        }
      }, 300);
    }
  };

  // Determines the position properties of the tooltip
  const getPositionStyles = () => {
    switch (position) {
      case "right":
        return { 
          left: "calc(100% + 8px)", 
          top: "50%", 
          transform: "translateY(-50%)" 
        };
      case "bottom":
        return { 
          top: "calc(100% + 8px)", 
          left: "50%", 
          transform: "translateX(-50%)" 
        };
      case "left":
        return { 
          right: "calc(100% + 8px)", 
          top: "50%", 
          transform: "translateY(-50%)" 
        };
      case "top":
      default:
        return { 
          bottom: "calc(100% + 8px)", 
          left: "50%", 
          transform: "translateX(-50%)" 
        };
    }
  };

  // Animation variants for the entry effect
  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
      x: position === "left" ? 10 : position === "right" ? -10 : 0
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  // Variants for the pulse effect for highlighted elements
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(66, 153, 225, 0.4)",
        "0 0 0 10px rgba(66, 153, 225, 0)",
        "0 0 0 0 rgba(66, 153, 225, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Child container with pulse animation if highlighted */}
      <motion.div
        variants={highlight ? pulseVariants : undefined}
        animate={highlight ? "pulse" : undefined}
        className={`relative ${isHovered ? "z-10" : ""}`}
      >
        {children}
      </motion.div>

      {/* Animated tooltip */}
      <AnimatePresence>
        {(isVisible || alwaysShow) && (
          <motion.div
            className={`absolute ${width} pointer-events-${interactive ? "auto" : "none"} z-50`}
            style={getPositionStyles()}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className={`rounded-lg shadow-lg ${interactive ? "pointer-events-auto" : ""}`}>
              {/* Tooltip header (optional) */}
              {icon && (
                <div className={`${color} text-white px-3 py-2 rounded-t-lg flex items-center gap-2`}>
                  {icon}
                  {typeof content === "string" ? (
                    <span className="font-medium">{content}</span>
                  ) : (
                    content
                  )}
                </div>
              )}

              {/* Main content */}
              {!icon && (
                <div className={`${color} text-white p-3 rounded-lg shadow-md font-medium`}>
                  {content}
                </div>
              )}

              {/* Interactive actions (for interactive tooltips) */}
              {interactive && actions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 justify-end">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                        onClick={action.onClick}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tooltip direction arrow */}
              <div
                className={`absolute w-3 h-3 ${color} transform rotate-45 ${
                  position === "top" ? "bottom-[-6px] left-1/2 -translate-x-1/2" :
                  position === "right" ? "left-[-6px] top-1/2 -translate-y-1/2" :
                  position === "bottom" ? "top-[-6px] left-1/2 -translate-x-1/2" :
                  "right-[-6px] top-1/2 -translate-y-1/2"
                }`}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedTooltip;