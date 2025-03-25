import { AgentType } from './agents';

// Extend AgentType with additional types used in the app
export type ExtendedAgentType = AgentType | 'content' | 'strategy' | string;

// Define a type-safe color mapping object
export const AGENT_COLORS: Record<string, string> = {
  seo: 'bg-amber-500',
  copywriting: 'bg-blue-500',
  content: 'bg-blue-500',
  ads: 'bg-indigo-500',
  creative: 'bg-rose-500',
  email: 'bg-emerald-500',
  analytics: 'bg-violet-500',
  social: 'bg-pink-500',
  strategy: 'bg-cyan-500',
  default: 'bg-gray-500'
};

/**
 * Get a color class based on agent type with fallback
 * This provides type safety and graceful handling of unknown agent types
 */
export const getAgentColor = (agentType: ExtendedAgentType): string => {
  // First check if we have an exact match
  if (agentType && typeof agentType === 'string' && agentType in AGENT_COLORS) {
    return AGENT_COLORS[agentType];
  }
  
  // If not found, return default color
  return AGENT_COLORS.default;
};

/**
 * Get initials from a name (up to 2 characters)
 */
export const getAgentInitials = (name: string): string => {
  if (!name) return 'AI';
  
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return 'AI';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

/**
 * Get an appropriate skill level for an agent type
 */
export const getAgentSkillLevel = (agentType: ExtendedAgentType): string => {
  const levels = ['Expert', 'Advanced', 'Specialist', 'Senior', 'Lead'];
  
  // Safely handle undefined/null agent types
  if (!agentType) return levels[0];
  
  // Use a deterministic approach to assign levels (same agent type always gets same level)
  const index = typeof agentType === 'string' ? agentType.length % levels.length : 0;
  return levels[index];
};

/**
 * Get an appropriate icon name for an agent type
 * This can be used to safely determine which icon to render
 */
export const getAgentIconName = (agentType: ExtendedAgentType): string => {
  // Handle common agent types
  if (agentType === 'seo') return 'Search';
  if (agentType === 'copywriting') return 'Pencil';
  if (agentType === 'content') return 'FileText';
  if (agentType === 'ads') return 'Target';
  if (agentType === 'creative') return 'Palette';
  if (agentType === 'email') return 'Mail';
  if (agentType === 'analytics') return 'BarChart';
  if (agentType === 'social') return 'Share2';
  if (agentType === 'strategy') return 'Lightbulb';
  
  // Default icon for unknown types
  return 'Bot';
};

/**
 * Get connection type styling based on connection type
 */
export const getConnectionStyle = (connectionType: string): { color: string; thickness: number; style: string } => {
  switch (connectionType) {
    case 'collaboration':
      return { color: '#3b82f6', thickness: 2, style: 'solid' }; // blue
    case 'approval':
      return { color: '#10b981', thickness: 2, style: 'solid' }; // green
    case 'feedback':
      return { color: '#f59e0b', thickness: 2, style: 'dashed' }; // amber
    default:
      return { color: '#94a3b8', thickness: 1, style: 'solid' }; // slate
  }
};

/**
 * Create a formatted connection label based on connection type
 */
export const getConnectionLabel = (connectionType: string): string => {
  switch (connectionType) {
    case 'collaboration':
      return 'Collaborates with';
    case 'approval':
      return 'Requires approval from';
    case 'feedback':
      return 'Gets feedback from';
    default:
      return 'Connected to';
  }
};