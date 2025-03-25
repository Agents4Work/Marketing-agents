import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Users, Wrench, Bot, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Interfaces requeridas
interface AgentData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category?: 'agent' | 'tool';
}

interface AgentLibraryProps {
  agents: AgentData[];
  onAgentDrag?: (agent: AgentData) => void;
  collapsed?: boolean;
}

// Define categories
const CATEGORIES = {
  AGENT: 'agent',
  TOOL: 'tool'
};

// AgentLibrary Component
const AgentLibrary: React.FC<AgentLibraryProps> = ({
  agents,
  onAgentDrag,
  collapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES.AGENT);
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: AgentData) => {
    // Set data in multiple formats to ensure compatibility
    const agentJson = JSON.stringify(agent);
    e.dataTransfer.setData('application/reactflow', agentJson);
    e.dataTransfer.setData('application/json', agentJson);
    e.dataTransfer.setData('text/plain', agentJson);
    e.dataTransfer.setData('text', agentJson);
    
    // Use a simpler approach for drag image - just show the element being dragged
    try {
      // Set drag effect
      e.dataTransfer.effectAllowed = 'move';
      
      console.log('Drag data set in multiple formats:', agent);
    } catch (err) {
      console.error('Error setting drag data:', err);
    }
    
    if (onAgentDrag) {
      onAgentDrag(agent);
    }
  };
  
  // Function to categorize elements
  const categorizedItems = React.useMemo(() => {
    const result = {
      [CATEGORIES.AGENT]: [] as AgentData[],
      [CATEGORIES.TOOL]: [] as AgentData[]
    };
    
    agents.forEach(agent => {
      // Assign category based on the 'category' property or infer from type
      const category = agent.category || 
                       (agent.type?.toLowerCase().includes('tool') || 
                        agent.type?.toLowerCase().includes('herramienta') ? 
                          CATEGORIES.TOOL : CATEGORIES.AGENT);
      
      if (category === CATEGORIES.AGENT || category === CATEGORIES.TOOL) {
        result[category].push(agent);
      } else {
        result[CATEGORIES.AGENT].push(agent);
      }
    });
    
    return result;
  }, [agents]);
  
  // Function to group by type within a category
  const getGroupedByType = (items: AgentData[]) => {
    const grouped: Record<string, AgentData[]> = {};
    
    items.forEach(item => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });
    
    return Object.entries(grouped).map(([type, items]) => ({
      type,
      items
    }));
  };
  
  // Get current groups based on the selected tab
  const currentGroups = React.useMemo(() => {
    return getGroupedByType(categorizedItems[activeTab as keyof typeof categorizedItems] || []);
  }, [activeTab, categorizedItems]);
  
  // Render the component
  return (
    <div className={`h-full border-r bg-white dark:bg-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-72'
    }`}>
      <div className="flex justify-between items-center p-3 border-b">
        {!isCollapsed && (
          <h3 className="font-medium text-sm">Library</h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed ? (
        <div className="flex flex-col h-[calc(100%-3rem)]">
          <Tabs 
            defaultValue={CATEGORIES.AGENT}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4 pt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={CATEGORIES.AGENT} className="text-xs">
                  <Bot className="h-3.5 w-3.5 mr-1" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value={CATEGORIES.TOOL} className="text-xs">
                  <Wrench className="h-3.5 w-3.5 mr-1" />
                  Tools
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={CATEGORIES.AGENT} className="mt-0 flex-grow h-[calc(100%-2.5rem)] overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(100vh-10rem)]">
                <div className="p-3 space-y-4">
                  {currentGroups.length > 0 ? (
                    currentGroups.map(group => (
                      <div key={group.type} className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {group.type}
                        </h4>
                        
                        <div className="space-y-2">
                          {group.items.map(agent => (
                            <Card
                              key={agent.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, agent)}
                              className="cursor-grab hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`h-8 w-8 rounded-full ${agent.color} flex items-center justify-center text-white`}
                                  >
                                    {React.isValidElement(agent.icon) ? agent.icon : <span>AI</span>}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{agent.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{agent.type}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">{agent.description}</p>
                                
                                <div className="mt-2 flex justify-between items-center">
                                  <Badge variant="outline" className="text-xs">
                                    {agent.type}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Drag</span>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 px-2 text-xs"
                                      onClick={() => {
                                        // Create a synthetic drag event with the agent data
                                        if (onAgentDrag) {
                                          onAgentDrag(agent);
                                          
                                          // Using custom event to signal a direct add
                                          const customEvent = new CustomEvent('direct-agent-add', {
                                            detail: {
                                              agent: agent,
                                              position: { x: 250, y: 150 + Math.random() * 50 }
                                            },
                                            bubbles: true
                                          });
                                          document.dispatchEvent(customEvent);
                                        }
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No agents available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value={CATEGORIES.TOOL} className="mt-0 flex-grow h-[calc(100%-2.5rem)] overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(100vh-10rem)]">
                <div className="p-3 space-y-4">
                  {currentGroups.length > 0 ? (
                    currentGroups.map(group => (
                      <div key={group.type} className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {group.type}
                        </h4>
                        
                        <div className="space-y-2">
                          {group.items.map(tool => (
                            <Card
                              key={tool.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, tool)}
                              className="cursor-grab hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`h-8 w-8 rounded-full ${tool.color} flex items-center justify-center text-white`}
                                  >
                                    {React.isValidElement(tool.icon) ? tool.icon : <span>T</span>}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{tool.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tool.type}</p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">{tool.description}</p>
                                
                                <div className="mt-2 flex justify-between items-center">
                                  <Badge variant="outline" className="text-xs">
                                    {tool.type}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Drag</span>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 px-2 text-xs"
                                      onClick={() => {
                                        // Create a synthetic drag event with the tool data
                                        if (onAgentDrag) {
                                          onAgentDrag(tool);
                                          
                                          // Using custom event to signal a direct add
                                          const customEvent = new CustomEvent('direct-agent-add', {
                                            detail: {
                                              agent: tool,
                                              position: { x: 250, y: 150 + Math.random() * 50 }
                                            },
                                            bubbles: true
                                          });
                                          document.dispatchEvent(customEvent);
                                        }
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tools available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-4 space-y-6">
          {/* Category selector for collapsed mode */}
          <div className="flex flex-col items-center space-y-2">
            <Button 
              variant={activeTab === CATEGORIES.AGENT ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-full shadow-sm"
              onClick={() => setActiveTab(CATEGORIES.AGENT)}
              title="Agents"
            >
              <Bot className="h-5 w-5" />
            </Button>
            
            <Button 
              variant={activeTab === CATEGORIES.TOOL ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-full shadow-sm"
              onClick={() => setActiveTab(CATEGORIES.TOOL)}
              title="Tools"
            >
              <Wrench className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 w-8 mx-auto"></div>
          
          {/* List of elements in the selected category */}
          <div className="flex flex-col items-center space-y-3 overflow-auto max-h-[calc(100vh-12rem)]">
            {(categorizedItems[activeTab as keyof typeof categorizedItems] || []).map(item => (
              <div className="flex flex-col items-center gap-1" key={item.id}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`h-10 w-10 rounded-full ${item.color} flex items-center justify-center text-white cursor-grab hover:scale-110 transition-transform shadow-md`}
                  title={item.name}
                >
                  {React.isValidElement(item.icon) ? item.icon : 
                    activeTab === CATEGORIES.AGENT ? <span>AI</span> : <span>T</span>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 rounded-full"
                  title={`Add ${item.name}`}
                  onClick={() => {
                    // Create a synthetic drag event with the agent/tool data
                    if (onAgentDrag) {
                      onAgentDrag(item);
                      
                      // Using custom event to signal a direct add
                      const customEvent = new CustomEvent('direct-agent-add', {
                        detail: {
                          agent: item,
                          position: { x: 250, y: 150 + Math.random() * 50 }
                        },
                        bubbles: true
                      });
                      document.dispatchEvent(customEvent);
                    }
                  }}
                >
                  <Plus size={10} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom function to compare props and avoid unnecessary renders
const areEqual = (prevProps: AgentLibraryProps, nextProps: AgentLibraryProps) => {
  // If collapsed state changes, it must re-render
  if (prevProps.collapsed !== nextProps.collapsed) return false;
  
  // If the number of agents is different, it must re-render
  if (prevProps.agents.length !== nextProps.agents.length) return false;
  
  // Check if the list of agents has changed
  const prevIds = prevProps.agents.map(a => a.id).sort().join(',');
  const nextIds = nextProps.agents.map(a => a.id).sort().join(',');
  
  return prevIds === nextIds;
};

// Apply memoization with the custom comparison function
export default React.memo(AgentLibrary, areEqual);