import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { 
  Search, 
  PenTool, 
  BarChart2, 
  Image, 
  Mail, 
  MessageCircle, 
  PieChart 
} from 'lucide-react';
import { NodeData, NodePortType } from '@/lib/workflowTypes';
import { AgentType } from '@/lib/agents';

interface EnhancedAgentNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'agent', agentType: AgentType };
    agent?: any; // Agent data from our API
  };
}

// Icons for agent types
const agentIcons = {
  seo: <Search className="h-4 w-4" />,
  copywriting: <PenTool className="h-4 w-4" />,
  ads: <PieChart className="h-4 w-4" />,
  creative: <Image className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart2 className="h-4 w-4" />,
  social: <MessageCircle className="h-4 w-4" />,
};

// Descriptions for agent types
const agentDescriptions = {
  seo: 'Optimize content for search engines',
  copywriting: 'Generate engaging marketing copy',
  ads: 'Create high-converting ad content',
  creative: 'Generate images and design assets',
  email: 'Create email marketing campaigns',
  analytics: 'Analyze marketing performance data',
  social: 'Create social media content',
};

// Input/output ports based on agent type
const getAgentIO = (agentType: AgentType) => {
  // All agents have a standard input
  const inputs = [
    { id: 'trigger-in', type: 'trigger' as NodePortType, label: 'Trigger' },
    { id: 'data-in', type: 'data' as NodePortType, label: 'Input Data' }
  ];
  
  // Different output ports based on agent type
  let outputs;
  
  switch (agentType) {
    case 'seo':
      outputs = [
        { id: 'keywords-out', type: 'data' as NodePortType, label: 'Keywords' },
        { id: 'content-out', type: 'data' as NodePortType, label: 'Optimized Content' },
        { id: 'analysis-out', type: 'data' as NodePortType, label: 'SEO Analysis' }
      ];
      break;
    case 'copywriting':
      outputs = [
        { id: 'content-out', type: 'data' as NodePortType, label: 'Generated Copy' },
        { id: 'variations-out', type: 'data' as NodePortType, label: 'Variations' }
      ];
      break;
    case 'ads':
      outputs = [
        { id: 'headline-out', type: 'data' as NodePortType, label: 'Headlines' },
        { id: 'copy-out', type: 'data' as NodePortType, label: 'Ad Copy' },
        { id: 'audience-out', type: 'data' as NodePortType, label: 'Audience Segments' }
      ];
      break;
    case 'creative':
      outputs = [
        { id: 'image-out', type: 'data' as NodePortType, label: 'Generated Images' },
        { id: 'design-out', type: 'data' as NodePortType, label: 'Design Assets' }
      ];
      break;
    case 'email':
      outputs = [
        { id: 'subject-out', type: 'data' as NodePortType, label: 'Subject Lines' },
        { id: 'body-out', type: 'data' as NodePortType, label: 'Email Body' },
        { id: 'template-out', type: 'data' as NodePortType, label: 'Email Template' }
      ];
      break;
    case 'analytics':
      outputs = [
        { id: 'insights-out', type: 'data' as NodePortType, label: 'Insights' },
        { id: 'report-out', type: 'data' as NodePortType, label: 'Report' },
        { id: 'recommendations-out', type: 'data' as NodePortType, label: 'Recommendations' }
      ];
      break;
    case 'social':
      outputs = [
        { id: 'posts-out', type: 'data' as NodePortType, label: 'Social Posts' },
        { id: 'hashtags-out', type: 'data' as NodePortType, label: 'Hashtags' },
        { id: 'schedule-out', type: 'data' as NodePortType, label: 'Posting Schedule' }
      ];
      break;
    default:
      outputs = [
        { id: 'data-out', type: 'data' as NodePortType, label: 'Output Data' }
      ];
  }
  
  // All agents have a continuation trigger
  outputs.push({ id: 'next-out', type: 'trigger' as NodePortType, label: 'Next' });
  
  return { inputs, outputs };
};

const EnhancedAgentNode = memo(({ data, ...props }: EnhancedAgentNodeProps) => {
  const agentType = data.nodeType.agentType;
  const { inputs, outputs } = getAgentIO(agentType);
  
  // Use agent data if available, or construct from type
  const label = data.agent?.name || `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`;
  const description = data.description || data.agent?.description || agentDescriptions[agentType];
  
  // Enhance the node data with agent-specific info
  const enhancedData: NodeData = {
    ...data,
    label,
    icon: agentIcons[agentType],
    description,
    inputs,
    outputs,
  };

  return <BaseNode data={enhancedData} variant="agent" {...props} />;
});

export default EnhancedAgentNode;