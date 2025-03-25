import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { 
  Globe, 
  Database, 
  BellRing, 
  FileDown, 
  FileText 
} from 'lucide-react';
import { NodeData, NodePort, OutputType } from '@/lib/workflowTypes';

interface OutputNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'output', outputType: OutputType };
  };
}

// Icons for different output types
const outputIcons = {
  api: <Globe className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  notification: <BellRing className="h-4 w-4" />,
  export: <FileDown className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
};

// Descriptions for output types
const outputDescriptions = {
  api: 'Send data to an external API',
  database: 'Store data in a database',
  notification: 'Send notification to users or systems',
  export: 'Export data to downloadable format',
  file: 'Save results to a file',
};

// Define input ports for different output types
const getOutputIO = (outputType: OutputType): { inputs: NodePort[], outputs: NodePort[] } => {
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

  // All output nodes have similar inputs
  const defaultInputs: NodePort[] = [
    createPort('trigger-in', 'trigger', 'Trigger'),
    createPort('data-in', 'data', 'Input Data')
  ];
  
  // Outputs might vary slightly
  let inputs: NodePort[];
  let outputs: NodePort[] = []; // Output nodes usually don't have output ports
  
  switch (outputType) {
    case 'api':
      inputs = [
        ...defaultInputs,
        createPort('headers-in', 'data', 'Headers')
      ];
      // API nodes can output the response
      outputs = [
        createPort('response-out', 'data', 'API Response'),
        createPort('next-out', 'trigger', 'Next')
      ];
      break;
    case 'notification':
      inputs = [
        ...defaultInputs,
        createPort('recipients-in', 'data', 'Recipients')
      ];
      outputs = [
        createPort('status-out', 'data', 'Delivery Status'),
        createPort('next-out', 'trigger', 'Next')
      ];
      break;
    default:
      inputs = defaultInputs;
      outputs = [
        createPort('next-out', 'trigger', 'Next')
      ];
  }
  
  return { inputs, outputs };
};

const OutputNode = memo(({ data, ...props }: OutputNodeProps) => {
  const outputType = data.nodeType.outputType;
  const { inputs, outputs } = getOutputIO(outputType);
  
  // Enhance the node data with output-specific info
  const enhancedData: NodeData = {
    ...data,
    icon: outputIcons[outputType],
    description: data.description || outputDescriptions[outputType],
    inputs,
    outputs,
  };

  return <BaseNode data={enhancedData} variant="output" {...props} />;
});

export default OutputNode;