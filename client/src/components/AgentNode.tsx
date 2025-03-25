import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Search, 
  Pencil, 
  PieChart, 
  Image, 
  Mail, 
  BarChart2, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Agent, AgentType } from '@/lib/agents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AgentConfigModal from './AgentConfigModal';

const AgentNode = ({ data, isConnectable }: NodeProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const agent = data.agent as Agent;

  // Get appropriate icon based on agent type
  const getIcon = (type: AgentType) => {
    switch (type) {
      case "seo":
        return <Search className="h-5 w-5 text-blue-600" />;
      case "copywriting":
        return <Pencil className="h-5 w-5 text-green-600" />;
      case "ads":
        return <PieChart className="h-5 w-5 text-purple-600" />;
      case "creative":
        return <Image className="h-5 w-5 text-pink-600" />;
      case "email":
        return <Mail className="h-5 w-5 text-yellow-600" />;
      case "analytics":
        return <BarChart2 className="h-5 w-5 text-indigo-600" />;
      case "social":
        return <MessageCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get appropriate color class based on agent type
  const getColorClass = (type: AgentType) => {
    switch (type) {
      case "seo":
        return { bg: "bg-blue-100", border: "border-blue-200", badge: "bg-blue-100 text-blue-800" };
      case "copywriting":
        return { bg: "bg-green-100", border: "border-green-200", badge: "bg-green-100 text-green-800" };
      case "ads":
        return { bg: "bg-purple-100", border: "border-purple-200", badge: "bg-purple-100 text-purple-800" };
      case "creative":
        return { bg: "bg-pink-100", border: "border-pink-200", badge: "bg-pink-100 text-pink-800" };
      case "email":
        return { bg: "bg-yellow-100", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" };
      case "analytics":
        return { bg: "bg-indigo-100", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-800" };
      case "social":
        return { bg: "bg-orange-100", border: "border-orange-200", badge: "bg-orange-100 text-orange-800" };
      default:
        return { bg: "bg-gray-100", border: "border-gray-200", badge: "bg-gray-100 text-gray-800" };
    }
  };

  const colorClass = getColorClass(agent.type as AgentType);

  const renderAgentContent = () => {
    switch (agent.type) {
      case "seo":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Keywords to focus on:</div>
              <div className="flex flex-wrap gap-1">
                {agent.configuration.keywords && (agent.configuration.keywords as string[]).length > 0 ? (
                  (agent.configuration.keywords as string[]).map((keyword, index) => (
                    <Badge key={index} variant="outline" className={colorClass.badge}>
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No keywords specified</span>
                )}
              </div>
            </div>
          </>
        );
      case "copywriting":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Content type:</div>
              <span className="text-xs text-gray-700">{agent.configuration.contentType}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Tone:</div>
              <span className="text-xs text-gray-700">{agent.configuration.tone}</span>
            </div>
          </>
        );
      case "ads":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Platform:</div>
              <span className="text-xs text-gray-700">{agent.configuration.platform}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Budget:</div>
              <span className="text-xs text-gray-700">${agent.configuration.budget}</span>
            </div>
          </>
        );
      case "social":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Platforms:</div>
              <div className="flex flex-wrap gap-1">
                {agent.configuration.platforms && (agent.configuration.platforms as string[]).map((platform, index) => (
                  <Badge key={index} variant="outline" className={colorClass.badge}>
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Posting frequency:</div>
              <span className="text-xs text-gray-700">{agent.configuration.postingFrequency}</span>
            </div>
          </>
        );
      case "email":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Email type:</div>
              <span className="text-xs text-gray-700">{agent.configuration.type}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Frequency:</div>
              <span className="text-xs text-gray-700">{agent.configuration.frequency}</span>
            </div>
          </>
        );
      case "creative":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Image style:</div>
              <span className="text-xs text-gray-700">{agent.configuration.style}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Size:</div>
              <span className="text-xs text-gray-700">{agent.configuration.size}</span>
            </div>
          </>
        );
      case "analytics":
        return (
          <>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Metrics:</div>
              <div className="flex flex-wrap gap-1">
                {agent.configuration.metrics && (agent.configuration.metrics as string[]).map((metric, index) => (
                  <Badge key={index} variant="outline" className={colorClass.badge}>
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Report frequency:</div>
              <span className="text-xs text-gray-700">{agent.configuration.reportFrequency}</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400"
      />
      <div className={`bg-white border-2 ${colorClass.border} shadow-md rounded-md p-4 w-64`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-full p-1 ${colorClass.bg}`}>
              {getIcon(agent.type as AgentType)}
            </div>
            <h3 className="ml-2 text-sm font-medium text-gray-800">{agent.name}</h3>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <>
            {renderAgentContent()}
            
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Mode:</div>
              <span className="text-xs text-gray-700 capitalize">{agent.configuration.mode}</span>
            </div>
            
            <div className="mt-3 flex justify-end">
              <Button 
                size="sm" 
                className="px-2 py-1 h-8 text-xs"
                onClick={() => setIsConfigOpen(true)}
              >
                Configure
              </Button>
            </div>
          </>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400"
      />

      <AgentConfigModal 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        agent={agent}
      />
    </>
  );
};

export default memo(AgentNode);
