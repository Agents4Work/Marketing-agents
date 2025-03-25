import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { 
  Filter, 
  Layers, 
  Pencil, 
  ShieldCheck, 
  BarChart 
} from 'lucide-react';
import { NodeData, DataNodeType, NodePort } from '@/lib/workflowTypes';

interface DataNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'data', dataType: DataNodeType };
  };
}

// Icons for different data node types
const dataIcons = {
  transform: <Layers className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
  map: <Pencil className="h-4 w-4" />,
  enrich: <ShieldCheck className="h-4 w-4" />,
  validate: <ShieldCheck className="h-4 w-4" />,
  aggregate: <BarChart className="h-4 w-4" />,
};

// Descriptions for data node types
const dataDescriptions = {
  transform: 'Transform data structure or format',
  filter: 'Filter data based on conditions',
  map: 'Map values to a new structure',
  enrich: 'Add additional data from external sources',
  validate: 'Validate data against schema or rules',
  aggregate: 'Combine multiple data sources',
};

// Define input/output ports for different data node types
const getDataIO = (dataType: DataNodeType): { inputs: NodePort[], outputs: NodePort[] } => {
  // Create ports with proper typing
  const createPort = (
    id: string, 
    type: 'data' | 'control' | 'trigger', 
    label: string
  ): NodePort => ({
    id,
    type,
    label
  });

  // Default ports
  const defaultInputs: NodePort[] = [
    createPort('trigger-in', 'trigger', 'Trigger'),
    createPort('data-in', 'data', 'Input Data')
  ];
  
  const defaultOutputs: NodePort[] = [
    createPort('trigger-out', 'trigger', 'Next'),
    createPort('data-out', 'data', 'Output Data')
  ];
  
  switch (dataType) {
    case 'filter':
      return {
        inputs: defaultInputs,
        outputs: [
          createPort('match-out', 'data', 'Matches'),
          createPort('nomatch-out', 'data', 'Non-Matches'),
          createPort('trigger-out', 'trigger', 'Next')
        ]
      };
    case 'aggregate':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Trigger'),
          createPort('data1-in', 'data', 'Data Source 1'),
          createPort('data2-in', 'data', 'Data Source 2')
        ],
        outputs: defaultOutputs
      };
    case 'map':
      return {
        inputs: defaultInputs,
        outputs: [
          createPort('trigger-out', 'trigger', 'Next'),
          createPort('mapped-out', 'data', 'Mapped Data'),
          createPort('original-out', 'data', 'Original Data')
        ]
      };
    default:
      return {
        inputs: defaultInputs,
        outputs: defaultOutputs
      };
  }
};

const DataNode = memo(({ data, ...props }: DataNodeProps) => {
  const dataType = data.nodeType.dataType;
  const { inputs, outputs } = getDataIO(dataType);
  
  // Enhance the node data with data-specific info
  const enhancedData: NodeData = {
    ...data,
    icon: dataIcons[dataType],
    description: data.description || dataDescriptions[dataType],
    inputs,
    outputs,
  };

  return <BaseNode data={enhancedData} variant="action" {...props} />;
});

export default DataNode;