"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface Modern3DHeaderProps {
  title: string
  subtitle?: string
  description?: string
  badge?: string
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg" | "xl" | "xxl"
  accentColor?: string
  className?: string
  action?: React.ReactNode
}

export const Modern3DHeader = ({
  title,
  subtitle,
  description,
  badge,
  align = "left",
  size = "lg",
  accentColor = "from-primary to-primary/90",
  className,
  action
}: Modern3DHeaderProps) => {
  // Alignment classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }

  // Size classes
  const sizeClasses = {
    sm: {
      title: "text-lg font-semibold",
      subtitle: "text-sm"
    },
    md: {
      title: "text-xl font-semibold",
      subtitle: "text-base"
    },
    lg: {
      title: "text-2xl font-bold",
      subtitle: "text-lg"
    },
    xl: {
      title: "text-3xl font-bold",
      subtitle: "text-xl"
    },
    xxl: {
      title: "text-4xl font-extrabold",
      subtitle: "text-2xl"
    }
  }

  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div 
        className={cn(
          "space-y-1 animate-fadeIn transform transition-transform duration-300 will-change-transform", 
          alignClasses[align], 
          action ? "flex-1" : "w-full"
        )}
        style={{
          backfaceVisibility: "hidden",
          perspective: "1000px",
          willChange: "transform, opacity"
        }}
      >
        <div className="flex items-center gap-3">
          <h2 className={cn(
            sizeClasses[size].title, 
            "bg-clip-text text-transparent bg-gradient-to-r", 
            accentColor
          )}>
            {title}
          </h2>
          
          {badge && (
            <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary">
              {badge}
            </Badge>
          )}
        </div>
        
        {subtitle && (
          <p className={cn(
            sizeClasses[size].subtitle,
            "text-gray-600 dark:text-gray-300"
          )}>
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}

export default Modern3DHeader