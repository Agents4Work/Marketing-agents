import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { 
  ChevronDown,
  Settings,
  Play,
  X,
  MoreHorizontal,
  HelpCircle,
  ChevronUp
} from 'lucide-react';
import { NodeData, NodePort } from '@/lib/workflowTypes';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BaseNodeProps extends NodeProps {
  data: NodeData;
  variant?: 'default' | 'agent' | 'trigger' | 'action' | 'logic' | 'output';
}

// High-end, premium gradient styles for different node types
const nodeStyles = {
  default: 'bg-white border-gray-300 shadow-lg',
  agent: 'bg-gradient-to-br from-blue-600/10 via-blue-100/40 to-indigo-600/10 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  trigger: 'bg-gradient-to-br from-violet-600/10 via-purple-100/40 to-fuchsia-600/10 border-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  action: 'bg-gradient-to-br from-emerald-600/10 via-green-100/40 to-teal-600/10 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  logic: 'bg-gradient-to-br from-amber-600/10 via-yellow-100/40 to-orange-600/10 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]',
  output: 'bg-gradient-to-br from-rose-600/10 via-pink-100/40 to-red-600/10 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
};

// Premium header color styles with subtle glass morphism
const headerStyles = {
  default: 'bg-slate-50/80 text-slate-800 backdrop-blur-sm',
  agent: 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-blue-800 backdrop-blur-sm border-b-2',
  trigger: 'bg-gradient-to-r from-purple-50/90 to-fuchsia-50/90 text-purple-800 backdrop-blur-sm border-b-2',
  action: 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 text-emerald-800 backdrop-blur-sm border-b-2',
  logic: 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 text-amber-800 backdrop-blur-sm border-b-2',
  output: 'bg-gradient-to-r from-rose-50/90 to-pink-50/90 text-rose-800 backdrop-blur-sm border-b-2',
};

// Modern badge color variants
const badgeVariants = {
  default: 'bg-slate-100/80 text-slate-800 border-slate-200',
  agent: 'bg-blue-100/80 text-blue-800 border-blue-200',
  trigger: 'bg-purple-100/80 text-purple-800 border-purple-200',
  action: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
  logic: 'bg-amber-100/80 text-amber-800 border-amber-200',
  output: 'bg-rose-100/80 text-rose-800 border-rose-200',
};

const BaseNode = memo(({ 
  data, 
  variant = 'default',
  selected,
  ...props
}: BaseNodeProps) => {
  // Extract node properties
  const { 
    label, 
    description, 
    inputs = [], 
    outputs = [],
    icon 
  } = data;

  // Generate node class based on type and selection state
  const nodeClass = cn(
    'rounded-xl shadow-xl border transition-all min-w-[220px] max-w-[300px]',
    nodeStyles[variant],
    selected ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : '',
    'hover:shadow-2xl hover:scale-[1.01] transform-gpu transition-transform duration-200',
  );

  // Create Input Handles with premium styling
  const renderInputHandles = () => {
    return inputs.map((input: NodePort, index: number) => {
      const yPos = (index + 1) / (inputs.length + 1);
      
      return (
        <TooltipProvider key={`tooltip-input-${input.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                key={`input-${input.id}`}
                type="target"
                position={Position.Left}
                id={input.id}
                style={{ 
                  top: `${yPos * 100}%`, 
                  background: getPortColor(input.type),
                  width: 14,
                  height: 14,
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 2px 5px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  zIndex: 20
                }}
                className="border-2 border-white hover:scale-[1.3] hover:border-blue-100 hover:shadow-md hover:shadow-blue-300/40"
              />
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs bg-blue-50 border-blue-200 text-blue-700 px-2 py-1 shadow-md">
              {input.label} <span className="text-[10px] text-blue-500">({input.type})</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  // Create Output Handles with premium styling
  const renderOutputHandles = () => {
    return outputs.map((output: NodePort, index: number) => {
      const yPos = (index + 1) / (outputs.length + 1);
      
      return (
        <TooltipProvider key={`tooltip-output-${output.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                key={`output-${output.id}`}
                type="source"
                position={Position.Right}
                id={output.id}
                style={{ 
                  top: `${yPos * 100}%`, 
                  background: getPortColor(output.type),
                  width: 14,
                  height: 14,
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 2px 5px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  zIndex: 20
                }}
                className="border-2 border-white hover:scale-[1.3] hover:border-green-100 hover:shadow-md hover:shadow-green-300/40"
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs bg-green-50 border-green-200 text-green-700 px-2 py-1 shadow-md">
              {output.label} <span className="text-[10px] text-green-500">({output.type})</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  // Get port color based on type
  const getPortColor = (type: 'data' | 'control' | 'trigger' | string): string => {
    switch (type) {
      case 'data': return '#3b82f6'; // blue
      case 'control': return '#a855f7'; // purple
      case 'trigger': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };
  
  // State for showing/hiding help information
  const [showHelp, setShowHelp] = useState(true);
  
  // Toggle help visibility
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className={nodeClass}>
      {/* Premium Node Header with Icon Circle */}
      <div className={cn('p-3 rounded-t-xl border-b flex items-center justify-between', headerStyles[variant])}>
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center shadow-sm border",
              variant === 'agent' && "bg-blue-100 border-blue-200/40",
              variant === 'trigger' && "bg-purple-100 border-purple-200/40",
              variant === 'action' && "bg-emerald-100 border-emerald-200/40",
              variant === 'logic' && "bg-amber-100 border-amber-200/40",
              variant === 'output' && "bg-rose-100 border-rose-200/40",
              variant === 'default' && "bg-gray-100 border-gray-200/40"
            )}>
              <span className={cn(
                variant === 'agent' && "text-blue-700",
                variant === 'trigger' && "text-purple-700",
                variant === 'action' && "text-emerald-700",
                variant === 'logic' && "text-amber-700",
                variant === 'output' && "text-rose-700",
                variant === 'default' && "text-gray-700"
              )}>{icon}</span>
            </div>
          )}
          <span className="font-semibold text-sm tracking-tight truncate">{label}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
            <MoreHorizontal size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => {
                if (data.onConfigure) {
                  data.onConfigure(data);
                }
              }}
            >
              <Settings size={14} />
              <span>Configure</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => {
                if (data.onExecute) {
                  data.onExecute(data);
                }
              }}
            >
              <Play size={14} />
              <span>Run node</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex gap-2 items-center text-red-600 cursor-pointer"
              onClick={() => {
                if (data.onDelete) {
                  data.onDelete(data);
                }
              }}
            >
              <X size={14} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Enhanced Node Body with Better Typography and Helpful Tooltips */}
      <div className="p-4 bg-white/80">
        {description && (
          <p className="text-xs leading-relaxed text-gray-600 mb-3">{description}</p>
        )}
        
        {/* Help Toggle Button */}
        <div className="flex justify-end mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full hover:bg-blue-50" 
                  onClick={toggleHelp}
                >
                  {showHelp ? <ChevronUp size={14} className="text-blue-600" /> : <HelpCircle size={14} className="text-blue-600" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showHelp ? "Hide help" : "Show help"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Beginner-Friendly Help Box */}
        {showHelp && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 mb-4">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-blue-700 text-xs">?</span>
              </div>
              <div>
                <p className="text-[11px] text-blue-800 font-medium">How to use this node:</p>
                <p className="text-[10px] leading-relaxed text-blue-700 mt-1">
                  This {data.category} can be connected to other nodes by dragging from the dots on the sides.
                  <span className="block mt-1">• <span className="font-medium">Left dots</span>: Receive data from other nodes</span>
                  <span className="block">• <span className="font-medium">Right dots</span>: Send data to other nodes</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Input Ports with Improved Design */}
        {inputs.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-600 mb-1.5 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
              <span>Inputs</span>
              <span className="ml-1 text-[10px] text-gray-400">(receives data)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inputs.map((input) => (
                <Badge 
                  key={input.id} 
                  variant="outline" 
                  className="text-xs py-0.5 px-2 bg-white hover:bg-blue-50 transition-colors cursor-default"
                >
                  {input.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Output Ports with Improved Design */}
        {outputs.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
              <span>Outputs</span>
              <span className="ml-1 text-[10px] text-gray-400">(sends data)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outputs.map((output) => (
                <Badge 
                  key={output.id}
                  variant="outline"
                  className="text-xs py-0.5 px-2 bg-white hover:bg-green-50 transition-colors cursor-default"
                >
                  {output.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* High-end Status Footer with Pulse Effect */}
      <div className="px-4 py-2.5 border-t bg-gray-50/80 text-xs text-gray-500 rounded-b-xl flex justify-between items-center backdrop-blur-sm">
        <Badge variant="outline" className={cn("text-xs font-medium", badgeVariants[variant])}>
          {data.category}
        </Badge>
        
        <div className="flex items-center">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
          <span className="text-xs font-medium">Ready</span>
        </div>
      </div>
      
      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </div>
  );
});

export default BaseNode;