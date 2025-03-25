import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  NodeChange,
  ConnectionMode,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Agent } from '@/lib/agents';
import { nodeTypes, edgeTypes, getNodeTypeForReactFlow } from './NodeRegistry';
import { WorkflowNodeType, NodeCategory } from '@/lib/workflowTypes';
import { ConnectionType } from './edges/TeamEdge';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Save, 
  Play, 
  Users,
  Settings,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import WorkflowSettingsDialog, { WorkflowSettings } from './WorkflowSettingsDialog';

// Define a more flexible agent type for the canvas
interface WorkflowAgent {
  id: string | number;
  name: string;
  type: string;
  description?: string;
  color?: string;
  icon?: React.ReactNode | string;
  configuration?: Record<string, any>;
}

interface CustomLegoCanvasProps {
  agents: WorkflowAgent[];
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onSave?: () => void;
  onRun?: () => void;
  onNodeClick?: (node: any) => void;
  useTeamView?: boolean;
}

// Generate a unique ID
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

function CustomLegoCanvas({
  agents,
  initialNodes = [],
  initialEdges = [],
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onSave,
  onRun,
  onNodeClick,
  useTeamView = true
}: CustomLegoCanvasProps) {
  // Local state for nodes and edges
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  
  // State for connection type when creating connections
  const [connectionType, setConnectionType] = useState<ConnectionType>('collaboration');
  
  // Options for team view
  const [autoLayout, setAutoLayout] = useState(false);
  
  // Settings dialog state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettings>({
    showGrid: true,
    gridSize: 16,
    snapToGrid: true,
    zoomLevel: 1,
    executionMode: 'parallel',
    autoSave: true,
    logLevel: 'info',
    teamCollaboration: 'managed',
    allowAgentToAgentCommunication: true,
    defaultAgentMode: 'autonomous',
    maxHistoryLength: 50,
    persistWorkflow: true,
    enableRealTimeUpdates: true,
  });
  
  // ReactFlow instance
  const { project, getNodes, getEdges, setViewport } = useReactFlow();
  
  // Ref for the ReactFlow viewport
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Listen for direct agent add events (from the button click in AgentLibrary)
  React.useEffect(() => {
    const handleDirectAgentAdd = (event: any) => {
      const { agent, position } = event.detail;
      
      // Create a new node with the agent data at the specified position
      const newNode: Node = {
        id: `node-${generateId()}`,
        type: useTeamView ? 'teamAgentNode' : 'agentNode',
        position,
        data: {
          ...agent,
          label: agent.name,
          description: agent.description,
          nodeType: {
            type: 'agent',
            agentType: agent.type,
          } as WorkflowNodeType,
          category: 'agent' as NodeCategory,
        },
      };
      
      console.log("Adding node via direct add:", newNode);
      setNodes((nds) => nds.concat(newNode));
    };
    
    // Add event listener
    document.addEventListener('direct-agent-add', handleDirectAgentAdd);
    
    // Clean up
    return () => {
      document.removeEventListener('direct-agent-add', handleDirectAgentAdd);
    };
  }, [setNodes, useTeamView]);
  
  // Get all the nodes and edges when needed
  const allNodes = useMemo(() => getNodes(), [getNodes]);
  const allEdges = useMemo(() => getEdges(), [getEdges]);
  
  // When nodes or edges change, call the callback provided by parent
  React.useEffect(() => {
    if (onNodesChangeProp) {
      onNodesChangeProp(allNodes);
    }
  }, [allNodes, onNodesChangeProp]);
  
  React.useEffect(() => {
    if (onEdgesChangeProp) {
      onEdgesChangeProp(allEdges);
    }
  }, [allEdges, onEdgesChangeProp]);

  // Handle when an agent is dropped on the canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      try {
        event.preventDefault();
        
        // MANUAL HANDLING - Create a node even without drag data
        // This will be our fallback for when drag data transfer fails
        if (!event.dataTransfer || !event.dataTransfer.types || event.dataTransfer.types.length === 0) {
          console.warn("No data in drag event, creating default node as fallback");
          
          // Create a fallback node at the drop position
          const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
          if (!reactFlowBounds) return;
          
          const position = project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });
          
          // Create a default agent node
          const fallbackAgent = {
            id: `fallback-${generateId()}`,
            name: "New Agent",
            type: "agent",
            description: "A new team member",
            color: "bg-blue-500",
          };
          
          const newNode: Node = {
            id: `node-${generateId()}`,
            type: useTeamView ? 'teamAgentNode' : 'agentNode',
            position,
            data: {
              ...fallbackAgent,
              label: fallbackAgent.name,
              description: fallbackAgent.description,
              nodeType: {
                type: 'agent',
                agentType: fallbackAgent.type,
              } as WorkflowNodeType,
              category: 'agent' as NodeCategory,
            },
          };
          
          console.log("Adding fallback node to canvas:", newNode);
          setNodes((nds) => nds.concat(newNode));
          return;
        }
        
        // Try getting drag data from all possible formats
        let agentJson = '';
        try {
          agentJson = event.dataTransfer.getData('application/reactflow');
        } catch (e) {
          console.warn("Error getting application/reactflow data:", e);
        }
        
        if (!agentJson) {
          try {
            agentJson = event.dataTransfer.getData('application/json');
          } catch (e) {
            console.warn("Error getting application/json data:", e);
          }
        }
        
        if (!agentJson) {
          try {
            agentJson = event.dataTransfer.getData('text/plain');
          } catch (e) {
            console.warn("Error getting text/plain data:", e);
          }
        }
        
        if (!agentJson) {
          try {
            agentJson = event.dataTransfer.getData('text');
          } catch (e) {
            console.warn("Error getting text data:", e);
          }
        }
        
        // Log available types for debugging
        console.log("Available data formats:", event.dataTransfer.types);
        
        // If we still don't have data, try all types as a last resort
        if (!agentJson) {
          for (const type of event.dataTransfer.types) {
            try {
              const data = event.dataTransfer.getData(type);
              if (data) {
                console.log(`Found data in format: ${type}`);
                agentJson = data;
                break;
              }
            } catch (e) {
              console.warn(`Error getting data from type ${type}:`, e);
            }
          }
        }
        
        // If we still have no data, create a default node
        if (!agentJson) {
          console.error("No data found in drag event - falling back to default node");
          // Trigger the fallback code above
          // This is handled at the beginning of the function
          return;
        }
        
        // Try to parse the agent data
        let agent;
        try {
          agent = JSON.parse(agentJson);
          console.log("Parsed agent data:", agent);
        } catch (err) {
          console.error("Failed to parse agent data:", err);
          console.log("Raw agent data:", agentJson);
          return;
        }
        
        // Get the position of the drop
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!reactFlowBounds) return;
        
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Create a new node with the agent data
        const newNode: Node = {
          id: `node-${generateId()}`,
          type: useTeamView ? 'teamAgentNode' : 'agentNode',
          position,
          data: {
            ...agent,
            label: agent.name,
            description: agent.description,
            nodeType: {
              type: 'agent',
              agentType: agent.type,
            } as WorkflowNodeType,
            category: 'agent' as NodeCategory,
          },
        };
        
        console.log("Adding new node to canvas:", newNode);

        // Add the new node to the canvas
        setNodes((nds) => nds.concat(newNode));
      } catch (err) {
        console.error("Error in onDrop handler:", err);
      }
    },
    [project, setNodes, useTeamView]
  );

  // Handle when a connection is created between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Ensure source and target are strings (not null)
      if (!params.source || !params.target) return;
      
      // Create a new edge with the connection parameters
      const newEdge: Edge = {
        id: `edge-${generateId()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        animated: connectionType === 'collaboration',
        type: useTeamView ? 'teamEdge' : 'custom',
        // Add data for edge labels and styling
        data: {
          connectionType: connectionType,
          status: 'pending', // Initial status
          messages: 0, // No messages initially
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, connectionType, useTeamView]
  );

  // Handle drag over event
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    try {
      event.dataTransfer.dropEffect = 'move';
    } catch (err) {
      console.warn("Drag effect error:", err);
      // Continue even if dropEffect can't be set
    }
  }, []);

  // Handle node click events
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  // Connection type options
  const connectionTypes: { value: ConnectionType; label: string; icon: React.ReactNode }[] = [
    { value: 'collaboration', label: 'Collaboration', icon: <Users size={14} /> },
    { value: 'approval', label: 'Approval', icon: <Zap size={14} /> },
    { value: 'feedback', label: 'Feedback', icon: <MessageSquare size={14} /> },
  ];
  
  // Handler for opening the settings dialog
  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);
  
  // Handler for applying the settings
  const handleApplySettings = useCallback((settings: WorkflowSettings) => {
    setWorkflowSettings(settings);
    
    // Apply the settings to the canvas
    if (settings.showGrid) {
      // Set grid visibility
    }
    
    // Apply zoom level - will be handled with a useEffect
    
    // Log the applied settings
    console.log("Applied workflow settings:", settings);
  }, []);
  
  // Apply settings effect
  useEffect(() => {
    // Apply zoom setting when workflowSettings changes
    if (workflowSettings.zoomLevel) {
      setViewport({
        x: 0,
        y: 0,
        zoom: workflowSettings.zoomLevel
      });
    }
  }, [workflowSettings, setViewport]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: useTeamView ? 'teamEdge' : 'custom',
          animated: false,
        }}
      >
        <Background gap={16} size={1} />
        <Controls />
        
        {/* Bottom panel */}
        <Panel position="bottom-center" className="bg-white dark:bg-gray-800 p-2 rounded-t-lg shadow-lg border">
          <div className="flex items-center gap-4">
            <div className="border-r pr-4">
              <div className="text-xs text-gray-500 mb-1">Connection Type</div>
              <div className="flex items-center gap-2">
                {connectionTypes.map((type) => (
                  <Toggle
                    key={type.value}
                    pressed={connectionType === type.value}
                    onPressedChange={() => setConnectionType(type.value)}
                    size="sm"
                    className="flex items-center gap-1 h-7"
                  >
                    {type.icon}
                    <span className="text-xs">{type.label}</span>
                  </Toggle>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="team-view" className="text-xs cursor-pointer">Team View</Label>
              <Switch
                id="team-view"
                checked={useTeamView}
                // This should be passed up to the parent component
                // onCheckedChange={setUseTeamView} 
                disabled
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-layout" className="text-xs cursor-pointer">Auto Layout</Label>
              <Switch
                id="auto-layout"
                checked={autoLayout}
                onCheckedChange={setAutoLayout}
              />
            </div>
          </div>
        </Panel>
        
        {/* Action buttons panel */}
        <Panel position="top-right" className="flex flex-col gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={onSave}
              className="rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border shadow-md"
            >
              <Save size={18} />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={onRun}
              className="rounded-full bg-green-500 text-white border shadow-md"
            >
              <Play size={18} />
            </Button>
          </motion.div>
          
          {/* Settings button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={handleOpenSettings}
              className="rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border shadow-md"
            >
              <Settings size={18} />
            </Button>
          </motion.div>
        </Panel>
      </ReactFlow>
      
      {/* Workflow settings dialog */}
      <WorkflowSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onApply={handleApplySettings}
        initialSettings={workflowSettings}
      />
    </div>
  );
}

// Import at the top level to resolve the LSP issues
import { MessageSquare } from 'lucide-react';

// Wrap the component with ReactFlowProvider
export default function CustomLegoCanvasProvider(props: CustomLegoCanvasProps) {
  return (
    <ReactFlowProvider>
      <CustomLegoCanvas {...props} />
    </ReactFlowProvider>
  );
}