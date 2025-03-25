import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Info, HelpCircle, AlertCircle, CheckCircle, BookOpen, Settings, Activity } from 'lucide-react';
import { AgentData, LegoNode, LegoConnection } from './types';

// Tooltip types for different workflow elements
export type TooltipType = 
  | 'connect_nodes' // When nodes should be connected
  | 'add_agent' // When canvas is empty
  | 'agent_capabilities' // Information about agent capabilities
  | 'connection_type' // Information about a connection
  | 'workflow_activation' // Information about activating the workflow
  | 'agent_configuration' // Information about configuring an agent
  | 'empty_canvas' // Empty canvas
  | 'first_time_user' // Tutorial for new users
  | 'new_feature'; // Highlight new features

// Context associated with tooltips based on workflow state
export interface TooltipState {
  nodeCount: number;
  connectionCount: number;
  isFirstVisit: boolean;
  lastActiveDate?: Date;
  hasRun: boolean;
  // Mapping of element IDs to shown tooltip contents
  shownTooltips: Record<string, boolean>;
}

// Context for the tooltip manager
interface TooltipContextType {
  tooltipState: TooltipState;
  // Update tooltip state
  updateTooltipState: (updates: Partial<TooltipState>) => void;
  // Mark a tooltip as shown
  markTooltipAsShown: (id: string) => void;
  // Check if a tooltip has already been shown
  hasTooltipBeenShown: (id: string) => boolean;
  // Method to get tooltip for a specific node
  getNodeTooltip: (node: LegoNode) => {
    content: React.ReactNode;
    icon?: React.ReactNode;
    position: "top" | "right" | "bottom" | "left";
    highlight: boolean;
    color: string;
  } | null;
  // Method to get tooltip for a specific connection
  getConnectionTooltip: (connection: LegoConnection, sourceNode?: LegoNode, targetNode?: LegoNode) => {
    content: React.ReactNode;
    position: "top" | "right" | "bottom" | "left";
    highlight: boolean;
    color: string;
  } | null;
  // Get contextual tooltips based on current state
  getContextualTooltip: (type: TooltipType) => {
    content: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    highlight: boolean;
    actions?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    }[];
  } | null;
}

// Create the context
const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Initial state for the tooltip manager
const initialTooltipState: TooltipState = {
  nodeCount: 0,
  connectionCount: 0,
  isFirstVisit: true,
  hasRun: false,
  shownTooltips: {}
};

// Context provider
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>(() => {
    // Try to load tooltip state from localStorage
    try {
      const savedState = localStorage.getItem('workflow_tooltip_state');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading tooltip state:', error);
    }
    return initialTooltipState;
  });

  // Save tooltip state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('workflow_tooltip_state', JSON.stringify(tooltipState));
    } catch (error) {
      console.error('Error saving tooltip state:', error);
    }
  }, [tooltipState]);

  // Update tooltip state
  const updateTooltipState = useCallback((updates: Partial<TooltipState>) => {
    setTooltipState(prev => ({ ...prev, ...updates }));
  }, []);

  // Mark a tooltip as shown
  const markTooltipAsShown = useCallback((id: string) => {
    setTooltipState(prev => ({
      ...prev,
      shownTooltips: {
        ...prev.shownTooltips,
        [id]: true
      }
    }));
  }, []);

  // Check if a tooltip has already been shown
  const hasTooltipBeenShown = useCallback((id: string) => {
    return !!tooltipState.shownTooltips[id];
  }, [tooltipState.shownTooltips]);

  // Get tooltips for a specific node
  const getNodeTooltip = useCallback((node: LegoNode) => {
    // If it's the first time this agent is shown, display a highlighted tooltip
    const isFirstTimeShown = !hasTooltipBeenShown(`agent_${node.data.type}`);
    
    // Determine the color based on the agent type
    const color = node.data.color || 'bg-blue-500';
    
    // Decide which tooltip to show based on criteria
    if (isFirstTimeShown) {
      markTooltipAsShown(`agent_${node.data.type}`);
      
      return {
        content: (
          <div>
            <p className="font-bold mb-1">{node.data.name}</p>
            <p className="text-sm">{node.data.description}</p>
            <p className="text-xs mt-2 opacity-80">Tip: Drag to move, click to select</p>
          </div>
        ),
        icon: <Info size={18} />,
        position: "top" as const,
        highlight: true,
        color
      };
    }
    
    // For experienced users, show more subtle tooltips
    if (tooltipState.nodeCount > 5 && Math.random() > 0.7) {
      return {
        content: `Optimize your ${node.data.name} with advanced settings`,
        position: "bottom" as const,
        highlight: false,
        color
      };
    }
    
    return null;
  }, [tooltipState.nodeCount, hasTooltipBeenShown, markTooltipAsShown]);

  // Get tooltips for a specific connection
  const getConnectionTooltip = useCallback((
    connection: LegoConnection, 
    sourceNode?: LegoNode, 
    targetNode?: LegoNode
  ) => {
    // If we don't have source and target nodes, don't show tooltip
    if (!sourceNode || !targetNode) return null;
    
    // For the first connection, show an informative tooltip
    if (tooltipState.connectionCount <= 1 && !hasTooltipBeenShown('first_connection')) {
      markTooltipAsShown('first_connection');
      
      return {
        content: `Excellent! You've connected ${sourceNode.data.name} with ${targetNode.data.name}. These agents will work together.`,
        position: "top" as const,
        highlight: true,
        color: "bg-green-500"
      };
    }
    
    // For connections between specific agent types, show synergy tooltips
    const sourceType = sourceNode.data.type;
    const targetType = targetNode.data.type;
    const connectionKey = `${sourceType}_to_${targetType}`;
    
    if (!hasTooltipBeenShown(connectionKey)) {
      markTooltipAsShown(connectionKey);
      
      // Determine the synergy message based on agent types
      let synergyMessage = "";
      
      if ((sourceType === 'creative' && targetType === 'social') || 
          (sourceType === 'social' && targetType === 'creative')) {
        synergyMessage = "Synergy: Creative content optimized for social media";
      } else if ((sourceType === 'seo' && targetType === 'content') || 
                (sourceType === 'content' && targetType === 'seo')) {
        synergyMessage = "Synergy: Content optimized for search engines";
      } else if ((sourceType === 'analytics' && targetType === 'strategy') || 
                (sourceType === 'strategy' && targetType === 'analytics')) {
        synergyMessage = "Synergy: Data-driven strategies for better results";
      } else {
        // For other combinations, show a generic message
        synergyMessage = "These agents will work together to improve your results";
      }
      
      return {
        content: synergyMessage,
        position: "bottom" as const,
        highlight: true,
        color: "bg-purple-500"
      };
    }
    
    return null;
  }, [tooltipState.connectionCount, hasTooltipBeenShown, markTooltipAsShown]);

  // Get contextual tooltips based on current state
  const getContextualTooltip = useCallback((type: TooltipType) => {
    switch (type) {
      case 'empty_canvas':
        if (tooltipState.nodeCount === 0 && !hasTooltipBeenShown('empty_canvas')) {
          markTooltipAsShown('empty_canvas');
          return {
            content: "Drag agents from the left panel to start building your agent workflow",
            icon: <HelpCircle size={18} />,
            color: "bg-blue-500",
            highlight: true,
            actions: [
              {
                label: "Got it",
                onClick: () => markTooltipAsShown('empty_canvas_dismissed'),
                icon: <CheckCircle size={14} />
              }
            ]
          };
        }
        break;
        
      case 'connect_nodes':
        if (tooltipState.nodeCount >= 2 && tooltipState.connectionCount === 0 && !hasTooltipBeenShown('connect_nodes')) {
          markTooltipAsShown('connect_nodes');
          return {
            content: "Connect your agents! Click on one agent and then on another to establish a connection",
            icon: <Info size={18} />,
            color: "bg-amber-500",
            highlight: true
          };
        }
        break;
        
      case 'workflow_activation':
        if (tooltipState.nodeCount >= 2 && tooltipState.connectionCount >= 1 && !tooltipState.hasRun && !hasTooltipBeenShown('workflow_activation')) {
          markTooltipAsShown('workflow_activation');
          return {
            content: "Your agent workflow is ready to activate. Click 'Activate Workflow' to put the agents to work",
            icon: <Activity size={18} />,
            color: "bg-green-500",
            highlight: true
          };
        }
        break;
        
      case 'first_time_user':
        if (tooltipState.isFirstVisit && !hasTooltipBeenShown('first_time_user')) {
          markTooltipAsShown('first_time_user');
          return {
            content: (
              <div>
                <p className="font-bold">Welcome to the Agent Workflow Builder!</p>
                <p className="text-sm mt-1">Here you can create workflows of AI agents that work together like LEGO blocks.</p>
                <ol className="text-xs mt-2 list-decimal list-inside">
                  <li>Drag agents from the left</li>
                  <li>Connect agents by clicking on them</li>
                  <li>Activate your workflow with the green button</li>
                </ol>
              </div>
            ),
            icon: <BookOpen size={18} />,
            color: "bg-indigo-500",
            highlight: true,
            actions: [
              {
                label: "Start",
                onClick: () => markTooltipAsShown('first_time_tutorial_completed'),
                icon: <CheckCircle size={14} />
              }
            ]
          };
        }
        break;
        
      case 'new_feature':
        // Detect if there are new features since the last visit
        const isNewFeatureAvailable = new Date().getTime() - (tooltipState.lastActiveDate?.getTime() || 0) > 7 * 24 * 60 * 60 * 1000;
        if (isNewFeatureAvailable && !hasTooltipBeenShown('new_feature_march_2025')) {
          markTooltipAsShown('new_feature_march_2025');
          return {
            content: (
              <div>
                <p className="font-bold">New features available!</p>
                <p className="text-sm mt-1">Now you can:</p>
                <ul className="text-xs mt-1 list-disc list-inside">
                  <li>Configure your agents with more options</li>
                  <li>Use pre-designed agent workflow templates</li>
                  <li>View analytics on your workflow performance</li>
                </ul>
              </div>
            ),
            icon: <AlertCircle size={18} />,
            color: "bg-pink-500",
            highlight: true
          };
        }
        break;
      
      case 'agent_configuration':
        if (!hasTooltipBeenShown('agent_configuration') && tooltipState.nodeCount > 0) {
          markTooltipAsShown('agent_configuration');
          return {
            content: "Select an agent and click 'Configure' to customize its behavior",
            icon: <Settings size={18} />,
            color: "bg-orange-500",
            highlight: false
          };
        }
        break;
    }
    
    return null;
  }, [tooltipState, hasTooltipBeenShown, markTooltipAsShown]);

  // Context value
  const contextValue: TooltipContextType = {
    tooltipState,
    updateTooltipState,
    markTooltipAsShown,
    hasTooltipBeenShown,
    getNodeTooltip,
    getConnectionTooltip,
    getContextualTooltip
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

// Custom hook to use the context
export const useTooltips = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltips must be used within a TooltipProvider');
  }
  return context;
};

export default TooltipProvider;