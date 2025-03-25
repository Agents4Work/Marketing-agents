import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Agent } from '@/lib/agents';
import AgentNode from './AgentNode';
import { nanoid } from 'nanoid';

// Custom node types
const nodeTypes = {
  agentNode: AgentNode,
};

interface CanvasProps {
  agents: Agent[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

const Canvas = ({ 
  agents, 
  initialNodes = [], 
  initialEdges = [],
  onNodesChange: onNodesUpdate,
  onEdgesChange: onEdgesUpdate,
}: CanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Update parent component when nodes or edges change
  useEffect(() => {
    if (onNodesUpdate) {
      onNodesUpdate(nodes);
    }
  }, [nodes, onNodesUpdate]);

  useEffect(() => {
    if (onEdgesUpdate) {
      onEdgesUpdate(edges);
    }
  }, [edges, onEdgesUpdate]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params, 
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      type: 'smoothstep',
    }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      const agentData = event.dataTransfer.getData('application/reactflow');
      
      if (!agentData) return;
      
      const agent = JSON.parse(agentData) as Agent;
      
      // Get position of the drop
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a new node
      const newNode = {
        id: `${agent.type}-${nanoid(6)}`,
        type: 'agentNode',
        position,
        data: { agent, label: agent.name },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="canvas-grid bg-white rounded-lg border border-gray-200 shadow-sm h-full relative"
      >
        <Controls />
        <MiniMap />
        <Background color="#e5e7eb" gap={25} size={1} />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
