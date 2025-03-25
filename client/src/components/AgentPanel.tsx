import { useCallback } from "react";
import { AgentType, Agent, agentStyles } from "@/lib/agents";
import { Search, Pencil, PieChart, Image, Mail, BarChart2, MessageCircle } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, agent: Agent) => void;
}

const AgentCard = ({ agent, onDragStart }: AgentCardProps) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    onDragStart(event, agent);
  };

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
        return "bg-blue-100";
      case "copywriting":
        return "bg-green-100";
      case "ads":
        return "bg-purple-100";
      case "creative":
        return "bg-pink-100";
      case "email":
        return "bg-yellow-100";
      case "analytics":
        return "bg-indigo-100";
      case "social":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div 
      className="agent-node bg-white border border-gray-200 shadow-sm rounded-md p-3 cursor-move hover:shadow-md hover:border-primary-300 transition-all"
      draggable
      onDragStart={handleDragStart}
      data-agent-type={agent.type}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-full p-1 ${getColorClass(agent.type as AgentType)}`}>
          {getIcon(agent.type as AgentType)}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-800">{agent.name}</h3>
          <p className="text-xs text-gray-500">{agent.description}</p>
        </div>
      </div>
    </div>
  );
};

interface AgentPanelProps {
  agents: Agent[];
  onAgentDrag: (agent: Agent) => void;
}

const AgentPanel = ({ agents, onAgentDrag }: AgentPanelProps) => {
  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, agent: Agent) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(agent));
    event.dataTransfer.effectAllowed = "move";
    onAgentDrag(agent);
  }, [onAgentDrag]);

  return (
    <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-700">AI Agents</h2>
        <p className="text-xs text-gray-500 mt-1">Drag agents to the canvas</p>
      </div>
      
      <div className="p-3 space-y-3">
        {agents.map((agent) => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentPanel;
