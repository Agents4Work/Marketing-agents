import { Agent, AgentType } from './agents';
import { ReactNode } from 'react';

// Node Categories for Workflow Builder
export type NodeCategory = 
  | 'agent'       // AI agent nodes 
  | 'trigger'     // Workflow triggers (time, webhook, event)
  | 'data'        // Data manipulation (transform, filter)
  | 'logic'       // Logic gates (if/else, switch)
  | 'integration' // External service connections
  | 'output';     // Data output (API, database, notification)

// Trigger Types
export type TriggerType = 
  | 'schedule'    // Time-based trigger (cron)
  | 'webhook'     // External webhook
  | 'form'        // Form submission
  | 'event'       // Event-based
  | 'manual';     // Manual trigger

// Data Node Types
export type DataNodeType = 
  | 'transform'   // Transform data
  | 'filter'      // Filter data
  | 'map'         // Map data
  | 'enrich'      // Enrich data with additional info
  | 'validate'    // Validate data
  | 'aggregate';  // Combine multiple data sources
  
// Logic Node Types
export type LogicNodeType = 
  | 'condition'   // If/Else condition
  | 'switch'      // Switch statement
  | 'delay'       // Time delay
  | 'loop'        // Loop through items
  | 'parallel';   // Run parallel branches

// Integration Node Types
export type IntegrationType = 
  | 'crm'         // CRM integration
  | 'email'       // Email service
  | 'social'      // Social media
  | 'analytics'   // Analytics platforms
  | 'api'         // Generic API
  | 'database';   // Database operations

// Output Node Types
export type OutputType = 
  | 'api'         // API endpoint
  | 'database'    // Database write
  | 'notification'// Send notification
  | 'export'      // Export data
  | 'file';       // File output

// Node Type Union
export type WorkflowNodeType = 
  | { type: 'agent'; agentType: AgentType }
  | { type: 'trigger'; triggerType: TriggerType }
  | { type: 'data'; dataType: DataNodeType }
  | { type: 'logic'; logicType: LogicNodeType }
  | { type: 'integration'; integrationType: IntegrationType }
  | { type: 'output'; outputType: OutputType };

// Node Port for Input/Output connections
export interface NodePort {
  id: string;
  type: 'data' | 'control' | 'trigger';
  label: string;
  schema?: any; // Data schema
}

// Ensure we can properly narrow types with the 'as const' syntax
export type NodePortType = NodePort['type'];

// Node Data Structure
export interface NodeData {
  id?: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  config?: Record<string, any>;
  inputs?: NodePort[];
  outputs?: NodePort[];
  category: NodeCategory;
  nodeType: WorkflowNodeType;
  agent?: Agent;
  // Event handlers
  onConfigure?: (data: NodeData) => void;
  onExecute?: (data: NodeData) => void;
  onDelete?: (data: NodeData) => void;
  onSelect?: (data: NodeData) => void;
  onDeselect?: (data: NodeData) => void;
  // Document upload features
  documents?: Array<{id: string, name: string, type: string, url?: string}>;
  // Custom prompt options
  customPrompt?: string;
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'paused' | 'archived';
  lastRun?: Date;
  triggerCount?: number;
  executionCount?: number;
  avgExecutionTime?: number;
}

// Workflow Node
export interface WorkflowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

// Workflow Edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: {
    label?: string;
    condition?: string;
    transform?: string;
  };
}

// Execution Status
export type ExecutionStatus = 
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused';

// Workflow Execution Context
export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  currentNodeId?: string;
  variables: Record<string, any>;
  results: Record<string, any>;
  errors: Record<string, string>;
}

// Workflow Templates for quick starting points
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  nodes: Partial<WorkflowNode>[];
  edges: Partial<WorkflowEdge>[];
}