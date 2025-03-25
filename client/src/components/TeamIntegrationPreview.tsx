import React from 'react';
import WorkflowIntegrationPreview from './workflow/WorkflowIntegrationPreview';

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use WorkflowIntegrationPreview instead.
 */
interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  description: string;
  skills: string[];
}

/**
 * @deprecated Use WorkflowMember from WorkflowIntegrationPreview instead
 */
interface TeamMember {
  agent: Agent;
  role: string;
  position: number;
  outputs?: string[];
}

/**
 * @deprecated Use WorkflowPreviewProps from WorkflowIntegrationPreview instead
 */
interface TeamPreviewProps {
  title: string;
  description: string;
  members: TeamMember[];
  workflowSteps?: string[];
  onSelectTeam?: () => void;
  showConnections?: boolean;
  highlightAgentId?: string;
  accentColor?: string;
  secondaryColor?: string;
}

/**
 * @deprecated Use WorkflowIntegrationPreview component instead
 * This is an adapter component that redirects to the new WorkflowIntegrationPreview component.
 * It maintains backward compatibility until all references are updated.
 */
const TeamIntegrationPreview: React.FC<TeamPreviewProps> = ({
  title,
  description,
  members,
  workflowSteps = [],
  onSelectTeam,
  showConnections = true,
  highlightAgentId,
  accentColor = 'from-blue-500 to-indigo-600',
  secondaryColor = 'bg-blue-600'
}) => {
  // Console warning for deprecated component
  console.warn(
    "TeamIntegrationPreview is deprecated and will be removed in a future version. " +
    "Please use WorkflowIntegrationPreview instead."
  );
  
  // Pass through all props to the new component, adapting names as needed
  return (
    <WorkflowIntegrationPreview
      title={title}
      description={description}
      members={members}
      workflowSteps={workflowSteps}
      onSelectWorkflow={onSelectTeam}
      showConnections={showConnections}
      highlightAgentId={highlightAgentId}
      accentColor={accentColor}
      secondaryColor={secondaryColor}
    />
  );
};

export default TeamIntegrationPreview;