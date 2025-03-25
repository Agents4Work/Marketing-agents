import React, { useState } from 'react';
import { 
  EdgeProps, 
  getSmoothStepPath, 
  EdgeLabelRenderer,
  BaseEdge 
} from 'reactflow';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  MessageSquare,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getConnectionStyle, getConnectionLabel } from '@/lib/agentUtils';

export type ConnectionType = 'default' | 'collaboration' | 'approval' | 'feedback';

// Extend the base EdgeProps to include our custom connection type
export interface WorkflowEdgeProps extends EdgeProps {
  data?: {
    connectionType?: ConnectionType;
    status?: 'pending' | 'active' | 'completed';
    messages?: number;
  };
}

export default function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: WorkflowEdgeProps) {
  // Set default connection type if not provided
  const connectionType = data?.connectionType || 'default';
  const status = data?.status || 'pending';
  const hasMessages = (data?.messages || 0) > 0;
  
  // Get connection style based on connection type
  const { color, thickness, style } = getConnectionStyle(connectionType);
  
  // Get path for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine edge stroke dasharray based on style and animation
  const strokeDasharray = style === 'dashed' ? '5,5' : 'none';
  
  // Determine if the edge should be animated
  const isAnimated = status === 'active';
  
  // Activity circle colors
  const statusColors = {
    pending: '#94a3b8', // slate-400
    active: '#22c55e',  // green-500
    completed: '#3b82f6', // blue-500
  };
  
  // Connection label based on connection type
  const connectionLabel = getConnectionLabel(connectionType);
  
  return (
    <>
      {/* The actual edge line */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: thickness + (selected ? 1 : 0),
          strokeDasharray,
        }}
      />
      
      {/* Animated flow effect when edge is active */}
      {isAnimated && (
        <motion.circle
          r={5}
          fill={statusColors.active}
          opacity={0.8}
          filter="url(#glow)"
          animate={{
            offsetDistance: ['0%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            offsetPath: `path("${edgePath}")`,
            offsetRotate: 'auto',
          }}
        />
      )}
      
      {/* Edge label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="edge-label-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Connection type badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`
                    bg-white dark:bg-gray-800 
                    border-2 
                    flex items-center gap-1 
                    text-xs px-2 py-0.5 
                    shadow-sm
                    ${selected || isHovered ? 'scale-110' : 'scale-100'}
                    transition-all duration-200
                  `}
                  style={{ borderColor: color }}
                >
                  {connectionType === 'collaboration' && <RefreshCw className="h-3 w-3" />}
                  {connectionType === 'approval' && <CheckCircle className="h-3 w-3" />}
                  {connectionType === 'feedback' && <MessageSquare className="h-3 w-3" />}
                  {(selected || isHovered) && <span>{connectionLabel}</span>}
                  {(!selected && !isHovered) && <ChevronRight className="h-3 w-3" />}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{connectionLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Message indicator */}
          {hasMessages && (
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center"
              title={`${data?.messages} messages`}
            >
              {data?.messages}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      
      {/* SVG filter for glow effect on animated circle */}
      <svg width="0" height="0">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
    </>
  );
}