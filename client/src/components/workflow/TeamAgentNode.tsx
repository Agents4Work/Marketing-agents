import React from "react";
import WorkflowAgentNode, { 
  WorkflowNodeData, 
  WorkflowAgentNodeProps
} from "./WorkflowAgentNode";

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use WorkflowAgentNode instead.
 */

// For backwards compatibility, re-export the same interfaces with old names
export interface TeamNodeData extends WorkflowNodeData {}
export interface TeamAgentNodeProps extends WorkflowAgentNodeProps {}

// Export AgentNodeStatus directly to avoid dependency issues
export type AgentNodeStatus = "pending" | "active" | "completed" | "paused" | "error";

// This is a compatibility component that wraps the new WorkflowAgentNode
// It allows old code to continue using TeamAgentNode without breaking changes
const TeamAgentNode: React.FC<TeamAgentNodeProps> = (props) => {
  console.warn(
    "TeamAgentNode is deprecated and will be removed in a future version. " +
    "Please use WorkflowAgentNode instead."
  );
  
  // Pass through all props to the new component
  return <WorkflowAgentNode {...props} />;
};

export default React.memo(TeamAgentNode);