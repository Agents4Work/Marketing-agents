import React, { useState, useMemo } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AgentInteractionDialog, InteractionType } from "./AgentInteractionDialog";
import {
  MessageSquare,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { NodeData, WorkflowNodeType } from "@/lib/workflowTypes";
import { getAgentColor, getAgentInitials, ExtendedAgentType } from "@/lib/agentUtils";
import { AgentType } from "@/lib/agents";

// Define a custom node data type that ensures we have the fields we need
export interface WorkflowNodeData {
  type?: string;
  label?: string;
  description?: string;
  nodeType?: {
    agentType?: string;
  } | WorkflowNodeType;
}

// Define our component props
export interface WorkflowAgentNodeProps {
  data: WorkflowNodeData;
  id: string;
  selected: boolean;
  dragHandle?: string;
  type?: string;
  zIndex?: number;
  isConnectable?: boolean;
  xPos?: number;
  yPos?: number;
}

// Map agent types to appropriate titles
const agentRoleTitles: Record<string, string> = {
  seo: "SEO Specialist",
  copywriting: "Content Writer",
  ads: "Advertising Expert",
  creative: "Creative Designer",
  email: "Email Marketer",
  analytics: "Analytics Specialist",
  social: "Social Media Manager",
  content: "Content Strategist",
  strategy: "Marketing Strategist",
};

// Status types for agent nodes
export type AgentNodeStatus = "pending" | "active" | "completed" | "paused" | "error";

// Get avatar image based on agent type
const getAgentAvatar = (agentType: ExtendedAgentType, name: string): string => {
  // In a real implementation, this could use actual avatar images
  // For now, we'll return a placeholder based on agent type
  return `/avatars/${agentType}.jpg`;
};

const WorkflowAgentNode: React.FC<WorkflowAgentNodeProps> = ({ data, selected }) => {
  // Local state for this agent
  const [status, setStatus] = useState<AgentNodeStatus>("pending");
  const [activityMessage, setActivityMessage] = useState("");
  
  // Get agent details from data
  const agentType = (data.nodeType && 'agentType' in data.nodeType ? 
    data.nodeType.agentType : data.type) as ExtendedAgentType; 
  const name = data.label || "AI Agent";
  const description = data.description || "";
  
  // Role title based on agent type
  const roleTitle = agentRoleTitles[agentType] || "AI Expert";
  
  // Agent avatar image or placeholder
  const avatarUrl = getAgentAvatar(agentType, name);
  
  // Agent-specific color
  const colorClass = getAgentColor(agentType);
  
  // Agent initials for avatar fallback
  const initials = getAgentInitials(name);
  
  // Status badge config with more human-like language
  const statusConfig = useMemo(() => {
    switch(status) {
      case "active":
        return { 
          label: "Working", 
          variant: "default", 
          icon: <Play className="h-3 w-3" />,
          color: "bg-green-500",
          humanStatus: "Currently working on this task" 
        };
      case "completed":
        return { 
          label: "Completed", 
          variant: "outline", 
          icon: <CheckCircle2 className="h-3 w-3" />,
          color: "bg-blue-500",
          humanStatus: "Finished with this assignment" 
        };
      case "paused":
        return { 
          label: "Taking a break", 
          variant: "secondary", 
          icon: <Pause className="h-3 w-3" />,
          color: "bg-yellow-500",
          humanStatus: "Temporarily paused to handle other priorities" 
        };
      case "error":
        return { 
          label: "Stuck", 
          variant: "destructive", 
          icon: <AlertCircle className="h-3 w-3" />,
          color: "bg-red-500",
          humanStatus: "Encountering problems that need attention" 
        };
      case "pending":
      default:
        return { 
          label: "Ready", 
          variant: "secondary", 
          icon: <Clock className="h-3 w-3" />,
          color: "bg-gray-400",
          humanStatus: "Waiting to begin this assignment" 
        };
    }
  }, [status]);

  // Toggle the status for demo purposes
  const toggleStatus = () => {
    const statusOrder: AgentNodeStatus[] = ["pending", "active", "completed", "paused", "error"];
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    setStatus(statusOrder[nextIndex]);
    
    // Set an activity message based on status
    switch(statusOrder[nextIndex]) {
      case "active":
        setActivityMessage("Analyzing campaign data...");
        break;
      case "completed":
        setActivityMessage("Task completed successfully");
        break;
      case "paused":
        setActivityMessage("Operation paused by user");
        break;
      case "error":
        setActivityMessage("Error: Unable to access data source");
        break;
      default:
        setActivityMessage("Waiting to start...");
    }
  };
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interactionType, setInteractionType] = useState<InteractionType>('profile');
  
  // Handle chat button click
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to node click
    console.log(`Opening chat with ${name}`);
    // Display a temporary message in the activity area
    setActivityMessage(`Chat session started with ${name}`);
    // Open dialog with chat tab active
    setInteractionType('chat');
    setDialogOpen(true);
  };
  
  // Handle settings button click
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to node click
    console.log(`Opening settings for ${name}`);
    // Display a temporary message in the activity area
    setActivityMessage(`Configuring ${name}...`);
    // Open dialog with settings tab active
    setInteractionType('settings');
    setDialogOpen(true);
  };

  return (
    <div className={`workflow-agent-node ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
      {/* Agent interaction dialog */}
      <AgentInteractionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={{
          id: `agent-${name}`,
          name,
          type: agentType,
          description,
          roleTitle,
          avatarUrl,
          status: statusConfig.label,
        }}
        interactionType={interactionType}
      />

      {/* Input handle - for receiving connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 rounded-full bg-blue-500 border border-white"
        style={{ left: -8, top: 30 }}
      />
      
      {/* Output handle - for sending connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 rounded-full bg-green-500 border border-white" 
        style={{ right: -8, top: 30 }}
      />
      
      {/* Main agent card with profile-like design */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className="agent-card cursor-pointer"
        onClick={() => {
          // Display info when clicking on the agent itself
          console.log(`Agent clicked: ${name}`);
          setActivityMessage(`Viewing details for ${name}...`);
          // Open dialog with profile tab active
          setInteractionType('profile');
          setDialogOpen(true);
        }}
      >
        <Card className="w-64 shadow-lg">
          <div className={`h-2 w-full ${colorClass}`}></div>
          
          <CardContent className="p-4">
            {/* Agent header with avatar and name */}
            <div className="flex items-start mb-3">
              {/* Avatar with status indicator */}
              <div className="relative mr-3">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className={`${colorClass} text-white`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status indicator dot */}
                <div 
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${statusConfig.color} border-2 border-white cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent node's click
                    toggleStatus();
                  }}
                ></div>
              </div>
              
              {/* Name and role */}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{name}</h4>
                <p className="text-xs text-gray-500">{roleTitle}</p>
                
                {/* Status badge */}
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs flex items-center gap-1 py-0">
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Agent activity/status message */}
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-xs mb-2">
              {activityMessage || statusConfig.humanStatus}
            </div>
            
            {/* Agent description/bio */}
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2" title={description}>
              {description}
            </p>
          </CardContent>
          
          <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800 flex justify-end gap-1">
            {/* Quick action buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleChatClick}
                  >
                    <MessageSquare className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat with agent</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure agent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default React.memo(WorkflowAgentNode);