import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { 
  Users, 
  Mail, 
  MessageCircle, 
  BarChart2, 
  Globe, 
  Database 
} from 'lucide-react';
import { NodeData, NodePort, IntegrationType } from '@/lib/workflowTypes';

interface IntegrationNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'integration', integrationType: IntegrationType };
  };
}

// Icons for different integration types
const integrationIcons = {
  crm: <Users className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  social: <MessageCircle className="h-4 w-4" />,
  analytics: <BarChart2 className="h-4 w-4" />,
  api: <Globe className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
};

// Descriptions for integration types
const integrationDescriptions = {
  crm: 'Connect with CRM platforms',
  email: 'Integrate with email service providers',
  social: 'Connect to social media platforms',
  analytics: 'Pull data from analytics tools',
  api: 'Connect to custom API endpoints',
  database: 'Work with database operations',
};

// Define input/output ports for different integration types
const getIntegrationIO = (integrationType: IntegrationType): { inputs: NodePort[], outputs: NodePort[] } => {
  // Helper function to create properly typed ports
  const createPort = (
    id: string, 
    type: 'data' | 'control' | 'trigger', 
    label: string
  ): NodePort => ({
    id,
    type,
    label
  });
  
  // Standard inputs for all integration types
  const inputs: NodePort[] = [
    createPort('trigger-in', 'trigger', 'Trigger'),
    createPort('data-in', 'data', 'Input Data')
  ];
  
  // Different outputs based on integration type
  let outputs: NodePort[];
  
  switch (integrationType) {
    case 'crm':
      outputs = [
        createPort('contacts-out', 'data', 'Contacts'),
        createPort('deals-out', 'data', 'Deals'),
        createPort('activities-out', 'data', 'Activities')
      ];
      break;
    case 'email':
      outputs = [
        createPort('sent-out', 'data', 'Sent Status'),
        createPort('metrics-out', 'data', 'Email Metrics')
      ];
      break;
    case 'social':
      outputs = [
        createPort('post-out', 'data', 'Post Results'),
        createPort('engagement-out', 'data', 'Engagement Metrics')
      ];
      break;
    case 'analytics':
      outputs = [
        createPort('metrics-out', 'data', 'Metrics'),
        createPort('report-out', 'data', 'Report Data')
      ];
      break;
    case 'api':
      outputs = [
        createPort('response-out', 'data', 'API Response'),
        createPort('status-out', 'data', 'Status Code'),
        createPort('headers-out', 'data', 'Headers')
      ];
      break;
    case 'database':
      outputs = [
        createPort('result-out', 'data', 'Query Results'),
        createPort('status-out', 'data', 'Operation Status')
      ];
      break;
    default:
      outputs = [
        createPort('data-out', 'data', 'Output Data')
      ];
  }
  
  // All integrations have a continuation trigger
  outputs.push(createPort('next-out', 'trigger', 'Next'));
  
  return { inputs, outputs };
};

// Integration platform options for different integration types
const platformOptions = {
  crm: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Pipedrive'],
  email: ['Mailchimp', 'SendGrid', 'Campaign Monitor', 'ActiveCampaign'],
  social: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'TikTok'],
  analytics: ['Google Analytics', 'Mixpanel', 'Amplitude', 'Heap'],
  api: ['REST API', 'GraphQL', 'SOAP', 'Custom Webhook'],
  database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Firebase']
};

const IntegrationNode = memo(({ data, ...props }: IntegrationNodeProps) => {
  const integrationType = data.nodeType.integrationType;
  const { inputs, outputs } = getIntegrationIO(integrationType);
  
  // Get platform name from config or use default
  const platformName = data.config?.platform || platformOptions[integrationType][0];
  
  // Enhance the node data with integration-specific info
  const enhancedData: NodeData = {
    ...data,
    label: data.label || `${platformName} Integration`,
    icon: integrationIcons[integrationType],
    description: data.description || `${integrationDescriptions[integrationType]} (${platformName})`,
    inputs,
    outputs,
  };

  return <BaseNode data={enhancedData} variant="action" {...props} />;
});

export default IntegrationNode;