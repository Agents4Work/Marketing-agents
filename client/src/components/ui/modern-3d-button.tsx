"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface Modern3DButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "gradient"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  accentColor?: string
  icon?: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
  gradientClass?: string
}

export const Modern3DButton = ({
  children,
  className,
  variant = "default",
  size = "md",
  accentColor = "bg-primary",
  icon,
  disabled = false,
  fullWidth = false,
  gradientClass,
  ...props
}: Modern3DButtonProps) => {
  // Size classes
  const sizeClasses = {
    xs: "h-8 text-xs px-2.5",
    sm: "h-9 text-sm px-3",
    md: "h-10 text-sm px-4",
    lg: "h-11 text-base px-5",
    xl: "h-12 text-lg px-6",
  }

  // Variant classes
  const variantClasses = {
    default: `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700`,
    outline: `border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 bg-transparent`,
    ghost: `bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 border-none`,
    gradient: `bg-gradient-to-r from-${accentColor.replace('bg-', '')} to-${accentColor.replace('bg-', '')}/80 text-white border-none hover:shadow-lg`,
  }
  
  return (
    <div 
      className={cn(
        "transform will-change-transform transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]",
        fullWidth && "w-full"
      )}
      style={{ 
        WebkitTapHighlightColor: "transparent",
        backfaceVisibility: "hidden",
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      <Button
        className={cn(
          "relative rounded-lg font-medium shadow-sm transition-all duration-200",
          sizeClasses[size],
          gradientClass ? `bg-gradient-to-r ${gradientClass} text-white border-none hover:shadow-lg` : variantClasses[variant],
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          "flex items-center gap-2 overflow-hidden group",
          fullWidth && "w-full",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {icon && <span className="flex items-center">{icon}</span>}
          {children}
        </span>
        
        {/* 3D lighting effect */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-white/10 to-transparent transition-opacity rounded-lg" />
        
        {/* Shine effect on hover */}
        {!disabled && variant !== "ghost" && (
          <span className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/20 via-white/0 to-white/0 transition-opacity rounded-lg" />
        )}
      </Button>
    </div>
  )
}

export default Modern3DButton