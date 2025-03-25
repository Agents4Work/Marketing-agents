import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedTooltip from "./AnimatedTooltip";
import { useTooltips } from "./TooltipManager";
import { Link as LinkIcon, ArrowRight } from "lucide-react";

// Interfaces
export interface AgentData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface LegoNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: AgentData;
  selected?: boolean;
}

export interface LegoAgentNodeProps {
  node: LegoNode;
  onNodeClick?: (node: LegoNode) => void;
  onNodeDrag?: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onStartConnecting?: (node: LegoNode, e: React.MouseEvent) => void;
}

// Memoized LegoAgentNode component for better performance
const LegoAgentNode: React.FC<LegoAgentNodeProps> = ({ 
  node, 
  onNodeClick, 
  onNodeDrag,
  onStartConnecting
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(node.position);
  const [isPositionFixed, setIsPositionFixed] = useState(false);
  
  // Use tooltip system
  const { getNodeTooltip, updateTooltipState, tooltipState } = useTooltips();
  
  // Get tooltip for this node - using useMemo to avoid calculations in each render
  // ⚠️ FIX: We use useMemo to avoid calls during rendering
  const nodeTooltip = useMemo(() => {
    return getNodeTooltip(node);
  }, [getNodeTooltip, node]);
  
  // Synchronize position with external prop only when it changes significantly
  useEffect(() => {
    if (!isDragging && 
        (Math.abs(position.x - node.position.x) > 5 || 
         Math.abs(position.y - node.position.y) > 5)) {
      setPosition(node.position);
    }
  }, [node.position, isDragging, position]);
  
  // Fix position after placing the node for the first time
  useEffect(() => {
    // Only fix the position after a brief delay
    // so the user can see the visual location
    if (!isPositionFixed) {
      const timer = setTimeout(() => {
        setIsPositionFixed(true);
        // Report final position to the main application
        if (onNodeDrag) {
          onNodeDrag(node.id, position);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPositionFixed, node.id, position, onNodeDrag]);
  
  // ⚠️ FIX: We separate the tooltip state update to avoid updates during render
  // This function will only be executed in response to an event, not during render
  const handleUpdateTooltips = () => {
    // Use setTimeout to ensure this happens after rendering
    setTimeout(() => {
      updateTooltipState({
        nodeCount: Math.max(tooltipState.nodeCount, 1) // Ensure it's at least 1
      });
    }, 0);
  };
  
  // Handle drag start - SIMPLIFIED for immediate responsiveness
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow drag from the header area (not from connectors)
    if ((e.target as HTMLElement).closest('.connection-handle')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    
    // Calculate initial offsets
    const nodeRect = nodeRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - (nodeRect?.left || 0);
    const offsetY = e.clientY - (nodeRect?.top || 0);
    
    // OPTIMIZED FUNCTION: direct update for maximum responsiveness
    const handleDragMove = (moveEvent: MouseEvent) => {
      // Prevent text selection during dragging
      moveEvent.preventDefault();
      
      // Direct calculation without waiting for frames
      const newX = moveEvent.clientX - offsetX;
      const newY = moveEvent.clientY - offsetY;
      
      // Update visual position directly for greater fluidity
      if (nodeRef.current) {
        nodeRef.current.style.left = `${newX}px`;
        nodeRef.current.style.top = `${newY}px`;
      }
      
      // Update state for components that depend on it
      setPosition({ x: newX, y: newY });
      
      // Notify parent to synchronize
      if (onNodeDrag) {
        onNodeDrag(node.id, { x: newX, y: newY });
      }
    };
    
    const handleDragEnd = () => {
      // Simply clean up listeners and update state
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      
      // Fix the final position
      setIsPositionFixed(true);
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };
  
  // Handler to start a connection from a port
  const handlePortDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // ⚠️ FIX: Prevent any default behavior
    
    if (onStartConnecting) {
      onStartConnecting(node, e);
    }
  };
  
  // Node click handler
  const handleNodeClick = (e: React.MouseEvent) => {
    // Avoid click if it comes from a connection port
    if ((e.target as HTMLElement).closest('.connection-handle')) {
      return;
    }
    
    // ⚠️ FIX: We move the tooltip update to a separate function
    handleUpdateTooltips();
    
    if (onNodeClick) {
      onNodeClick(node);
    }
  };
  
  // Render connection ports - useMemo to avoid unnecessary re-renders
  const connectionPorts = useMemo(() => {
    return (
      <>
        {/* Input port (left) */}
        <div 
          className="connection-handle input-handle absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-pointer shadow-md z-10 hover:scale-110 transition-transform"
          title="Input port"
        >
          <LinkIcon className="h-3 w-3 text-white" />
        </div>
        
        {/* Output port (right) - Improved for better detection and click response */}
        <div 
          className="connection-handle output-handle absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center cursor-pointer shadow-md z-10 hover:scale-125 transition-all animate-pulse"
          title="Drag to connect"
          onMouseDown={handlePortDragStart}
          onClick={(e) => e.stopPropagation()} // ⚠️ FIX: Stop click propagation
        >
          <ArrowRight className="h-3 w-3 text-white" />
        </div>
      </>
    );
  }, [node, handlePortDragStart]);
  
  return (
    <motion.div
      ref={nodeRef}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${node.selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1000 : node.selected ? 100 : 1, // ⚠️ FIX: Improve z-index to prioritize selected nodes
        touchAction: "none", // ⚠️ FIX: Disable browser gestures during dragging
        userSelect: "none", // ⚠️ FIX: Prevent text selection
      }}
      onMouseDown={handleDragStart}
      onClick={handleNodeClick}
      animate={{ 
        left: position.x, 
        top: position.y,
        scale: isDragging ? 1.05 : 1
      }}
      transition={{ 
        type: 'tween', 
        duration: 0.1,
        ease: 'linear'
      }}
    >
      <div className="relative">
        {connectionPorts}
        
        {nodeTooltip ? (
          <AnimatedTooltip
            content={nodeTooltip.content}
            position={nodeTooltip.position}
            color={nodeTooltip.color}
            highlight={nodeTooltip.highlight}
            icon={nodeTooltip.icon}
            delay={500}
          >
            <Card className={`w-48 shadow-md border-2 ${node.data.color} border-${node.data.color.replace('bg-', '')}/50`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full ${node.data.color} flex items-center justify-center text-white`}>
                    {React.isValidElement(node.data.icon) ? node.data.icon : <span>AI</span>}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{node.data.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{node.data.type}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300">{node.data.description}</p>
                </div>
              </CardContent>
              <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                  {node.type}
                </Badge>
                <div className="flex space-x-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </CardFooter>
            </Card>
          </AnimatedTooltip>
        ) : (
          <Card className={`w-48 shadow-md border-2 ${node.data.color} border-${node.data.color.replace('bg-', '')}/50`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full ${node.data.color} flex items-center justify-center text-white`}>
                  {React.isValidElement(node.data.icon) ? node.data.icon : <span>AI</span>}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{node.data.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{node.data.type}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-700 dark:text-gray-300">{node.data.description}</p>
              </div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                {node.type}
              </Badge>
              <div className="flex space-x-1">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

// Custom comparison function to optimize performance
// Only re-renders if relevant properties change
const areEqual = (prevProps: LegoAgentNodeProps, nextProps: LegoAgentNodeProps) => {
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.selected === nextProps.node.selected &&
    prevProps.node.position.x === nextProps.node.position.x &&
    prevProps.node.position.y === nextProps.node.position.y &&
    prevProps.node.data.name === nextProps.node.data.name &&
    prevProps.node.data.type === nextProps.node.data.type &&
    prevProps.node.data.color === nextProps.node.data.color
  );
};

// Apply memoization with custom comparison function for greater optimization
export default React.memo(LegoAgentNode, areEqual);