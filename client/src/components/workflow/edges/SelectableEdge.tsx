import React from 'react';
import { EdgeProps, getSmoothStepPath, getBezierPath, getMarkerEnd } from 'reactflow';

interface SelectableEdgeProps extends EdgeProps {
  data?: {
    label?: string;
    isSelected?: boolean;
  };
}

export default function SelectableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: SelectableEdgeProps) {
  // Default variables for edge customization
  const edgePathArray = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  // Extract the path string from the array
  const edgePath = typeof edgePathArray === 'string' 
    ? edgePathArray 
    : Array.isArray(edgePathArray) ? edgePathArray[0] : '';

  // Determine appearance based on selection state
  const isSelected = data?.isSelected || false;
  
  // Customize based on selection state
  const strokeWidth = isSelected ? 3 : 1.5;
  const strokeColor = isSelected ? '#3b82f6' : '#64748b';
  const strokeDasharray = isSelected ? '0' : '0';
  const edgePathStyle = {
    stroke: strokeColor,
    strokeWidth,
    strokeDasharray,
    transition: 'stroke-width 0.2s, stroke 0.2s',
    ...style,
  };
  
  // Label display if present
  const labelStyle = {
    fontSize: '10px',
    fontWeight: isSelected ? 'bold' : 'normal',
    fill: isSelected ? '#3b82f6' : '#64748b',
    transition: 'font-weight 0.2s, fill 0.2s',
    pointerEvents: 'none' as const,
  };

  return (
    <g>
      {/* Main edge path */}
      <path
        id={id}
        style={edgePathStyle}
        d={edgePath.toString()}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
      
      {/* Selection highlight when selected */}
      {isSelected && (
        <path
          style={{
            stroke: '#bfdbfe',
            strokeWidth: 7,
            strokeDasharray: '0',
            strokeLinecap: 'round',
            strokeOpacity: 0.5,
            fill: 'none',
          }}
          d={edgePath.toString()}
          markerEnd={markerEnd}
          className="react-flow__edge-selection-path"
        />
      )}
      
      {/* Edge label if provided */}
      {data?.label && (
        <text
          style={labelStyle}
          dominantBaseline="central"
          textAnchor="middle"
          alignmentBaseline="text-after-edge"
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          dy="-10"
        >
          {data.label}
        </text>
      )}
    </g>
  );
}