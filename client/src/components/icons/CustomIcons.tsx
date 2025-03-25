/**
 * Custom Icons for the application
 * 
 * This file contains custom icon components that are not available in the lucide-react package
 * These icons are used in SidebarOptimized and other components
 */
import React from "react";

// Basic icon properties interface
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

// Helper function to calculate the appropriate stroke width
const getStrokeWidth = (props: IconProps): number => {
  const { strokeWidth = 2, absoluteStrokeWidth, size = 24 } = props;
  
  if (absoluteStrokeWidth) {
    return strokeWidth;
  }
  
  return strokeWidth;
};

// WorkflowIcon
export const WorkflowIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <rect x="2" y="7" width="6" height="10" rx="1" />
      <rect x="9" y="4" width="6" height="16" rx="1" />
      <rect x="16" y="7" width="6" height="10" rx="1" />
      <line x1="5" y1="12" x2="5" y2="12" />
      <line x1="12" y1="12" x2="12" y2="12" />
      <line x1="19" y1="12" x2="19" y2="12" />
      <path d="M5 12h7" />
      <path d="M12 12h7" />
    </svg>
  );
};

// BrainIcon (AI Icon)
export const BrainIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="M9.5 2a4 4 0 0 1 4 4c0 1.8-1.2 3.3-2.8 3.8" />
      <path d="M14.5 2a4 4 0 0 0-4 4c0 1.8 1.2 3.3 2.8 3.8" />
      <path d="M4 9a3 3 0 0 1 3-3h1" />
      <path d="M20 9a3 3 0 0 0-3-3h-1" />
      <path d="M4 22c-.8-.8-1.3-1.9-1.8-3.1A9.1 9.1 0 0 1 2 15c0-1.2.3-2.3.8-3.3A9.1 9.1 0 0 0 4 9" />
      <path d="M20 22c.8-.8 1.3-1.9 1.8-3.1a9.1 9.1 0 0 0 .2-3.9 9.1 9.1 0 0 1-.8-3.3A9.1 9.1 0 0 0 20 9" />
      <path d="M14.5 22h-5c-.5-2-.8-3.4 0-6 1.8-1 4.2-1 6 0 .8 2.6.5 4 0 6Z" />
      <path d="M13.5 16.5c-.8.5-1.7.5-2.5 0" />
    </svg>
  );
};

// BotIcon
export const BotIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="9" r="1" />
      <path d="M9 15c.83.83 2.17.83 3 0" />
      <path d="m7 6 3-2" />
      <path d="m14 6 3-2" />
    </svg>
  );
};

// SparklesIcon
export const SparklesIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
};

// LightbulbIcon (AnalyzerIcon)
export const LightbulbIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.5 13a5 5 0 1 0-7 0" />
      <path d="M8.5 13v4a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-4" />
    </svg>
  );
};

// PlannerIcon (Calendar)
export const PlannerIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
};

// PuzzleIcon
export const PuzzleIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="M5 3h14" />
      <path d="M17.5 3a2.5 2.5 0 0 1 0 5" />
      <path d="M14 8h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h5" />
      <path d="M9 3a2.5 2.5 0 0 0 0 5" />
      <path d="M14 12v4.5" />
      <path d="M14 16.5h4.5" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
    </svg>
  );
};

// KnowledgeIcon (BookOpen)
export const KnowledgeIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
};

// SubtitlesIcon
export const SubtitlesIcon: React.FC<IconProps> = (props) => {
  const { size = 24, color = "currentColor", ...otherProps } = props;
  const strokeWidth = getStrokeWidth(props);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <path d="M7 13h4" />
      <path d="M15 13h2" />
      <path d="M7 9h2" />
      <path d="M13 9h4" />
      <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6Z" />
    </svg>
  );
};

export const CustomIcons = {
  WorkflowIcon,
  BrainIcon: BrainIcon,
  BotIcon,
  SparklesIcon,
  LightbulbIcon,
  PlannerIcon,
  PuzzleIcon,
  KnowledgeIcon,
  SubtitlesIcon
};

export default CustomIcons;