import React from 'react';
import { Agent } from '@/lib/agents';
import WorkflowChat from './WorkflowChat';

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use WorkflowChat instead.
 */
interface TeamChatProps {
  agents: Agent[];
  onBack: () => void;
}

/**
 * @deprecated Use WorkflowChat component instead
 * This is an adapter component that redirects to the new WorkflowChat component.
 * It maintains backward compatibility until all references are updated.
 */
const TeamChat: React.FC<TeamChatProps> = ({ agents, onBack }) => {
  // Console warning for deprecated component
  console.warn(
    "TeamChat is deprecated and will be removed in a future version. " +
    "Please use WorkflowChat instead."
  );
  
  // Pass through all props to the new component
  return <WorkflowChat agents={agents} onBack={onBack} />;
};

export default TeamChat;