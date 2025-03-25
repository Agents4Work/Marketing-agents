import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useQueryParam } from '@/hooks/useQueryParam';
import { AgentLibrary } from '@/components/workflow';
import { ReactFlowProvider, Node, Edge } from 'reactflow';
import { NodeData } from '@/lib/workflowTypes';
import EnhancedCanvas from '@/components/workflow/EnhancedCanvas';
import CustomLegoCanvas from '@/components/workflow/CustomLegoCanvas';
// Using AgentConfigModal directly for better maintainability
import AgentConfigModal from '@/components/AgentConfigModal';
import WorkflowExecutor from '@/components/workflow/WorkflowExecutor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Play,
  Download,
  Info,
  Bot,
  Users,
  Settings,
  MessageSquare,
  Clock,
  CheckCircle2,
  Inbox,
  Wand2,
  ArrowRight
} from 'lucide-react';
import { Agent, AgentType, AgentConfig, SocialMediaAgentConfig } from '@/lib/agents';
import {
  LegoWorkflowExecutionResult,
  LegoWorkflowNode,
  LegoWorkflowEdge
} from '@/lib/langchain-sdk';

// Define an augmented agent type to ensure compatibility with both AgentLibrary and EnhancedCanvas
// This matches the AgentData from AgentLibrary component
interface WorkflowAgentData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category?: 'agent' | 'tool';
}

// Type for conversation message
interface ConversationMessage {
  agent: string;
  type: 'message' | 'system';
  content: string;
  timestamp: Date;
}

// Helper function to convert WorkflowAgentData to Agent type
const convertToAgentType = (agentData: WorkflowAgentData): Agent => {
  // Get a valid configuration based on agent type
  const getConfiguration = (type: string) => {
    // List of valid agent types
    const validAgentTypes = ['seo', 'copywriting', 'ads', 'creative', 'email', 'analytics', 'social'];
    
    // Convert to a valid AgentType or default to social if not recognized
    const agentType = validAgentTypes.includes(type) 
      ? type as AgentType 
      : 'social' as AgentType;
    
    // Return appropriate configuration based on agent type
    switch(agentType) {
      case 'seo':
        return {
          mode: "autonomous" as const,
          keywords: ['marketing', 'ai'],
          targetAudience: 'Business Professionals',
          contentType: 'Blog Post',
          optimizationLevel: 3
        };
      case 'copywriting':
        return {
          mode: "autonomous" as const,
          contentType: 'Article',
          tone: 'Professional',
          length: 'Medium'
        };
      case 'creative':
        return {
          mode: "autonomous" as const,
          style: 'Modern',
          size: '1024x1024',
          format: 'PNG'
        };
      case 'ads':
        return {
          mode: "autonomous" as const,
          platform: 'Facebook',
          budget: 500,
          objective: 'Conversions'
        };
      case 'email':
        return {
          mode: "autonomous" as const,
          frequency: 'Weekly',
          type: 'Newsletter',
          subject: 'Weekly Updates'
        };
      case 'analytics':
        return {
          mode: "autonomous" as const,
          metrics: ['Clicks', 'Conversions', 'Engagement'],
          reportFrequency: 'Weekly'
        };
      case 'social':
      default:
        return {
          mode: "autonomous" as const,
          platforms: ['Twitter', 'LinkedIn'],
          postingFrequency: 'Daily',
          contentMix: 'Text and Images'
        };
    }
  };
  
  return {
    id: parseInt(agentData.id.replace('agent-', '')) || 1,
    type: agentData.type as AgentType,
    name: agentData.name,
    description: agentData.description,
    icon: typeof agentData.icon === 'string' ? agentData.icon : 'bot',
    color: agentData.color || 'blue-500',
    configuration: getConfiguration(agentData.type)
  };
};

// Template workflow configurations
const workflowTemplates = [
  {
    id: 'marketing-team',
    name: 'Marketing Campaign Team',
    description: 'A complete team for planning and executing marketing campaigns',
    agents: [
      {
        id: 'agent-strategy',
        name: 'Strategy Director',
        type: 'strategy',
        description: 'Develops marketing strategy and campaign objectives',
        icon: <Users className="h-6 w-6" />,
        color: 'bg-blue-500',
      },
      {
        id: 'agent-creative',
        name: 'Creative Director',
        type: 'creative',
        description: 'Generates content ideas and creative direction',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-purple-500'
      },
      {
        id: 'agent-copywriter',
        name: 'Copywriter',
        type: 'copywriting',
        description: 'Creates compelling copy for all marketing materials',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-green-500'
      },
      {
        id: 'agent-seo',
        name: 'SEO Expert',
        type: 'seo',
        description: 'Optimizes content for search engines',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-amber-500'
      },
      {
        id: 'agent-analytics',
        name: 'Analytics Manager',
        type: 'analytics',
        description: 'Sets up tracking and measures campaign performance',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-cyan-500'
      }
    ],
    tasks: [
      'Define campaign strategy',
      'Create content plan',
      'Produce marketing assets',
      'Optimize for search',
      'Configure analytics'
    ],
    category: 'Marketing',
    complexity: 'Advanced',
    estimatedTime: '2-3 days',
    useCase: 'Full marketing campaign planning and execution'
  },
  {
    id: 'content-team',
    name: 'Content Production Team',
    description: 'A team focused on content creation and optimization',
    agents: [
      {
        id: 'agent-content-strategist',
        name: 'Content Strategist',
        type: 'strategy',
        description: 'Plans content themes and editorial calendar',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-indigo-500'
      },
      {
        id: 'agent-writer',
        name: 'Content Writer',
        type: 'copywriting',
        description: 'Creates engaging articles and blog posts',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-emerald-500'
      },
      {
        id: 'agent-editor',
        name: 'Content Editor',
        type: 'copywriting',
        description: 'Reviews and polishes content',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-rose-500'
      },
      {
        id: 'agent-seo-specialist',
        name: 'SEO Specialist',
        type: 'seo',
        description: 'Optimizes content for search visibility',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-amber-500'
      }
    ],
    tasks: [
      'Plan content calendar',
      'Draft articles and posts',
      'Edit and optimize content',
      'Implement SEO best practices'
    ],
    category: 'Content',
    complexity: 'Intermediate',
    estimatedTime: '1-2 days',
    useCase: 'Blog and website content production'
  },
  {
    id: 'social-team',
    name: 'Social Media Team',
    description: 'A team dedicated to social media management and engagement',
    agents: [
      {
        id: 'agent-social-strategist',
        name: 'Social Strategist',
        type: 'strategy',
        description: 'Develops social media strategy and campaign objectives',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-blue-500'
      },
      {
        id: 'agent-content-creator',
        name: 'Content Creator',
        type: 'creative',
        description: 'Creates engaging social posts and visuals',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-purple-500'
      },
      {
        id: 'agent-community-manager',
        name: 'Community Manager',
        type: 'social',
        description: 'Handles engagement and community interactions',
        icon: <Bot className="h-6 w-6" />,
        color: 'bg-pink-500'
      }
    ],
    tasks: [
      'Develop social strategy',
      'Create social content',
      'Plan engagement campaigns',
      'Monitor social performance'
    ],
    category: 'Social Media',
    complexity: 'Basic',
    estimatedTime: '1 day',
    useCase: 'Social media campaign planning and content creation'
  }
];

export default function LegoWorkflow() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const templateId = useQueryParam('template');
  const [workflowName, setWorkflowName] = useState('My AI Team');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  // State for agent communication
  const [isTeamActive, setIsTeamActive] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  
  // State for node configuration
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Handle when a template is selected via URL param
  useEffect(() => {
    if (templateId) {
      const template = workflowTemplates.find(t => t.id === templateId);
      if (template) {
        setWorkflowName(template.name);
        
        // Create initial nodes from template
        const templateNodes = template.agents.map((agent, index) => ({
          id: `agent-${Date.now()}-${index}`,
          type: 'agentNode',
          position: { x: 250 * index + 100, y: 200 },
          data: { ...agent },
        }));
        
        // Create edges connecting the nodes
        const templateEdges = templateNodes.slice(0, -1).map((node, index) => ({
          id: `edge-${Date.now()}-${index}`,
          source: node.id,
          target: templateNodes[index + 1].id,
          animated: true,
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          data: { label: 'Connected' },
        }));
        
        setNodes(templateNodes);
        setEdges(templateEdges);
        
        toast({
          title: `Template "${template.name}" loaded`,
          description: 'Customize this team for your specific needs.',
        });
      }
    }
  }, [templateId, toast]);

  // Handle drag start of an agent from the library
  const handleAgentDrag = useCallback((agent: WorkflowAgentData) => {
    // This will be handled by the Canvas component
    console.log('Agent drag started:', agent);
  }, []);

  // Handle saving the workflow
  const handleSaveWorkflow = useCallback(() => {
    toast({
      title: 'Team saved',
      description: 'Your AI team configuration has been saved successfully.',
    });
  }, [toast]);

  // Handle activating the team/workflow
  const handleActivateTeam = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: 'No agents',
        description: 'Add at least one agent before activating the team.',
        variant: 'destructive',
      });
      return;
    }

    setIsTeamActive(true);
    setIsRunning(true);
    
    // Simulate agent communication
    const agentNames = nodes.map(node => node.data.name);
    
    // Create simulated conversation history
    const simulatedHistory = [
      {
        agent: nodes[0].data.name,
        type: 'message' as const,
        content: `Initializing AI team for project "${workflowName}"...`,
        timestamp: new Date(),
      }
    ];
    
    setConversationHistory(simulatedHistory);
    
    // Gradually add messages to simulate agent communication
    setTimeout(() => {
      setConversationHistory(prev => [
        ...prev,
        {
          agent: nodes[0].data.name,
          type: 'message' as const,
          content: 'Analyzing project objectives and defining initial strategy.',
          timestamp: new Date(),
        }
      ]);
      
      setTimeout(() => {
        if (nodes.length > 1) {
          setConversationHistory(prev => [
            ...prev,
            {
              agent: nodes[1].data.name,
              type: 'message' as const,
              content: `Receiving strategic context from ${nodes[0].data.name}. Beginning to process.`,
              timestamp: new Date(),
            }
          ]);
        }
        
        setTimeout(() => {
          setConversationHistory(prev => [
            ...prev,
            {
              agent: 'System',
              type: 'system' as const,
              content: 'The agents are working. This is a preview of the functionality.',
              timestamp: new Date(),
            }
          ]);
          
          setTimeout(() => {
            setIsRunning(false);
            setConversationHistory(prev => [
              ...prev,
              {
                agent: 'System',
                type: 'system' as const,
                content: 'Demo completed. In the full version, agents would work together using AI.',
                timestamp: new Date(),
              }
            ]);
          }, 3000);
        }, 2000);
      }, 2000);
    }, 1500);
    
    toast({
      title: 'Team activated!',
      description: 'The agents are starting to work together...',
    });
  }, [nodes, workflowName, toast]);

  // Reset the workflow
  const handleResetWorkflow = useCallback(() => {
    setIsTeamActive(false);
    setConversationHistory([]);
    
    toast({
      title: 'Team reset',
      description: 'The team has been reset. You can activate it again when ready.',
    });
  }, [toast]);

  // Format time for conversation history
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top navigation */}
      <header className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/ai-workflows')}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-transparent border-none p-0 focus:ring-0 text-xl font-bold text-gray-900 dark:text-white max-w-md"
                  placeholder="Team name"
                />
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Team Builder
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveWorkflow}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
            
            {isTeamActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetWorkflow}
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleActivateTeam}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4" />
                <span>Activate Team</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Agent Library */}
        <AgentLibrary
          agents={workflowTemplates
            .flatMap(template => template.agents)
            .filter((agent, index, self) => 
              index === self.findIndex(a => a.id === agent.id)
            )}
          onAgentDrag={handleAgentDrag}
        />
        
        {/* Main workflow canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* CustomLegoCanvas component for team-based workflow visualization */}
          <div className="flex-1 overflow-hidden">
            <CustomLegoCanvas 
              agents={workflowTemplates
                .flatMap(template => template.agents)
                .filter((agent, index, self) => 
                  index === self.findIndex(a => a.id === agent.id)
                )}
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onSave={handleSaveWorkflow}
              onRun={handleActivateTeam}
              onNodeClick={(nodeData) => {
                // Find the clicked node in our nodes array
                const node = nodes.find(n => n.id === nodeData.id);
                if (node) {
                  setSelectedNode(node);
                  setConfigModalOpen(true);
                }
              }}
              useTeamView={true}
            />
          </div>
        </div>

        {/* Right sidebar - AI Workflow Execution */}
        <div className="w-[380px] border-l bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
          <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
            <div className="px-4 pt-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-500" />
                  <span>Team Execution</span>
                </h2>
              </div>
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
                <TabsTrigger value="executor">Vertex AI</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
              {!isTeamActive ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Your team is ready
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                      Activate your team to see how the agents work together to complete assigned tasks.
                    </p>
                    <Button
                      onClick={handleActivateTeam}
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="h-4 w-4" />
                      <span>Activate Team</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Conversation history */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversationHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.type === 'system' ? 'justify-center' : 'gap-3'}`}
                        >
                          {message.type !== 'system' && (
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              message.agent === 'System' 
                                ? 'bg-gray-200 dark:bg-gray-700' 
                                : nodes.find(n => n.data.label === message.agent)?.data.color || 'bg-blue-500'
                            }`}>
                              <span className="text-white text-xs font-medium">
                                {message.agent.substring(0, 2)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`${message.type === 'system' ? 'w-full' : 'flex-1'}`}>
                            {message.type !== 'system' && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {message.agent}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            )}
                            
                            {message.type === 'system' ? (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-center text-sm text-gray-600 dark:text-gray-300">
                                <Info className="h-4 w-4 inline mr-1.5 text-gray-500 dark:text-gray-400" />
                                {message.content}
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2.5 text-gray-800 dark:text-gray-200 text-sm">
                                {message.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isRunning && (
                        <div className="flex justify-center">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-md p-2 text-center text-sm text-blue-700 dark:text-blue-300 animate-pulse">
                            The agents are working...
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Message input (disabled in demo) */}
                  <div className="p-4 border-t">
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        placeholder="This is a demo. You cannot send messages."
                        className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-full py-2 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500"
                      />
                      <Button
                        disabled
                        className="absolute right-1 top-1 rounded-full h-6 w-6"
                        size="icon"
                        variant="ghost"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                      In the full version, you will be able to interact with the agents
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="executor" className="flex-1 overflow-auto m-0 data-[state=inactive]:hidden">
              <WorkflowExecutor
                workflow={workflowName}
                nodes={nodes as LegoWorkflowNode[]}
                edges={edges as LegoWorkflowEdge[]}
                initialState={{
                  campaign: workflowName,
                  objective: "Generate marketing content",
                  audience: "General audience",
                }}
                onExecutionComplete={(result) => {
                  console.log("Workflow execution completed:", result);
                  // Add team chat messages based on execution results
                  if (result.success && result.nodeResults) {
                    const nodeIds = Object.keys(result.nodeResults);
                    if (nodeIds.length > 0) {
                      // Set team as active if it's not already
                      if (!isTeamActive) {
                        setIsTeamActive(true);
                      }
                      
                      // Create messages from each node result
                      const newMessages = nodeIds.map(nodeId => {
                        const node = nodes.find(n => n.id === nodeId);
                        const nodeResult = result.nodeResults[nodeId];
                        const content = typeof nodeResult === 'string' 
                          ? nodeResult.substring(0, 200) + (nodeResult.length > 200 ? '...' : '') 
                          : JSON.stringify(nodeResult).substring(0, 200) + '...';
                          
                        return {
                          agent: node?.data?.label || "AI Agent",
                          type: "message" as const,
                          content,
                          timestamp: new Date(),
                        };
                      });
                      
                      setConversationHistory(prev => [...prev, ...newMessages]);
                    }
                  }
                }}
                className="h-full"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Agent Configuration Modal */}
      {selectedNode && selectedNode.data && (
        <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure {selectedNode?.data?.label || 'Agent'}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <AgentConfigModal
                isOpen={true}
                onClose={() => {}}
                agent={selectedNode.data.agent || convertToAgentType({
                  id: selectedNode.id,
                  name: selectedNode.data.label,
                  type: (selectedNode.data.nodeType as any)?.agentType || 'social',
                  description: selectedNode.data.description || '',
                  icon: selectedNode.data.icon,
                  color: 'bg-blue-500'
                } as WorkflowAgentData)}
                onConfigUpdate={(updatedAgent) => {
                  // Update the node with the new agent configuration
                  const updatedNodes = nodes.map(node => 
                    node.id === selectedNode.id 
                      ? { 
                          ...node, 
                          data: { 
                            ...node.data, 
                            agent: updatedAgent
                          }
                        }
                      : node
                  );
                  setNodes(updatedNodes);
                }}
                embedded={true}
              />
            </div>
            
            <DialogFooter>
              <Button onClick={() => setConfigModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}