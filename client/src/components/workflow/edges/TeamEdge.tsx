import React from 'react';
import WorkflowEdge, { 
  WorkflowEdgeProps
} from './WorkflowEdge';

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use WorkflowEdge instead.
 */

// Define ConnectionType directly for backwards compatibility
export type ConnectionType = 'default' | 'collaboration' | 'approval' | 'feedback';

// Extend the WorkflowEdgeProps for backwards compatibility
export interface TeamEdgeProps extends WorkflowEdgeProps {}

/**
 * @deprecated Use WorkflowEdge component instead
 */
export default function TeamEdge(props: TeamEdgeProps) {
  // Console warning for deprecated component
  console.warn(
    "TeamEdge is deprecated and will be removed in a future version. " +
    "Please use WorkflowEdge instead."
  );
  
  // Pass through all props to the new component
  return <WorkflowEdge {...props} />;
}