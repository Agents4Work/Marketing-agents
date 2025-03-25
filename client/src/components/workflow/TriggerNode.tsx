import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { CalendarDays, Clock, Globe, FileInput, BellRing } from 'lucide-react';
import { NodeData, TriggerType, NodePort } from '@/lib/workflowTypes';

interface TriggerNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'trigger', triggerType: TriggerType };
  };
}

// Icons for different trigger types
const triggerIcons = {
  schedule: <CalendarDays className="h-4 w-4" />,
  webhook: <Globe className="h-4 w-4" />,
  form: <FileInput className="h-4 w-4" />,
  event: <BellRing className="h-4 w-4" />,
  manual: <Clock className="h-4 w-4" />,
};

// Descriptions for trigger types
const triggerDescriptions = {
  schedule: 'Run on a schedule (cron)',
  webhook: 'Triggered by an external API call',
  form: 'Triggered by form submission',
  event: 'Triggered by system event',
  manual: 'Manually triggered workflow',
};

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

// Get trigger-specific inputs and outputs
const getTriggerIO = (triggerType: TriggerType): { inputs: NodePort[], outputs: NodePort[] } => {
  // Most triggers don't have inputs
  const inputs: NodePort[] = [];
  
  // All triggers have standard outputs
  const outputs: NodePort[] = [
    createPort('trigger-out', 'trigger', 'Trigger'),
    createPort('data-out', 'data', 'Output')
  ];
  
  // Add specific outputs based on trigger type
  switch (triggerType) {
    case 'webhook':
      outputs.push(createPort('payload-out', 'data', 'Payload'));
      outputs.push(createPort('headers-out', 'data', 'Headers'));
      break;
    case 'form':
      outputs.push(createPort('form-data-out', 'data', 'Form Data'));
      break;
    case 'event':
      outputs.push(createPort('event-data-out', 'data', 'Event Data'));
      break;
    case 'schedule':
      outputs.push(createPort('schedule-info-out', 'data', 'Schedule Info'));
      break;
    // Manual trigger just uses the standard outputs
  }
  
  return { inputs, outputs };
};

const TriggerNode = memo(({ data, ...props }: TriggerNodeProps) => {
  const triggerType = data.nodeType.triggerType;
  const { inputs, outputs } = getTriggerIO(triggerType);
  
  // Enhance the node data with trigger-specific info
  const enhancedData: NodeData = {
    ...data,
    icon: triggerIcons[triggerType],
    description: data.description || triggerDescriptions[triggerType],
    inputs,
    outputs
  };

  return <BaseNode data={enhancedData} variant="trigger" {...props} />;
});

export default TriggerNode;