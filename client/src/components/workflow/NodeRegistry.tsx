import { NodeTypes, EdgeTypes } from 'reactflow';
import EnhancedAgentNode from './EnhancedAgentNode';
import TeamAgentNode from './TeamAgentNode';
import TriggerNode from './TriggerNode';
import LogicNode from './LogicNode';
import DataNode from './DataNode';
import IntegrationNode from './IntegrationNode';
import OutputNode from './OutputNode';
import SelectableEdge from './edges/SelectableEdge';
import TeamEdge from './edges/TeamEdge';
import { NodeCategory, WorkflowNodeType } from '@/lib/workflowTypes';

// Define the node types for ReactFlow
export const nodeTypes: NodeTypes = {
  agentNode: EnhancedAgentNode, // Maintain compatibility with existing code
  teamAgentNode: TeamAgentNode, // New human-like agent node
  triggerNode: TriggerNode,
  logicNode: LogicNode,
  dataNode: DataNode,
  integrationNode: IntegrationNode,
  outputNode: OutputNode,
};

// Define the edge types for ReactFlow
export const edgeTypes: EdgeTypes = {
  default: SelectableEdge,
  custom: SelectableEdge,
  teamEdge: TeamEdge, // New smart connection edge
};

// Helper to get the correct ReactFlow node type based on our node category and type
export function getNodeTypeForReactFlow(category: NodeCategory, nodeType: WorkflowNodeType, useTeamView = false): string {
  switch (category) {
    case 'agent':
      return useTeamView ? 'teamAgentNode' : 'agentNode';
    case 'trigger':
      return 'triggerNode';
    case 'logic':
      return 'logicNode';
    case 'data':
      return 'dataNode';
    case 'integration':
      return 'integrationNode';
    case 'output':
      return 'outputNode';
    default:
      return 'default';
  }
}

// Collection of node templates for each category
export const nodeTemplates = {
  // Trigger nodes
  triggers: [
    {
      id: 'schedule-trigger',
      label: 'Schedule',
      category: 'trigger' as NodeCategory,
      nodeType: { type: 'trigger', triggerType: 'schedule' } as WorkflowNodeType,
      description: 'Run workflow on a schedule'
    },
    {
      id: 'webhook-trigger',
      label: 'Webhook',
      category: 'trigger' as NodeCategory,
      nodeType: { type: 'trigger', triggerType: 'webhook' } as WorkflowNodeType,
      description: 'Trigger workflow via API call'
    },
    {
      id: 'form-trigger',
      label: 'Form Submission',
      category: 'trigger' as NodeCategory,
      nodeType: { type: 'trigger', triggerType: 'form' } as WorkflowNodeType,
      description: 'Start when form is submitted'
    },
    {
      id: 'manual-trigger',
      label: 'Manual Trigger',
      category: 'trigger' as NodeCategory,
      nodeType: { type: 'trigger', triggerType: 'manual' } as WorkflowNodeType,
      description: 'Start workflow manually'
    }
  ],
  
  // Logic nodes
  logic: [
    {
      id: 'condition',
      label: 'Condition',
      category: 'logic' as NodeCategory,
      nodeType: { type: 'logic', logicType: 'condition' } as WorkflowNodeType,
      description: 'Branch based on conditions'
    },
    {
      id: 'switch',
      label: 'Switch',
      category: 'logic' as NodeCategory,
      nodeType: { type: 'logic', logicType: 'switch' } as WorkflowNodeType,
      description: 'Multi-way branching'
    },
    {
      id: 'delay',
      label: 'Delay',
      category: 'logic' as NodeCategory,
      nodeType: { type: 'logic', logicType: 'delay' } as WorkflowNodeType,
      description: 'Wait for specified time'
    },
    {
      id: 'loop',
      label: 'Loop',
      category: 'logic' as NodeCategory,
      nodeType: { type: 'logic', logicType: 'loop' } as WorkflowNodeType,
      description: 'Iterate through items'
    }
  ],
  
  // Data nodes
  data: [
    {
      id: 'transform',
      label: 'Transform',
      category: 'data' as NodeCategory,
      nodeType: { type: 'data', dataType: 'transform' } as WorkflowNodeType,
      description: 'Change data structure'
    },
    {
      id: 'filter',
      label: 'Filter',
      category: 'data' as NodeCategory,
      nodeType: { type: 'data', dataType: 'filter' } as WorkflowNodeType,
      description: 'Filter data by conditions'
    },
    {
      id: 'enrich',
      label: 'Enrich',
      category: 'data' as NodeCategory,
      nodeType: { type: 'data', dataType: 'enrich' } as WorkflowNodeType,
      description: 'Add data from external sources'
    }
  ],
  
  // Integration nodes
  integrations: [
    {
      id: 'crm-integration',
      label: 'CRM Integration',
      category: 'integration' as NodeCategory,
      nodeType: { type: 'integration', integrationType: 'crm' } as WorkflowNodeType,
      description: 'Connect with CRM systems',
      config: {
        platform: 'HubSpot'
      }
    },
    {
      id: 'email-integration',
      label: 'Email Integration',
      category: 'integration' as NodeCategory,
      nodeType: { type: 'integration', integrationType: 'email' } as WorkflowNodeType,
      description: 'Connect with email services',
      config: {
        platform: 'Mailchimp'
      }
    },
    {
      id: 'social-integration',
      label: 'Social Media',
      category: 'integration' as NodeCategory,
      nodeType: { type: 'integration', integrationType: 'social' } as WorkflowNodeType,
      description: 'Connect with social networks',
      config: {
        platform: 'Facebook'
      }
    },
    {
      id: 'analytics-integration',
      label: 'Analytics Integration',
      category: 'integration' as NodeCategory,
      nodeType: { type: 'integration', integrationType: 'analytics' } as WorkflowNodeType,
      description: 'Connect with analytics services',
      config: {
        platform: 'Google Analytics'
      }
    }
  ],
  
  // Output nodes
  outputs: [
    {
      id: 'api-output',
      label: 'API Endpoint',
      category: 'output' as NodeCategory,
      nodeType: { type: 'output', outputType: 'api' } as WorkflowNodeType,
      description: 'Send data to API'
    },
    {
      id: 'database-output',
      label: 'Database Output',
      category: 'output' as NodeCategory,
      nodeType: { type: 'output', outputType: 'database' } as WorkflowNodeType,
      description: 'Save data to database'
    },
    {
      id: 'notification-output',
      label: 'Notification',
      category: 'output' as NodeCategory,
      nodeType: { type: 'output', outputType: 'notification' } as WorkflowNodeType,
      description: 'Send notification'
    },
    {
      id: 'export-output',
      label: 'Export Data',
      category: 'output' as NodeCategory,
      nodeType: { type: 'output', outputType: 'export' } as WorkflowNodeType,
      description: 'Export to downloadable file'
    }
  ]
};