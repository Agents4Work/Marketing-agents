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
  ReactFlowProvider,
  Panel,
  useReactFlow,
  ReactFlowInstance,
  XYPosition,
  getConnectedEdges,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Agent, AgentType } from '@/lib/agents';
import { nodeTypes, edgeTypes, getNodeTypeForReactFlow } from './NodeRegistry';
import { NodeData, WorkflowNode, WorkflowEdge, NodeCategory, NodePort } from '@/lib/workflowTypes';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Save,
  Play,
  RotateCcw,
  Trash,
  AlertTriangle,
  X,
  Unlink,
  ArrowRight,
  Info
} from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EnhancedCanvasProps {
  agents: Agent[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onSave?: () => void;
  onRun?: () => void;
  onNodeClick?: (nodeData: NodeData) => void;
  onInit?: (instance: ReactFlowInstance) => void;
}

const EnhancedCanvas = ({ 
  agents, 
  initialNodes = [], 
  initialEdges = [],
  onNodesChange: onNodesUpdate,
  onEdgesChange: onEdgesUpdate,
  onSave,
  onRun,
  onNodeClick: externalNodeClickHandler,
  onInit,
}: EnhancedCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [nodeConfigOpen, setNodeConfigOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmEdgeDeleteOpen, setConfirmEdgeDeleteOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Zoom actions
  const { zoomIn, zoomOut, fitView } = useReactFlow();

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

  // Check port type compatibility
  const arePortsCompatible = (sourcePort: string, targetPort: string, sourceNode: Node, targetNode: Node): boolean => {
    // Get the port info from the node data
    const sourcePortInfo = sourceNode.data?.outputs?.find(
      (output: NodePort) => output.id === sourcePort
    );
    
    const targetPortInfo = targetNode.data?.inputs?.find(
      (input: NodePort) => input.id === targetPort
    );
    
    // If we can't find the port info, we can't validate
    if (!sourcePortInfo || !targetPortInfo) {
      console.warn('Cannot validate port compatibility: missing port information');
      return false;
    }
    
    // Define compatibility rules between port types
    // 'data' ports should connect to 'data' ports
    // 'trigger' ports should connect to 'trigger' ports
    // 'control' ports have special compatibility rules
    
    // Basic compatibility: same type can connect
    if (sourcePortInfo.type === targetPortInfo.type) {
      return true;
    }
    
    // Control ports can connect to any other port type (special case)
    if (sourcePortInfo.type === 'control' || targetPortInfo.type === 'control') {
      return true;
    }
    
    // All other combinations are invalid
    return false;
  };

  // Declare validateWorkflow function reference
  const validateWorkflowRef = useRef<() => boolean>(() => true);

  // Handle node connections with improved type safety and validation
  const onConnect = useCallback(
    (params: Connection) => {
      // Validate basic connection parameters
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
        console.warn('Invalid connection: missing source, target, or handle information');
        return;
      }
      
      if (params.source === params.target) {
        console.warn('Invalid connection: cannot connect a node to itself');
        return;
      }
      
      // Find source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) {
        console.warn('Invalid connection: source or target node not found');
        return;
      }
      
      // Validate port compatibility
      const isCompatible = arePortsCompatible(
        params.sourceHandle, 
        params.targetHandle, 
        sourceNode, 
        targetNode
      );
      
      if (!isCompatible) {
        console.warn(`Invalid connection: incompatible ports between "${sourceNode.data?.label}" and "${targetNode.data?.label}"`);
        
        // We could show a UI notification to the user here
        setValidationErrors(prev => [
          ...prev, 
          `Cannot connect incompatible ports: ${sourceNode.data?.label}.${params.sourceHandle} → ${targetNode.data?.label}.${params.targetHandle}`
        ]);
        
        setTimeout(() => {
          // Clear the validation error after a delay
          setValidationErrors(prev => 
            prev.filter(err => !err.includes(`Cannot connect incompatible ports`))
          );
        }, 3000);
        
        return;
      }
      
      // Create a unique ID for the edge
      const edgeId = `edge-${nanoid(6)}`;
      
      // Get detailed port information for better labeling
      const sourcePort = sourceNode.data?.outputs?.find(
        (output: NodePort) => output.id === params.sourceHandle
      );
      
      const targetPort = targetNode.data?.inputs?.find(
        (input: NodePort) => input.id === params.targetHandle
      );
      
      // Create edge label based on connected nodes and ports
      const sourceLabel = sourceNode.data?.label || 'Unknown';
      const targetLabel = targetNode.data?.label || 'Unknown';
      const sourcePortLabel = sourcePort?.label || params.sourceHandle;
      const targetPortLabel = targetPort?.label || params.targetHandle;
      
      const connectionLabel = `${sourceLabel}.${sourcePortLabel} → ${targetLabel}.${targetPortLabel}`;
      
      // Create the edge with custom styling and animation
      const newEdge: Edge = {
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        type: 'custom', // Use our custom edge type
        data: {
          label: connectionLabel,
          sourceNodeType: sourceNode.data?.nodeType,
          targetNodeType: targetNode.data?.nodeType,
          sourceCategory: sourceNode.data?.category,
          targetCategory: targetNode.data?.category,
          sourcePort: sourcePort,
          targetPort: targetPort,
          isSelected: false // Track selection state in the edge data
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Clear any validation errors that might be related to connections
      if (validationErrors.some(err => err.includes('disconnected nodes'))) {
        // Force a workflow validation after adding a new connection
        // This is useful to clear any "disconnected nodes" errors that might have been fixed
        setTimeout(() => {
          if (validateWorkflowRef.current) {
            validateWorkflowRef.current();
          }
        }, 100);
      }
    },
    [nodes, setEdges, validationErrors],
  );

  // Handle drag and drop from panel
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event - create new node
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) {
        console.warn('Cannot create node: ReactFlow is not initialized');
        return;
      }

      // Try to get data from both formats
      const nodeDataJson = event.dataTransfer.getData('application/json') || 
                           event.dataTransfer.getData('application/reactflow');
      
      if (!nodeDataJson) {
        console.warn('No data found in drag event');
        return;
      }
      
      try {
        // Parse the JSON data
        const dragData = JSON.parse(nodeDataJson);
        console.log('Drag data received:', dragData);
        
        // Determine what type of data we received and convert it to NodeData format
        let nodeData: NodeData;
        
        // Check if we're dealing with data from AgentLibrary (AgentData format)
        if (dragData.name && dragData.type && !dragData.category) {
          console.log('Converting AgentData to NodeData format');
          nodeData = {
            // Convert from AgentData to NodeData
            id: dragData.id || `agent-${nanoid(6)}`,
            label: dragData.name,
            description: dragData.description || '',
            icon: dragData.icon,
            category: 'agent',
            nodeType: { type: 'agent', agentType: dragData.type as AgentType },
            inputs: [
              { id: `${dragData.id || 'in'}-${nanoid(4)}`, type: 'data', label: 'Input' }
            ],
            outputs: [
              { id: `${dragData.id || 'out'}-${nanoid(4)}`, type: 'data', label: 'Output' }
            ],
            // Find matching agent from our agents array
            agent: agents.find(a => a.type === dragData.type)
          };
        } 
        // If it's already in NodeData format
        else if (dragData.category && dragData.nodeType) {
          console.log('Using existing NodeData format');
          nodeData = dragData;
        }
        // Fallback - construct basic node data
        else {
          console.log('Using fallback NodeData format');
          nodeData = {
            id: `unknown-${nanoid(6)}`,
            label: dragData.name || dragData.label || 'Unknown Node',
            description: dragData.description || '',
            category: 'agent',
            nodeType: { 
              type: 'agent', 
              agentType: dragData.type as AgentType || 'content'
            },
            inputs: [
              { id: `in-${nanoid(4)}`, type: 'data', label: 'Input' }
            ],
            outputs: [
              { id: `out-${nanoid(4)}`, type: 'data', label: 'Output' }
            ]
          };
        }
        
        // Get position of the drop with proper typing
        const position: XYPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Get the proper React Flow node type based on node category and type
        const nodeType = getNodeTypeForReactFlow(nodeData.category, nodeData.nodeType);
        
        // Create a unique ID based on node category
        const category = nodeData.category;
        const nodeId = `${category}-${nanoid(6)}`;
        
        // Create a new node with explicit Node type
        const newNode: Node<NodeData> = {
          id: nodeId,
          type: nodeType,
          position,
          data: nodeData,
          // Adding defaults
          draggable: true,
          selectable: true,
        };

        console.log('Adding new node to canvas:', newNode);
        
        // Add the node to the canvas
        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Error creating node:', error);
      }
    },
    [reactFlowInstance, setNodes, agents],
  );

  // Handle node click for selection
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    // Reset any selected edges
    setEdges(eds => 
      eds.map(e => {
        if (e.data && e.data.isSelected) {
          return {
            ...e,
            data: {
              ...e.data,
              isSelected: false
            }
          };
        }
        return e;
      })
    );
    
    setSelectedNode(node);
    setSelectedEdge(null); // Clear any selected edge
    
    // Notify external handler if provided
    if (externalNodeClickHandler && node.data) {
      externalNodeClickHandler(node.data);
    }
  };
  
  // Handle edge click for selection
  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    // First, reset any previously selected edges
    setEdges(eds => 
      eds.map(e => {
        if (e.data && e.data.isSelected) {
          return {
            ...e,
            data: {
              ...e.data,
              isSelected: false
            }
          };
        }
        return e;
      })
    );
    
    // Then mark the clicked edge as selected
    setEdges(eds =>
      eds.map(e => {
        if (e.id === edge.id) {
          return {
            ...e,
            data: {
              ...e.data,
              isSelected: true
            }
          };
        }
        return e;
      })
    );
    
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear any selected node
  };

  // Remove selected node
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      // Also remove connected edges
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
      setConfirmDeleteOpen(false);
    }
  }, [selectedNode, setNodes, setEdges]);
  
  // Remove selected edge
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      setConfirmEdgeDeleteOpen(false);
      
      // After deleting an edge, trigger workflow validation to update errors
      setTimeout(() => {
        if (validateWorkflowRef.current) {
          validateWorkflowRef.current();
        }
      }, 100);
    }
  }, [selectedEdge, setEdges]);

  // Validate workflow before running with improved type safety
  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];
    
    // Early validation check if workflow is empty
    if (nodes.length === 0) {
      errors.push('Workflow is empty. Add at least one trigger node to start.');
      setValidationErrors(errors);
      return false;
    }
    
    // Check if there's at least one trigger node
    const triggerNodes = nodes.filter(node => 
      node.type === 'triggerNode' || 
      (node.data?.category === 'trigger')
    );
    
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node.');
    } else if (triggerNodes.length > 1) {
      // This is a business rule - we may want to allow multiple triggers in the future
      errors.push('Workflow should have only one trigger node. Please remove extra trigger nodes.');
    }
    
    // Check for disconnected nodes - build a graph of connected nodes
    const connectedNodeIds = new Set<string>();
    
    // Add all sources and targets from edges to track connected nodes
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    // Find nodes that aren't trigger nodes and aren't connected to any edge
    const disconnectedNodes = nodes.filter(node => 
      node.type !== 'triggerNode' &&
      node.data?.category !== 'trigger' &&
      !connectedNodeIds.has(node.id)
    );
    
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} node(s) are not connected to the workflow.`);
      
      // More specific error information for debugging
      disconnectedNodes.forEach(node => {
        const nodeLabel = node.data?.label || 'Unnamed node';
        errors.push(`- Disconnected node: ${nodeLabel} (${node.id})`);
      });
    }
    
    // Check for output nodes - a workflow should have at least one output
    const hasOutputNode = nodes.some(node => 
      node.type === 'outputNode' || 
      (node.data?.category === 'output')
    );
    
    if (!hasOutputNode) {
      errors.push('Workflow should have at least one output node to produce results.');
    }
    
    // Validate edge connections - ensure all connections are between compatible port types
    // We now have the port compatibility validation in place
    edges.forEach(edge => {
      // Skip edges without handles (shouldn't happen with our UI, but just in case)
      if (!edge.sourceHandle || !edge.targetHandle) return;
      
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Check if this connection is valid using our compatibility function
      const isValid = arePortsCompatible(
        edge.sourceHandle,
        edge.targetHandle,
        sourceNode,
        targetNode
      );
      
      if (!isValid) {
        const sourceLabel = sourceNode.data?.label || 'Unknown';
        const targetLabel = targetNode.data?.label || 'Unknown';
        
        errors.push(`Invalid connection between ${sourceLabel} and ${targetLabel}: incompatible port types.`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [nodes, edges]);
  
  // Update the ref whenever validateWorkflow changes
  useEffect(() => {
    validateWorkflowRef.current = validateWorkflow;
  }, [validateWorkflow]);

  // Handle save action
  const handleSave = useCallback(() => {
    validateWorkflow();
    if (onSave) {
      onSave();
    }
  }, [validateWorkflow, onSave]);

  // Handle run action
  const handleRun = useCallback(() => {
    const isValid = validateWorkflow();
    if (isValid && onRun) {
      onRun();
    }
  }, [validateWorkflow, onRun]);

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          if (onInit) {
            onInit(instance);
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={() => {
          // Reset any selected edges when clicking the canvas background
          setEdges(eds => 
            eds.map(e => {
              if (e.data && e.data.isSelected) {
                return {
                  ...e,
                  data: {
                    ...e.data,
                    isSelected: false
                  }
                };
              }
              return e;
            })
          );
          setSelectedEdge(null);
          setSelectedNode(null);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={'Delete'}
        className="canvas-grid bg-white rounded-lg border border-gray-200 shadow-sm h-full"
      >
        <Controls position="bottom-left" />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="bottom-right"
          nodeBorderRadius={2}
          className="bg-white border shadow-sm rounded-lg"
        />
        <Background 
          color="#e0e7ff" 
          gap={20} 
          size={1.5} 
          variant={BackgroundVariant.Dots} 
          style={{
            opacity: 0.4,
          }}
          className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        />
        
        {/* Premium Control Panel with UI Grouping */}
        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-blue-100 flex gap-2">
          <TooltipProvider delayDuration={400}>
            {/* Zoom Controls Group */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors" 
                    onClick={() => zoomIn()}>
                    <ZoomIn size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-blue-900/90 text-white">Zoom In</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors" 
                    onClick={() => zoomOut()}>
                    <ZoomOut size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-blue-900/90 text-white">Zoom Out</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors" 
                    onClick={() => fitView()}>
                    <Maximize size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-blue-900/90 text-white">Fit View</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Edit/Delete Group */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 transition-colors ${
                      selectedNode 
                        ? "hover:bg-red-50 text-red-500 hover:text-red-600" 
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={!selectedNode}>
                    <Trash size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-red-900/90 text-white">Delete Selected Node</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 transition-colors ${
                      selectedEdge 
                        ? "hover:bg-red-50 text-red-500 hover:text-red-600" 
                        : "text-slate-400 cursor-not-allowed"
                    }`}
                    onClick={() => setConfirmEdgeDeleteOpen(true)}
                    disabled={!selectedEdge}>
                    <Unlink size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-red-900/90 text-white">Delete Selected Connection</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Workflow Actions Group */}
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors" 
                    onClick={handleSave}>
                    <Save size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-blue-900/90 text-white">Save Workflow</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-green-50 hover:text-green-600 transition-colors" 
                    onClick={handleRun}>
                    <Play size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-green-900/90 text-white">Run Workflow</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </Panel>
        
        {/* Premium Validation Errors Panel with Categorization */}
        {validationErrors.length > 0 && (
          <Panel position="bottom-center" className="max-w-xl bg-white/95 backdrop-blur-sm p-4 rounded-t-xl shadow-lg border border-red-200">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-red-700 mb-1.5 flex items-center">
                  <span>Workflow Validation Errors</span>
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {validationErrors.length}
                  </span>
                </h3>
                
                <div className="bg-red-50/80 border border-red-100 rounded-lg p-2.5 max-h-40 overflow-y-auto scrollbar-thin">
                  <ul className="text-xs space-y-2 text-red-600">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span className="flex-1">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs py-1 h-7 bg-white hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={() => validateWorkflow()}
                  >
                    Recheck Workflow
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs py-1 h-7 hover:bg-gray-100 text-gray-600" 
                    onClick={() => setValidationErrors([])}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
      
      {/* Premium Node Delete Confirmation Dialog */}
      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-full">
                <Trash className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-slate-900">Remove Agent Node</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              <div className="mt-3 text-slate-700">
                This will permanently remove the selected agent node and all its connections from your workflow.
              </div>
              
              {selectedNode && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-sm font-medium text-slate-900">Node Details:</div>
                  <div className="mt-1 text-sm text-slate-700">{selectedNode.data?.label}</div>
                  <div className="mt-1 text-xs text-slate-500">Type: {selectedNode.type}</div>
                </div>
              )}
              
              <div className="mt-3 text-amber-600 text-sm flex items-center gap-1.5">
                <AlertTriangle size={16} />
                This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNode}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Node
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Premium Edge Delete Confirmation Dialog */}
      <AlertDialog
        open={confirmEdgeDeleteOpen}
        onOpenChange={setConfirmEdgeDeleteOpen}
      >
        <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-full">
                <Unlink className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-slate-900">Delete Connection</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {selectedEdge && (
                <div className="space-y-3 mt-3">
                  <div className="text-slate-700">
                    Are you sure you want to delete this connection between agents?
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                    <div className="flex gap-3 items-center">
                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="font-medium text-slate-900">Connection Details</div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-slate-900 font-medium">
                          Connection: <span className="font-normal text-slate-700">{selectedEdge.data?.label || 'Unnamed connection'}</span>
                        </div>
                        
                        {selectedEdge.source && selectedEdge.target && (
                          <div className="p-2 bg-white rounded-md border border-slate-200 mt-1">
                            <div className="text-xs text-slate-500 mb-2">Data Flow:</div>
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <div className="px-3 py-2 bg-blue-50 text-blue-800 rounded border border-blue-100 font-medium flex-1 text-center">
                                {nodes.find(n => n.id === selectedEdge.source)?.data?.label || 'Source'}
                              </div>
                              <div className="flex flex-col items-center">
                                <ArrowRight size={14} className="text-slate-400" />
                                <span className="text-[10px] text-slate-400 mt-0.5">sends data to</span>
                              </div>
                              <div className="px-3 py-2 bg-green-50 text-green-800 rounded border border-green-100 font-medium flex-1 text-center">
                                {nodes.find(n => n.id === selectedEdge.target)?.data?.label || 'Target'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-amber-600 text-sm flex items-center gap-1.5 mt-1">
                    <AlertTriangle size={16} />
                    Removing this connection may affect the workflow validation.
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEdge}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Delete Connection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Wrap with ReactFlowProvider for using outside of ReactFlow context
const EnhancedCanvasWithProvider = (props: EnhancedCanvasProps) => (
  <ReactFlowProvider>
    <EnhancedCanvas {...props} />
  </ReactFlowProvider>
);

export default EnhancedCanvasWithProvider;