/**
 * Workflow Templates
 * 
 * This module provides workflow templates that can be used as starting points
 * for creating complex AI agent workflows.
 */

import { GraphNode, GraphEdge } from './index';
import { AgentType } from './agents';

// Basic workflow templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  category: string;
  previewImage?: string;
}

// Content workflow template
export const contentWorkflowTemplate: WorkflowTemplate = {
  id: 'content-workflow',
  name: 'Content Creation Workflow',
  description: 'Create high-quality content with SEO optimization',
  category: 'content',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      position: { x: 100, y: 200 },
      data: {
        type: 'start',
        label: 'Start'
      }
    },
    {
      id: 'content-agent',
      type: 'agent',
      position: { x: 300, y: 200 },
      data: {
        type: AgentType.CONTENT,
        label: 'Content Generator'
      }
    },
    {
      id: 'seo-agent',
      type: 'agent',
      position: { x: 500, y: 200 },
      data: {
        type: AgentType.SEO,
        label: 'SEO Optimizer'
      }
    },
    {
      id: 'end',
      type: 'output',
      position: { x: 700, y: 200 },
      data: {
        type: 'end',
        label: 'Final Content'
      }
    }
  ],
  edges: [
    {
      id: 'start-to-content',
      source: 'start',
      target: 'content-agent',
      label: 'Generate'
    },
    {
      id: 'content-to-seo',
      source: 'content-agent',
      target: 'seo-agent',
      label: 'Optimize'
    },
    {
      id: 'seo-to-end',
      source: 'seo-agent',
      target: 'end',
      label: 'Complete'
    }
  ]
};

// Social media workflow template
export const socialMediaWorkflowTemplate: WorkflowTemplate = {
  id: 'social-media-workflow',
  name: 'Social Media Campaign',
  description: 'Create a complete social media campaign across platforms',
  category: 'marketing',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      position: { x: 100, y: 200 },
      data: {
        type: 'start',
        label: 'Start'
      }
    },
    {
      id: 'content-agent',
      type: 'agent',
      position: { x: 300, y: 200 },
      data: {
        type: AgentType.CONTENT,
        label: 'Content Strategy'
      }
    },
    {
      id: 'social-agent',
      type: 'agent',
      position: { x: 500, y: 100 },
      data: {
        type: AgentType.SOCIAL,
        label: 'Social Media'
      }
    },
    {
      id: 'analytics-agent',
      type: 'agent',
      position: { x: 500, y: 300 },
      data: {
        type: AgentType.ANALYTICS,
        label: 'Analytics'
      }
    },
    {
      id: 'end',
      type: 'output',
      position: { x: 700, y: 200 },
      data: {
        type: 'end',
        label: 'Campaign'
      }
    }
  ],
  edges: [
    {
      id: 'start-to-content',
      source: 'start',
      target: 'content-agent',
      label: 'Plan'
    },
    {
      id: 'content-to-social',
      source: 'content-agent',
      target: 'social-agent',
      label: 'Create Posts'
    },
    {
      id: 'content-to-analytics',
      source: 'content-agent',
      target: 'analytics-agent',
      label: 'Setup Tracking'
    },
    {
      id: 'social-to-end',
      source: 'social-agent',
      target: 'end',
      label: 'Schedule'
    },
    {
      id: 'analytics-to-end',
      source: 'analytics-agent',
      target: 'end',
      label: 'Monitor'
    }
  ]
};

// Email marketing workflow
export const emailWorkflowTemplate: WorkflowTemplate = {
  id: 'email-workflow',
  name: 'Email Marketing Sequence',
  description: 'Create a sequence of emails for nurturing leads',
  category: 'email',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      position: { x: 100, y: 200 },
      data: {
        type: 'start',
        label: 'Start'
      }
    },
    {
      id: 'content-agent',
      type: 'agent',
      position: { x: 300, y: 200 },
      data: {
        type: AgentType.CONTENT,
        label: 'Content Planner'
      }
    },
    {
      id: 'email-agent',
      type: 'agent',
      position: { x: 500, y: 200 },
      data: {
        type: AgentType.EMAIL,
        label: 'Email Writer'
      }
    },
    {
      id: 'end',
      type: 'output',
      position: { x: 700, y: 200 },
      data: {
        type: 'end',
        label: 'Email Sequence'
      }
    }
  ],
  edges: [
    {
      id: 'start-to-content',
      source: 'start',
      target: 'content-agent',
      label: 'Plan Sequence'
    },
    {
      id: 'content-to-email',
      source: 'content-agent',
      target: 'email-agent',
      label: 'Write Emails'
    },
    {
      id: 'email-to-end',
      source: 'email-agent',
      target: 'end',
      label: 'Schedule Delivery'
    }
  ]
};

// Full marketing campaign workflow
export const fullMarketingWorkflowTemplate: WorkflowTemplate = {
  id: 'full-marketing-workflow',
  name: 'Complete Marketing Campaign',
  description: 'Comprehensive marketing campaign across multiple channels',
  category: 'marketing',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      position: { x: 100, y: 300 },
      data: {
        type: 'start',
        label: 'Start Campaign'
      }
    },
    {
      id: 'content-agent',
      type: 'agent',
      position: { x: 300, y: 300 },
      data: {
        type: AgentType.CONTENT,
        label: 'Content Strategy'
      }
    },
    {
      id: 'seo-agent',
      type: 'agent',
      position: { x: 500, y: 150 },
      data: {
        type: AgentType.SEO,
        label: 'SEO Strategy'
      }
    },
    {
      id: 'social-agent',
      type: 'agent',
      position: { x: 500, y: 300 },
      data: {
        type: AgentType.SOCIAL,
        label: 'Social Media'
      }
    },
    {
      id: 'email-agent',
      type: 'agent',
      position: { x: 500, y: 450 },
      data: {
        type: AgentType.EMAIL,
        label: 'Email Marketing'
      }
    },
    {
      id: 'analytics-agent',
      type: 'agent',
      position: { x: 700, y: 300 },
      data: {
        type: AgentType.ANALYTICS,
        label: 'Analytics Setup'
      }
    },
    {
      id: 'end',
      type: 'output',
      position: { x: 900, y: 300 },
      data: {
        type: 'end',
        label: 'Campaign Ready'
      }
    }
  ],
  edges: [
    {
      id: 'start-to-content',
      source: 'start',
      target: 'content-agent',
      label: 'Plan'
    },
    {
      id: 'content-to-seo',
      source: 'content-agent',
      target: 'seo-agent',
      label: 'Optimize'
    },
    {
      id: 'content-to-social',
      source: 'content-agent',
      target: 'social-agent',
      label: 'Create Posts'
    },
    {
      id: 'content-to-email',
      source: 'content-agent',
      target: 'email-agent',
      label: 'Draft Emails'
    },
    {
      id: 'seo-to-analytics',
      source: 'seo-agent',
      target: 'analytics-agent',
      label: 'Track Keywords'
    },
    {
      id: 'social-to-analytics',
      source: 'social-agent',
      target: 'analytics-agent',
      label: 'Track Engagement'
    },
    {
      id: 'email-to-analytics',
      source: 'email-agent',
      target: 'analytics-agent',
      label: 'Track Opens/Clicks'
    },
    {
      id: 'analytics-to-end',
      source: 'analytics-agent',
      target: 'end',
      label: 'Launch'
    }
  ]
};

// Export all templates
export const workflowTemplates: WorkflowTemplate[] = [
  contentWorkflowTemplate,
  socialMediaWorkflowTemplate,
  emailWorkflowTemplate,
  fullMarketingWorkflowTemplate
];

// Function to get a template by ID
export function getWorkflowTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(template => template.id === id);
}