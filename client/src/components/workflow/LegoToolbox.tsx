import React, { useState } from 'react';
import { Agent, AgentType } from '@/lib/agents';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  FileEdit, 
  BarChart3, 
  Mail, 
  PenTool, 
  Share2,
  MessageSquare,
  ChevronRight,
  Bot,
  Lightbulb,
  Star,
  Zap,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import agentService from '@/services/agentService';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LegoToolboxProps {
  agents: Agent[];
  onAgentDrag: (agent: Agent) => void;
}

// Style definitions for agent cards by type
const agentCardStyles: Record<AgentType, { color: string, gradient: string, icon: React.ReactNode }> = {
  seo: { 
    color: 'bg-amber-500', 
    gradient: 'from-amber-300 to-amber-600',
    icon: <Search className="h-6 w-6 text-amber-100" />
  },
  copywriting: { 
    color: 'bg-sky-500',
    gradient: 'from-sky-300 to-sky-600',
    icon: <FileEdit className="h-6 w-6 text-sky-100" /> 
  },
  ads: { 
    color: 'bg-violet-500',
    gradient: 'from-violet-300 to-violet-600',
    icon: <BarChart3 className="h-6 w-6 text-violet-100" /> 
  },
  creative: { 
    color: 'bg-rose-500',
    gradient: 'from-rose-300 to-rose-600',
    icon: <PenTool className="h-6 w-6 text-rose-100" /> 
  },
  email: { 
    color: 'bg-emerald-500',
    gradient: 'from-emerald-300 to-emerald-600',
    icon: <Mail className="h-6 w-6 text-emerald-100" /> 
  },
  analytics: { 
    color: 'bg-blue-500',
    gradient: 'from-blue-300 to-blue-600',
    icon: <BarChart3 className="h-6 w-6 text-blue-100" /> 
  },
  social: { 
    color: 'bg-pink-500',
    gradient: 'from-pink-300 to-pink-600',
    icon: <Share2 className="h-6 w-6 text-pink-100" /> 
  }
};

// Simple descriptions for each agent category
const categoryDescriptions = {
  marketing: "Helpers for creating marketing messages, campaigns, and strategies",
  creative: "Helpers for designing and creating attractive visual content",
  analytics: "Helpers for analyzing results and improving performance"
};

// Group agents into categories
const groupAgentsByCategory = (agents: Agent[]) => {
  const categories: Record<string, Agent[]> = {
    marketing: [],
    creative: [],
    analytics: []
  };
  
  agents.forEach(agent => {
    if (agent.type === 'creative' || agent.type === 'copywriting') {
      categories.creative.push(agent);
    } else if (agent.type === 'analytics' || agent.type === 'seo') {
      categories.analytics.push(agent);
    } else {
      categories.marketing.push(agent);
    }
  });
  
  return categories;
};

// Agent card component with drag capabilities
const AgentCard: React.FC<{ agent: Agent; onDragStart: (e: React.DragEvent<HTMLDivElement>, agent: Agent) => void }> = ({ 
  agent, 
  onDragStart 
}) => {
  const style = agentCardStyles[agent.type as AgentType];
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, agent)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="cursor-grab relative hover:scale-105 active:scale-95 transition-transform"
    >
      <Card className="overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-200">
        <div className={cn(
          "bg-gradient-to-r p-3 flex items-center gap-3",
          `${style.gradient}`
        )}>
          <div className="bg-white/20 p-2 rounded-full">
            {style.icon}
          </div>
          <div className="text-white font-semibold">{agent.name}</div>
        </div>
        
        <CardContent className="p-3 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {agent.description}
          </p>
        </CardContent>
      </Card>
      
      {/* Drag hint */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 z-10"
          >
            <Zap className="h-3 w-3" />
            <span>Drag me!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Suggestion card for common workflows
const SuggestionCard: React.FC<{ title: string, description: string, onClick: () => void }> = ({
  title,
  description,
  onClick
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <Card className="overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all duration-200">
      <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-3 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="text-white font-semibold">{title}</div>
      </div>
      
      <CardContent className="p-3 bg-white dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {description}
        </p>
        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 p-0 h-6">
            <span className="text-xs">Use suggestion</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Main toolbox component
const LegoToolbox: React.FC<LegoToolboxProps> = ({ agents, onAgentDrag }) => {
  const categories = groupAgentsByCategory(agents);
  const { toast } = useToast();
  
  // Handle drag start event
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: Agent) => {
    // Usamos el servicio de agentes importado (en la parte superior del archivo)
    try {
      // Registramos el uso del agente en el workflow usando la interfaz correcta
      agentService.trackAgentUsage(
        String(agent.id),
        '1.0.0', // Versión por defecto
        { 
          type: 'workflow',
          component: 'toolbox' 
        },
        {
          action: 'drag-to-canvas',
          timestamp: new Date().toISOString()
        }
      );
    } catch (err) {
      console.error('Error tracking agent usage:', err);
    }

    // Set drag data as JSON string with version information
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ 
      agent,
      label: agent.name,
      category: 'agent',
      agentId: String(agent.id),
      agentVersion: '1.0.0', // Usando versión por defecto 1.0.0
      nodeType: { type: 'agent', agentType: agent.type || 'generic' }
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // If external handler provided, call it
    if (onAgentDrag) {
      onAgentDrag(agent);
    }
  };
  
  // Suggestions for common workflows
  const suggestions = [
    {
      title: "Social Media Team",
      description: "Create amazing viral content for Instagram, Facebook, and TikTok effortlessly",
      agents: ['copywriting', 'social', 'analytics']
    },
    {
      title: "Content Creator Team",
      description: "Generate articles, videos, and graphics that will delight your audience",
      agents: ['seo', 'copywriting', 'creative']
    },
    {
      title: "Complete Marketing Team",
      description: "Everything you need: content, social media, ads, and results analysis",
      agents: ['copywriting', 'social', 'ads', 'analytics']
    }
  ];
  
  // Apply a suggestion (placeholder for now)
  const applySuggestion = (suggestion: any) => {
    console.log("Applying suggestion:", suggestion);
  };
  
  return (
    <Tabs defaultValue="agents" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="agents" className="flex items-center gap-1">
          <Bot className="h-4 w-4" />
          <span>Helpers</span>
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>Quick Teams</span>
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-1">
          <Lightbulb className="h-4 w-4" />
          <span>Favorites</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="agents" className="m-0">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop to create your magical team!
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-6 px-1">
            {Object.entries(categories).map(([category, categoryAgents]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  {category === 'marketing' && <MessageSquare className="h-4 w-4" />}
                  {category === 'creative' && <PenTool className="h-4 w-4" />}
                  {category === 'analytics' && <BarChart3 className="h-4 w-4" />}
                  <span className="capitalize">{category}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {categoryAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-3 mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Magic Tip!</span>
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  You can connect multiple helpers to create a super-powered team
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                onClick={() => {
                  toast({
                    title: "Coming Soon!",
                    description: "Soon you'll be able to create your own magical helpers.",
                  });
                }}
              >
                <PlusCircle className="h-4 w-4 text-indigo-500" />
                <span>Create my own helper</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="suggestions" className="m-0">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recommended teams ready to use
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-4 px-1">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                title={suggestion.title}
                description={suggestion.description}
                onClick={() => applySuggestion(suggestion)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="favorites" className="m-0">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] text-center">
          <div className="relative mb-4">
            <Bot className="h-16 w-16 text-indigo-300 dark:text-indigo-600" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-amber-500 flex items-center justify-center rounded-full text-white text-xs">
              ⭐
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            Your favorite helpers!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs">
            Here we'll save the helpers you use most so you'll always have them at hand
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="gap-2 border-dashed">
              <Star className="h-4 w-4" />
              <span>Explore more helpers</span>
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LegoToolbox;