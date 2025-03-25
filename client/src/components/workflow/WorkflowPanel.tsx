import { useState } from 'react';
import { motion } from 'framer-motion';
import { nodeTemplates } from './NodeRegistry';
import { NodeData, NodeCategory } from '@/lib/workflowTypes';
import { Agent, AgentType } from '@/lib/agents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap, GitBranch, Database, Link, ArrowRightLeft } from 'lucide-react';

interface WorkflowPanelProps {
  agents: Agent[];
  onNodeDrag: (node: NodeData) => void;
}

const WorkflowPanel = ({ agents, onNodeDrag }: WorkflowPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('agents');
  
  // Convert agents to node data format
  const agentNodes = agents.map(agent => ({
    id: `agent-${agent.id}`,
    label: agent.name,
    category: 'agent' as NodeCategory,
    nodeType: { type: 'agent' as const, agentType: agent.type as AgentType },
    description: agent.description,
    agent
  }));
  
  // Filter nodes based on search
  const filterNodes = (nodes: NodeData[]) => {
    if (!searchTerm) return nodes;
    
    return nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Handle node drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, node: NodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
    
    if (onNodeDrag) {
      onNodeDrag(node);
    }
  };
  
  // Get active nodes based on selected category
  const getActiveNodes = () => {
    switch (selectedCategory) {
      case 'agents':
        return filterNodes(agentNodes);
      case 'triggers':
        return filterNodes(nodeTemplates.triggers);
      case 'logic':
        return filterNodes(nodeTemplates.logic);
      case 'data':
        return filterNodes(nodeTemplates.data);
      case 'integrations':
        return filterNodes(nodeTemplates.integrations);
      case 'outputs':
        return filterNodes(nodeTemplates.outputs);
      default:
        return [];
    }
  };
  
  // Icon for each category tab
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agents':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'triggers':
        return <Zap className="h-4 w-4" />;
      case 'logic':
        return <GitBranch className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'integrations':
        return <Link className="h-4 w-4" />;
      case 'outputs':
        return <ArrowRightLeft className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };
  
  // Get node background color based on category
  const getNodeColor = (category: NodeCategory) => {
    switch (category) {
      case 'agent':
        return 'bg-gradient-to-r from-blue-50 to-white border-blue-200';
      case 'trigger':
        return 'bg-gradient-to-r from-purple-50 to-white border-purple-200';
      case 'logic':
        return 'bg-gradient-to-r from-amber-50 to-white border-amber-200';
      case 'data':
        return 'bg-gradient-to-r from-green-50 to-white border-green-200';
      case 'integration':
        return 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200';
      case 'output':
        return 'bg-gradient-to-r from-rose-50 to-white border-rose-200';
      default:
        return 'bg-white border-gray-200';
    }
  };
  
  // Render a node item
  const renderNodeItem = (node: NodeData) => {
    // Using a wrapper div for handling the drag event
    return (
      <div 
        key={node.id}
        draggable
        onDragStart={(e) => handleDragStart(e, node)}
      >
        <div
          className={`p-3 mb-2 rounded-lg shadow-sm border cursor-grab hover:-translate-y-1 transition-transform duration-200 ${getNodeColor(node.category)}`}
        >
          <div className="font-medium text-sm truncate">{node.label}</div>
          {node.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{node.description}</div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-64 h-full border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-3">Workflow Nodes</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Search nodes..."
            className="pl-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="agents" className="flex-1 flex flex-col overflow-hidden" onValueChange={setSelectedCategory}>
        <TabsList className="justify-start px-2 pt-2 bg-gray-50 overflow-x-auto">
          <TabsTrigger value="agents" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('agents')}
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('triggers')}
            <span>Triggers</span>
          </TabsTrigger>
          <TabsTrigger value="logic" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('logic')}
            <span>Logic</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('data')}
            <span>Data</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('integrations')}
            <span>Services</span>
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex gap-1 items-center data-[state=active]:bg-white">
            {getCategoryIcon('outputs')}
            <span>Outputs</span>
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1 p-4">
          {getActiveNodes().length > 0 ? (
            getActiveNodes().map(renderNodeItem)
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-3xl mb-2">😕</div>
              <p className="text-sm">No matching nodes found</p>
            </div>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default WorkflowPanel;