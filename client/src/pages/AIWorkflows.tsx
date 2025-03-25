import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  Bot, 
  FileText, 
  ArrowRight, 
  Play, 
  Brain, 
  Calendar, 
  Clock, 
  BarChart,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Zap,
  PenTool,
  Share2,
  Search,
  Mail,
  PieChart,
  Plus,
  ExternalLink,
  ChevronRight,
  CornerDownRight,
  Users
} from "lucide-react";
import { useLocation } from "wouter";
import SidebarOptimized from "@/components/SidebarOptimized";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Template workflow types
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  agents: AgentData[];
  tasks: string[];
  category: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced'; // Fixed: Changed to English
  estimatedTime: string;
  useCase: string;
}

// Agent data structure
interface AgentData {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Agent types
type AgentType = 
  | 'strategy' 
  | 'creative' 
  | 'social' 
  | 'seo' 
  | 'analytics' 
  | 'email'
  | 'content';

export default function AIWorkflows() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAgentCat, setSelectedAgentCat] = useState<string | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'workflow-selection' | 'workflow-builder'>('dashboard');

  // Agent categories
  const agentCategories = [
    { id: 'strategy', name: 'Strategy', icon: <Brain className="h-6 w-6" />, color: 'bg-violet-500' },
    { id: 'creative', name: 'Creative', icon: <PenTool className="h-6 w-6" />, color: 'bg-rose-500' },
    { id: 'marketing', name: 'Marketing', icon: <BarChart className="h-6 w-6" />, color: 'bg-blue-500' },
    { id: 'social', name: 'Social Media', icon: <Share2 className="h-6 w-6" />, color: 'bg-pink-500' },
    { id: 'seo', name: 'SEO', icon: <Search className="h-6 w-6" />, color: 'bg-amber-500' },
    { id: 'email', name: 'Email', icon: <Mail className="h-6 w-6" />, color: 'bg-emerald-500' },
    { id: 'analytics', name: 'Analytics', icon: <PieChart className="h-6 w-6" />, color: 'bg-indigo-500' },
  ];

  // All agents
  const agents: AgentData[] = [
    // Strategy
    { 
      id: 'strategy-marketing', 
      name: 'Marketing Strategist', 
      type: 'strategy',
      description: 'Plans complete campaigns and generates effective strategies',
      icon: <Brain />,
      color: 'bg-violet-500' 
    },
    { 
      id: 'strategy-audience', 
      name: 'Audience Analyst', 
      type: 'strategy',
      description: 'Identifies your ideal audience and creates detailed profiles',
      icon: <Users />,
      color: 'bg-violet-500' 
    },
    
    // Creative
    { 
      id: 'creative-content', 
      name: 'Content Creative', 
      type: 'creative',
      description: 'Generates creative ideas for all types of content',
      icon: <PenTool />,
      color: 'bg-rose-500' 
    },
    { 
      id: 'creative-design', 
      name: 'Design Assistant', 
      type: 'creative',
      description: 'Creates impactful visual concepts for your campaigns',
      icon: <PenTool />,
      color: 'bg-rose-500' 
    },
    
    // Social Media
    { 
      id: 'social-manager', 
      name: 'Social Media Manager', 
      type: 'social',
      description: 'Manages and optimizes your social media profiles',
      icon: <Share2 />,
      color: 'bg-pink-500' 
    },
    { 
      id: 'social-content', 
      name: 'Social Content Specialist', 
      type: 'social',
      description: 'Creates tailored content for each social platform',
      icon: <Share2 />,
      color: 'bg-pink-500' 
    },
    
    // SEO
    { 
      id: 'seo-specialist', 
      name: 'SEO Specialist', 
      type: 'seo',
      description: 'Optimizes content to improve organic search rankings',
      icon: <Search />,
      color: 'bg-amber-500' 
    },
    { 
      id: 'seo-keyword', 
      name: 'Keyword Researcher', 
      type: 'seo',
      description: 'Finds the perfect keywords for your business',
      icon: <Search />,
      color: 'bg-amber-500' 
    },
    
    // Email
    { 
      id: 'email-copywriter', 
      name: 'Email Copywriter', 
      type: 'email',
      description: 'Writes persuasive emails that convert',
      icon: <Mail />,
      color: 'bg-emerald-500' 
    },
    { 
      id: 'email-automation', 
      name: 'Automation Specialist', 
      type: 'email',
      description: 'Sets up effective automated email sequences',
      icon: <Mail />,
      color: 'bg-emerald-500' 
    },
    
    // Analytics
    { 
      id: 'analytics-data', 
      name: 'Data Analyst', 
      type: 'analytics',
      description: 'Interprets metrics and extracts actionable insights',
      icon: <PieChart />,
      color: 'bg-indigo-500' 
    },
    { 
      id: 'analytics-performance', 
      name: 'Performance Optimizer', 
      type: 'analytics',
      description: 'Improves conversion based on real data',
      icon: <PieChart />,
      color: 'bg-indigo-500' 
    },
    
    // Content
    { 
      id: 'content-writer', 
      name: 'Professional Writer', 
      type: 'content',
      description: 'Writes articles, blogs, and all types of written content',
      icon: <FileText />,
      color: 'bg-blue-500' 
    },
    { 
      id: 'content-editor', 
      name: 'Content Editor', 
      type: 'content',
      description: 'Improves and refines existing texts',
      icon: <FileText />,
      color: 'bg-blue-500' 
    },
  ];

  // Filtered agents based on selected category
  const filteredAgents = selectedAgentCat 
    ? agents.filter(agent => agent.type === selectedAgentCat) 
    : agents;

  // Workflow templates with actual agent data
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'content-creation',
      name: 'Content Creator Team',
      description: 'A complete team to generate SEO-optimized content and distribute it across multiple platforms.',
      agents: [
        agents.find(a => a.id === 'strategy-marketing')!,
        agents.find(a => a.id === 'content-writer')!,
        agents.find(a => a.id === 'seo-specialist')!,
        agents.find(a => a.id === 'social-content')!
      ],
      tasks: ['Idea Generation', 'Keyword Research', 'Content Creation', 'SEO Optimization', 'Social Media Distribution'],
      category: 'Content',
      complexity: 'Intermediate',
      estimatedTime: '~15 minutes',
      useCase: 'Create an optimized blog post with promotional material for social media'
    },
    {
      id: 'ad-optimization',
      name: 'Ad Optimization Team',
      description: 'Optimize your advertising campaigns with AI-based analysis and improvement recommendations.',
      agents: [
        agents.find(a => a.id === 'analytics-performance')!,
        agents.find(a => a.id === 'strategy-audience')!,
        agents.find(a => a.id === 'creative-design')!
      ],
      tasks: ['Existing Campaign Analysis', 'Audience Segmentation', 'Copy Optimization', 'A/B Testing', 'Smart Budgeting'],
      category: 'Advertising',
      complexity: 'Advanced',
      estimatedTime: '~20 minutes',
      useCase: 'Improve the performance of advertising campaigns on Meta and Google Ads'
    },
    {
      id: 'email-marketing',
      name: 'Email Marketing Team',
      description: 'Create effective email campaigns with personalized content and optimized subject lines.',
      agents: [
        agents.find(a => a.id === 'email-copywriter')!,
        agents.find(a => a.id === 'email-automation')!,
        agents.find(a => a.id === 'analytics-data')!
      ],
      tasks: ['Template Creation', 'Subject Line Generation', 'Segmentation', 'A/B Testing', 'Metrics Analysis'],
      category: 'Email',
      complexity: 'Basic',
      estimatedTime: '~10 minutes',
      useCase: 'Create an email sequence for lead nurturing'
    },
    {
      id: 'social-media',
      name: 'Social Media Team',
      description: 'Generate platform-specific content with AI-created images.',
      agents: [
        agents.find(a => a.id === 'social-manager')!,
        agents.find(a => a.id === 'creative-content')!,
        agents.find(a => a.id === 'analytics-data')!
      ],
      tasks: ['Content Planning', 'Image Creation', 'Hashtag Research', 'Publishing Calendars', 'Engagement Analysis'],
      category: 'Social Media',
      complexity: 'Intermediate',
      estimatedTime: '~15 minutes',
      useCase: 'Create a monthly content calendar for Instagram, Twitter and LinkedIn'
    }
  ];

  // Handler for when a pre-made template is selected
  const handleUseTemplate = (templateId: string) => {
    toast({
      title: "Template selected!",
      description: "Preparing the team editor...",
    });
    
    // Navigate to the lego workflow page with the template ID
    setTimeout(() => {
      setLocation(`/lego-workflow?template=${templateId}`);
    }, 1000);
  };

  // Handler for creating a custom workflow
  const handleCreateCustom = () => {
    toast({
      title: "Starting team editor",
      description: "Preparing a blank canvas for you...",
    });
    
    setTimeout(() => {
      setLocation('/lego-workflow');
    }, 1000);
  };

  // Handle agent drag
  const handleAgentDragStart = (e: React.DragEvent<HTMLDivElement>, agent: AgentData) => {
    e.dataTransfer.setData('application/json', JSON.stringify(agent));
    
    // Show hint about drag and drop
    toast({
      title: "Drag and drop!",
      description: "Drag this agent to the canvas area.",
    });
  };

  // Function to render the main dashboard
  const renderDashboard = () => {
    return (
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Workflows</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Build AI teams that automate your marketing tasks
            </p>
          </div>
          
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setActiveView('workflow-selection')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Team
          </Button>
        </div>
        
        {/* Workspaces grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* New team */}
          <Card 
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer"
            onClick={() => setActiveView('workflow-selection')}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-[200px]">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Team</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                Build an AI agent team from scratch
              </p>
            </CardContent>
          </Card>
          
          {/* Popular Templates */}
          {workflowTemplates.slice(0, 2).map(template => (
            <Card key={template.id} className="border-2 border-white dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md overflow-hidden bg-white dark:bg-gray-800 cursor-pointer"
            onClick={() => handleUseTemplate(template.id)}>
              <CardContent className="p-0">
                <div className="py-5 px-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {template.description.length > 100 
                          ? template.description.substring(0, 97) + '...' 
                          : template.description}
                      </p>
                    </div>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="px-6 pb-5">
                  <div className="flex -space-x-2 overflow-hidden">
                    {template.agents.slice(0, 4).map((agent, i) => (
                      <Avatar key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 ${agent.color}`}>
                        <AvatarFallback className="text-white text-xs">
                          {agent.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional sections */}
        <div className="space-y-6">
          {/* Your Teams */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Teams</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <Bot className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">You don't have any teams yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                Create your first AI agent team to get started
              </p>
              <Button
                onClick={() => setActiveView('workflow-selection')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create My First Team</span>
              </Button>
            </div>
          </section>
          
          {/* All templates */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Templates</h2>
              <Button 
                variant="ghost" 
                className="text-gray-600 dark:text-gray-400 gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setActiveView('workflow-selection')}
              >
                <span>View All</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflowTemplates.map(template => (
                <Card key={template.id} className="border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md bg-white dark:bg-gray-800 cursor-pointer overflow-hidden"
                onClick={() => handleUseTemplate(template.id)}>
                  <CardContent className="p-0">
                    <div className="py-4 px-5">
                      <div className="flex items-start">
                        <div>
                          <Badge className="mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {template.category}
                          </Badge>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{template.name}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-5 py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        <span>{template.agents.length} agents</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // Function to render workflow selection
  const renderWorkflowSelection = () => {
    return (
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => setActiveView('dashboard')}
          >
            <ArrowRight className="h-4 w-4 transform rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose how to start</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Use a template or create your team from scratch
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Start from scratch */}
          <Card 
            className="border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
            onClick={handleCreateCustom}
          >
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start from scratch</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Build a custom team by selecting exactly the agents you need
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Create blank team
              </Button>
            </CardContent>
          </Card>
          
          {/* Use template */}
          <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Use a template</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose from predefined configurations for specific marketing tasks
              </p>
              <Button 
                variant="outline"
                className="w-full border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                View templates
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Templates */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Popular Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflowTemplates.map(template => (
              <Card 
                key={template.id} 
                className="border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md overflow-hidden cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => handleUseTemplate(template.id)}
              >
                <CardContent className="p-0">
                  <div className="py-5 px-6">
                    <Badge className="mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {template.category}
                    </Badge>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  <div className="px-6 pb-3">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Included Agents</h4>
                    <div className="flex -space-x-2 overflow-hidden">
                      {template.agents.map((agent, i) => (
                        <Avatar key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 ${agent.color}`}>
                          <AvatarFallback className="text-white text-xs">
                            {agent.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                        {template.complexity}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <span>Use</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Function to render the workflow builder with LEGO-style interface
  const renderWorkflowBuilder = () => {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Agent Library */}
        <div className="w-1/4 border-r bg-white dark:bg-gray-800 overflow-auto flex flex-col">
            <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                <span>Agent Library</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Drag agents to the canvas to build your team
              </p>
            </div>
            
            {/* Agent Categories */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {agentCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedAgentCat(category.id === selectedAgentCat ? null : category.id)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                      selectedAgentCat === category.id 
                        ? `${category.color} text-white` 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Agent Cards */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="cursor-grab"
                      draggable
                      onDragStart={(e) => handleAgentDragStart(e, agent)}
                    >
                      <Card 
                        className={`relative overflow-hidden border-2 shadow-sm hover:shadow-md transition-all border-${agent.color.replace('bg-', '')}/50`}
                      >
                        <div 
                          className={`absolute top-0 left-0 right-0 h-1.5 ${agent.color}`}
                        ></div>
                        
                        <CardContent className="p-4 pt-6">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg ${agent.color}`}>
                              <div className="w-5 h-5 text-white">
                                {agent.icon}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {agent.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {agentCategories.find(cat => cat.id === agent.type)?.name}
                            </Badge>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-auto">
                              <Zap className="h-3 w-3 text-amber-500" />
                              <span>Drag to canvas</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Side - Canvas */}
          <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Visual Guide - Step 1 */}
            <AnimatePresence>
              {isGuideVisible && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 z-30"
                >
                  <motion.div 
                    initial={{ y: 50, scale: 0.9 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: -50, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-2xl m-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span>Build Your AI Team</span>
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-0.5">
                          <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">1</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Drag your first agent</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Start by dragging a strategist or the type of agent you need from the library on the left to the center of the canvas.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-0.5">
                          <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">2</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add more agents to the team</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Continue adding agents according to your needs. Connectors will automatically appear to link them.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-0.5">
                          <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">3</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activate your team</h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            When you have all the agents you need, click the "Deploy Team" button to see them work together.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-4 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsGuideVisible(false)}
                      >
                        Start from scratch
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          setIsGuideVisible(false);
                          handleUseTemplate('content-creation');
                        }}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <span>Use recommended template</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Empty Canvas State */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-56 h-56 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
              >
                <div className="w-40 h-40 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                  <div className="text-center px-4">
                    <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      Drag your first agent here
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <div className="mt-8 space-y-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Team Canvas
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Drag agents from the library to create your custom marketing team
                </p>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Testing with template",
                        description: "Loading Content Creation team...",
                      });
                      setTimeout(() => handleUseTemplate('content-creation'), 1000);
                    }}
                    className="gap-2"
                  >
                    <span>Try with Template</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Templates Access */}
            <div className="absolute bottom-8 right-8 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg"
                      className="rounded-full h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      onClick={() => setIsGuideVisible(true)}
                    >
                      <Plus className="h-8 w-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white border-gray-800">
                    <p>View templates and guide</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Workflow Templates Showcase */}
            <div className="absolute bottom-0 left-0 right-0 py-4 px-6 z-10">
              <ScrollArea className="h-32">
                <div className="flex gap-4 pr-4">
                  {workflowTemplates.map((template) => (
                    <Card key={template.id} className="flex-shrink-0 w-80 shadow-lg border-2 border-white dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {template.description.length > 80
                                ? template.description.substring(0, 77) + '...'
                                : template.description
                              }
                            </p>
                          </div>
                          
                          <Badge variant="outline" className="ml-2 flex-shrink-0">
                            {template.category}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex items-center">
                          <div className="flex -space-x-2 overflow-hidden">
                            {template.agents.slice(0, 3).map((agent, idx) => (
                              <Avatar key={idx} className={`inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-800 ${agent.color}`}>
                                <AvatarFallback className="text-white text-xs">
                                  {agent.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {template.agents.length > 3 && (
                              <Avatar className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700">
                                <AvatarFallback className="text-gray-600 dark:text-gray-300 text-xs">
                                  +{template.agents.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 gap-1"
                            onClick={() => handleUseTemplate(template.id)}
                          >
                            <span>Use Template</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Team Chat Preview (Step 10) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-8 left-8 right-8 z-10 pointer-events-none"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
                <CardHeader className="p-4 flex-row justify-between items-center gap-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Team Conversation</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        See how your agents collaborate
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="gap-2 border-gray-200 dark:border-gray-700"
                    onClick={() => {
                      toast({
                        title: "Preparing team...",
                        description: "You need to add agents to the canvas first!",
                        variant: "destructive"
                      });
                    }}
                  >
                    <Play className="h-4 w-4" />
                    <span>Deploy Team</span>
                  </Button>
                </CardHeader>
                
                <CardContent className="p-0 opacity-60">
                  <div className="h-[120px] p-4 flex items-center justify-center">
                    <div className="text-center">
                      <CornerDownRight className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Once you activate your team, you'll see the conversation between agents here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
      </div>
    );
  };

  // Render the correct view based on state
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'workflow-selection' && renderWorkflowSelection()}
        {activeView === 'workflow-builder' && renderWorkflowBuilder()}
      </div>
    </div>
  );
}