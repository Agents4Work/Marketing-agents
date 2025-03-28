import { ReactNode } from 'react';

/**
 * Type for an agent skill which can be either a simple string or an object with name and level
 */
export type AgentSkill = string | { name: string; level: number };

/**
 * Helper function to normalize skills to string format for display
 */
export function normalizeSkillToString(skill: AgentSkill): string {
  return typeof skill === 'string' ? skill : skill.name;
}

/**
 * Represents a change entry in the agent's changelog
 */
export interface ChangelogEntry {
  version: string;       // Version where this change was made
  date: string;          // ISO date string when the change was made
  changes: string[];     // Array of changes made in this version
}

/**
 * Version-related fields for agents
 */
export interface VersionedAgent {
  version: string;               // Current version of the agent
  compatibleVersions: string[];  // Previous versions this agent is compatible with
  releaseDate: string;           // When this version was released (ISO date string)
  lastUpdated: string;           // When this version was last updated (ISO date string)
  changelog: ChangelogEntry[];   // History of changes for this agent
}

/**
 * Interface representing an AI Agent in the marketplace
 */
export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  shortDescription?: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  level?: string;
  compatibility?: string[];
  skills?: string[];
  highlight1?: string;
  highlight2?: string;
  highlight3?: string;
  languages?: string[];
  integrations?: string[];
  configuration?: {
    contentType?: string;
    tone?: string;
    length?: string;
    mode: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  featured?: boolean;
  trending?: boolean;
  new?: boolean;
  premium?: boolean;
  
  // Version information (optional for backward compatibility)
  version?: string;
  compatibleVersions?: string[];
}

/**
 * Extended interface for premium agent profiles
 * Includes additional details required for the comprehensive profile pages
 */
/**
 * Interface representing a compatible agent with presentation details
 */
export interface CompatibleAgent {
  name: string;
  avatar: string;
  compatibility: number;
  color: string;
  id?: string;
}

export interface ExtendedAgent extends Agent {
  shortDescription: string;  // Short description for display in cards
  tags: string[];            // Tags related to agent capabilities
  free?: boolean;            // Whether this agent is free to use
  reviewCount?: number;      // Total number of reviews for the agent
  benefits: string[];
  isPremium?: boolean;       // Whether this is a premium agent (alias for premium)
  uniqueFeature1?: string;   // Unique feature of the agent
  uniqueFeature2?: string;   // Unique feature of the agent
  uniqueFeature3?: string;   // Unique feature of the agent
  testimonials: Array<{
    name: string;
    company: string;
    avatar: string;
    text: string;
    rating: number;
    title?: string;         // Job title or position
  }>;
  sampleOutputs: Array<{
    title: string;
    content: string;
    type: 'text' | 'markdown' | 'code' | 'image' | 'list';
  }>;
  compatibleAgents: Array<CompatibleAgent>;
  useCases: Array<{
    title: string;
    description: string;
    icon: any; // Allowing any icon component type for flexibility
  }>;
  performance: {
    conversionRate: number;
    engagementScore: number;
    outputQuality: number;
    creativity: number;
    consistency: number;
  };
  
  // Metrics for performance visualization
  metrics?: {
    accuracy: number;
    satisfaction: number;
    efficiency: number;
    creativity: number;
    avgResponseTime?: string;
    successRate?: string;
    userSatisfaction?: string;
    qualityScore?: string;
  };
  
  // Usage statistics
  usage?: {
    daily: number;
    weekly: number;
    monthly: number;
    totalExecutions?: string;
    activeUsers?: string;
    contentGenerated?: string;
  };
  
  // Version information (optional for backward compatibility)
  releaseDate?: string;
  lastUpdated?: string;
  changelog?: ChangelogEntry[];
}

/**
 * Interface for tracking agent execution
 */
export interface AgentExecution {
  executionId: string;               // UUID for this specific execution
  agentId: string;                   // ID of the agent
  agentVersion: string;              // Version of the agent used
  contextType: string;               // Where the agent was used (workflow, content-hub, etc)
  contextId: string;                 // ID of the specific context
  userId: number;                    // User who executed the agent
  timestamp: Date;                   // When the execution started
  parameters: Record<string, any>;   // Parameters passed to the agent
  status: 'pending' | 'running' | 'completed' | 'failed';  // Execution status
  result?: any;                      // Result of the execution
  error?: string;                    // Error message if failed
  duration?: number;                 // Execution time in milliseconds
}

/**
 * Interface representing a category of AI Agents
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
  textColor: string;
  agents: number;
  popular: boolean;
  headerBg?: string;
}

/**
 * Interface for filtering options in the marketplace
 */
export interface FilterOptions {
  search: string;
  category: string;
  level: string;
  sort: string;
}