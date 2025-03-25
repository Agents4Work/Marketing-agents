import { memo } from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { 
  GitBranch, 
  Fingerprint, 
  Clock, 
  RotateCcw,
  SplitSquareVertical 
} from 'lucide-react';
import { NodeData, LogicNodeType, NodePort } from '@/lib/workflowTypes';

interface LogicNodeProps extends NodeProps {
  data: NodeData & {
    nodeType: { type: 'logic', logicType: LogicNodeType };
  };
}

// Icons for different logic types
const logicIcons = {
  condition: <GitBranch className="h-4 w-4" />,
  switch: <SplitSquareVertical className="h-4 w-4" />,
  delay: <Clock className="h-4 w-4" />,
  loop: <RotateCcw className="h-4 w-4" />,
  parallel: <Fingerprint className="h-4 w-4" />,
};

// Descriptions for logic types
const logicDescriptions = {
  condition: 'Branch workflow based on condition',
  switch: 'Multi-way branching based on value',
  delay: 'Pause workflow execution',
  loop: 'Repeat workflow for each item',
  parallel: 'Run branches in parallel',
};

// Define input/output ports for different logic types
const getLogicIO = (logicType: LogicNodeType): { inputs: NodePort[], outputs: NodePort[] } => {
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
  
  switch (logicType) {
    case 'condition':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Input'),
          createPort('data-in', 'data', 'Data')
        ],
        outputs: [
          createPort('true-out', 'trigger', 'True'),
          createPort('false-out', 'trigger', 'False')
        ]
      };
    case 'switch':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Input'),
          createPort('data-in', 'data', 'Data')
        ],
        outputs: [
          createPort('case1-out', 'trigger', 'Case 1'),
          createPort('case2-out', 'trigger', 'Case 2'),
          createPort('default-out', 'trigger', 'Default')
        ]
      };
    case 'delay':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Input')
        ],
        outputs: [
          createPort('trigger-out', 'trigger', 'Output')
        ]
      };
    case 'loop':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Input'),
          createPort('items-in', 'data', 'Items')
        ],
        outputs: [
          createPort('item-out', 'trigger', 'Item'),
          createPort('complete-out', 'trigger', 'Complete')
        ]
      };
    case 'parallel':
      return {
        inputs: [
          createPort('trigger-in', 'trigger', 'Input')
        ],
        outputs: [
          createPort('branch1-out', 'trigger', 'Branch 1'),
          createPort('branch2-out', 'trigger', 'Branch 2'),
          createPort('branch3-out', 'trigger', 'Branch 3')
        ]
      };
    default:
      return {
        inputs: [createPort('trigger-in', 'trigger', 'Input')],
        outputs: [createPort('trigger-out', 'trigger', 'Output')]
      };
  }
};

const LogicNode = memo(({ data, ...props }: LogicNodeProps) => {
  const logicType = data.nodeType.logicType;
  const { inputs, outputs } = getLogicIO(logicType);
  
  // Enhance the node data with logic-specific info
  const enhancedData: NodeData = {
    ...data,
    icon: logicIcons[logicType],
    description: data.description || logicDescriptions[logicType],
    inputs,
    outputs,
  };

  return <BaseNode data={enhancedData} variant="logic" {...props} />;
});

export default LogicNode;