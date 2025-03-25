import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatAgentVersion } from '@/lib/agent-version-control';
import { Tag } from 'lucide-react';

interface AgentVersionBadgeProps {
  version: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Displays the version of an agent as a badge
 * Used in agent cards, detail pages, and workflow nodes
 */
const AgentVersionBadge: React.FC<AgentVersionBadgeProps> = ({
  version,
  showIcon = true,
  className = ''
}) => {
  const formattedVersion = formatAgentVersion(version || '1.0');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`border-2 border-black px-2 font-semibold shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] ${className}`}
          >
            {showIcon && <Tag className="h-3 w-3 mr-1" />}
            {formattedVersion}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Agent Version: {formattedVersion}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AgentVersionBadge;