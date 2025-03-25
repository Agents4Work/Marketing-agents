import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import SidebarOptimized from '@/components/SidebarOptimized';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp,
  TrendingDown, 
  Users, 
  Check, 
  PlusCircle, 
  ChevronRight,
  MessagesSquare,
  LineChart,
  Zap,
  BookOpen,
  Layers,
  Target,
  Sparkles,
  FileText,
  Clock,
  Calendar,
  History,
  Tag,
  RefreshCw,
  BarChart3,
  Award,
  ThumbsUp,
  CheckCircle,
  GitMerge,
  Lightbulb,
  Search,
  ArrowRight, 
  ArrowDown,
  Copy,
  Activity,
  BadgeCheck,
  AlertCircle,
  CheckSquare,
  Gauge,
  Repeat,
  Workflow,
  Timer,
  BrainCircuit,
  Code,
  Settings,
  ExternalLink,
  PenTool,
  MessageSquare,
  Scale,
  Rocket,
  Link,
  HelpCircle,
  Database,
  Folder,
  Factory
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { Agent, ExtendedAgent, AgentSkill, normalizeSkillToString } from '@/types/marketplace';
import { agents } from '@/data/agents';
import { formatAgentVersion } from '@/lib/agent-version-control';
import AgentVersionBadge from '@/components/AgentVersionBadge';

// Type guard function to check if a skill is an object with name and level properties
const isSkillObject = (skill: AgentSkill): skill is { name: string; level: number } => {
  return typeof skill === 'object' && 'name' in skill && 'level' in skill;
};

// Type guard for extended agent
const isExtendedAgent = (agent: Agent | ExtendedAgent): agent is ExtendedAgent => {
  return 'sampleOutputs' in agent && 'compatibleAgents' in agent;
};

// Sample default reviews (will be replaced by actual reviews from API)
const defaultReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "",
    date: "2025-03-01",
    rating: 5,
    title: "Game changer for our marketing team",
    content: "This AI copywriter has transformed how we create content. It produces high-quality marketing copy consistently and the output barely needs editing. Saved us countless hours!",
    helpfulCount: 42,
    verifiedPurchase: true
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    avatar: "",
    date: "2025-02-20",
    rating: 4,
    title: "Excellent for quick content creation",
    content: "I've been using this for my ecommerce product descriptions and it's been fantastic. The copy is engaging and converts well. Knocked off one star only because sometimes I need to run it twice to get the perfect tone.",
    helpfulCount: 18,
    verifiedPurchase: true
  },
  {
    id: 3,
    name: "Emma Liu",
    avatar: "",
    date: "2025-02-15",
    rating: 5,
    title: "Worth every penny",
    content: "As a solo entrepreneur, this tool has been invaluable. It helps me create professional-sounding copy without hiring an expensive copywriter. The output is creative and on-brand every time.",
    helpfulCount: 27,
    verifiedPurchase: true
  }
];

const SkillDot = ({ level }: { level: number }) => {
  if (level <= 0) return <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>;
  return <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>;
};

export default function AgentDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<ExtendedAgent | null>(null);
  
  useEffect(() => {
    // Find agent by ID
    const agent = agents.find(a => a.id === params.id);
    
    if (!agent) {
      toast({
        title: "Agent not found",
        description: "We couldn't find the agent you're looking for",
        variant: "destructive"
      });
      setLocation('/agent-marketplace');
      return;
    }
    
    if (!isExtendedAgent(agent)) {
      toast({
        title: "Agent data incomplete",
        description: "This agent doesn't have detailed information",
        variant: "destructive"
      });
      setLocation('/agent-marketplace');
      return;
    }
    
    setSelectedAgent(agent);
  }, [params.id, setLocation, toast]);
  
  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0"
              onClick={() => setLocation('/agent-marketplace')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
            
            {/* Agent Header - Redesigned */}
            <div className="flex flex-col lg:flex-row lg:items-start mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
              <div className={`flex-shrink-0 h-24 w-24 ${selectedAgent.primaryColor} text-white text-4xl items-center justify-center rounded-xl border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] flex`}>
                {selectedAgent.avatar}
              </div>
              
              <div className="flex-1 ml-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">{selectedAgent.name}</h1>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] py-1.5 bg-blue-50 text-blue-700">
                      {selectedAgent.category}
                    </Badge>
                    <div className="flex items-center text-gray-600">
                      <span className="font-bold text-green-600">{selectedAgent.compatibility || 98}% </span>
                      <span className="ml-1">Compatible with your team</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(selectedAgent.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-xl font-semibold">{selectedAgent.rating.toFixed(1)}</span>
                    </div>
                    <span className="ml-2 text-gray-500">({selectedAgent.reviews || selectedAgent.reviewCount || 0} reviews)</span>
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">{selectedAgent.shortDescription}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {selectedAgent.tags && selectedAgent.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] py-1.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    
                    <Badge 
                      variant="outline" 
                      className={`border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] py-1.5 ${selectedAgent.free ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
                    >
                      {selectedAgent.free ? 'Free' : 'Premium'}
                    </Badge>
                    
                    {selectedAgent.version && (
                      <Badge 
                        variant="outline" 
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] py-1.5 bg-purple-50 text-purple-700"
                      >
                        v{selectedAgent.version}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[180px]">
                <Button className="w-full border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200">
                  Add to Team
                </Button>
                <Button variant="outline" className="w-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200">
                  Try Demo
                </Button>
                <Button variant="secondary" className="w-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200">
                  Quick Integration
                </Button>
              </div>
            </div>
            
            {/* Agent Description */}
            <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedAgent.description}
                </p>
              </CardContent>
            </Card>
            
            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-1.5" />
                    Overview
                  </div>
                </TabsTrigger>
                <TabsTrigger value="samples" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1.5" />
                    Samples
                  </div>
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    Team
                  </div>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <MessagesSquare className="w-4 h-4 mr-1.5" />
                    Reviews
                  </div>
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <LineChart className="w-4 h-4 mr-1.5" />
                    Performance
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {/* Workflow Integration - New Section */}
                <div className="mb-8">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GitMerge className="h-5 w-5 mr-2 text-blue-600" />
                        Workflow Integration
                      </CardTitle>
                      <CardDescription>
                        See how {selectedAgent.name} fits into your existing marketing workflows
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-2">
                          {/* Step 1 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">Request</span>
                            <span className="text-xs text-gray-500">(Marketing Brief)</span>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                          <ArrowDown className="h-5 w-5 text-gray-400 sm:hidden" />
                          
                          {/* Step 2 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <Lightbulb className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium">{selectedAgent.name}</span>
                            <span className="text-xs text-gray-500">(Content Creation)</span>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                          <ArrowDown className="h-5 w-5 text-gray-400 sm:hidden" />
                          
                          {/* Step 3 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <CheckCircle className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">Review</span>
                            <span className="text-xs text-gray-500">(Approval)</span>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                          <ArrowDown className="h-5 w-5 text-gray-400 sm:hidden" />
                          
                          {/* Step 4 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <Activity className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">Publish</span>
                            <span className="text-xs text-gray-500">(Distribution)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 border-2 border-black p-4 rounded-md bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <h4 className="font-bold mb-2 flex items-center">
                          <Check className="h-5 w-5 mr-2 text-green-600" />
                          Integration Benefits
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                            <span>Reduces content creation time by up to 80%</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                            <span>Seamlessly integrates with your existing marketing tools</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                            <span>Maintains consistent brand voice across all outputs</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                            <span>Supports collaborative review with multi-user feedback</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Human vs AI Comparison */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold flex items-center mb-4">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Human vs AI Comparison
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Speed Comparison */}
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Content Creation Speed</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">AI ({selectedAgent.name})</span>
                            <span className="text-sm font-medium">2-5 minutes</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Average Human</span>
                            <span className="text-sm font-medium">2-4 hours</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">AI creates content at least 24x faster</div>
                    </div>
                    
                    {/* Cost Comparison */}
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Cost Comparison</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">AI ({selectedAgent.name})</span>
                            <span className="text-sm font-medium">$0.10-0.50 per article</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Freelancer</span>
                            <span className="text-sm font-medium">$50-150 per article</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">AI reduces content costs by 98% on average</div>
                    </div>
                    
                    {/* Quality Comparison */}
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Quality Comparison</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-center mb-2">
                            <span className="text-sm font-medium">AI</span>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 text-lg font-bold">4.7</span>
                              <span className="text-xs text-gray-500 ml-1">/5</span>
                            </div>
                          </div>
                          <div className="text-xs text-center mt-1 text-gray-500">Based on blind tests</div>
                        </div>
                        <div>
                          <div className="text-center mb-2">
                            <span className="text-sm font-medium">Human</span>
                          </div>
                          <div className="text-center">
                            <div className="inline-flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 text-lg font-bold">4.8</span>
                              <span className="text-xs text-gray-500 ml-1">/5</span>
                            </div>
                          </div>
                          <div className="text-xs text-center mt-1 text-gray-500">Professional writers</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-gray-500">Quality difference is now statistically negligible</div>
                    </div>
                    
                    {/* Consistency Comparison */}
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Consistency</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">AI ({selectedAgent.name})</span>
                            <span className="text-sm font-medium">99%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '99%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Human Team</span>
                            <span className="text-sm font-medium">76%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: '76%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">AI maintains perfect brand consistency across all content</div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold flex items-center mb-4">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                    Performance Metrics
                  </h3>
                  
                  <div className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] bg-blue-50">
                        <div className="text-blue-600 mb-1">
                          <Award className="h-8 w-8 mx-auto" />
                        </div>
                        <div className="text-2xl font-bold">{selectedAgent.rating * 20}%</div>
                        <div className="text-sm text-gray-500">User Satisfaction</div>
                      </div>
                      
                      <div className="text-center p-4 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] bg-green-50">
                        <div className="text-green-600 mb-1">
                          <Zap className="h-8 w-8 mx-auto" />
                        </div>
                        <div className="text-2xl font-bold">0.8s</div>
                        <div className="text-sm text-gray-500">Avg. Response Time</div>
                      </div>
                      
                      <div className="text-center p-4 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] bg-purple-50">
                        <div className="text-purple-600 mb-1">
                          <ThumbsUp className="h-8 w-8 mx-auto" />
                        </div>
                        <div className="text-2xl font-bold">94%</div>
                        <div className="text-sm text-gray-500">First-Try Success</div>
                      </div>
                      
                      <div className="text-center p-4 border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] bg-yellow-50">
                        <div className="text-yellow-600 mb-1">
                          <Star className="h-8 w-8 mx-auto" />
                        </div>
                        <div className="text-2xl font-bold">12,400+</div>
                        <div className="text-sm text-gray-500">Weekly Usage</div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="font-bold mb-4">Monthly Performance Trend</h4>
                      <div className="h-[250px] w-full border-2 border-black p-4 rounded-md">
                        <div className="h-full flex items-end space-x-2">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const height = Math.floor(60 + Math.random() * 35);
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 border-2 border-black rounded-t-md"
                                  style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs font-medium mt-2">
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="samples">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    Sample Outputs
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAgent.sampleOutputs?.map((sample, index) => (
                      <Card key={index} className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardHeader>
                          <CardTitle className="text-lg">Sample {index + 1}: {sample.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
                            <p className="whitespace-pre-line text-sm text-gray-700">{sample.content}</p>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-500">Prompt:</span>
                              <span className="text-xs text-gray-500 italic">{sample.prompt}</span>
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <MessagesSquare className="mr-2 h-5 w-5 text-blue-600" />
                    User Reviews
                  </h3>
                  
                  <div className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="md:w-1/3">
                        <div className="text-center">
                          <div className="text-5xl font-bold">{selectedAgent.rating.toFixed(1)}</div>
                          <div className="flex justify-center my-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-6 w-6 ${i < Math.floor(selectedAgent.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">Based on {selectedAgent.reviews || selectedAgent.reviewCount || defaultReviews.length} reviews</div>
                        </div>
                        
                        <div className="mt-6 space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm w-8">5 ★</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <span className="text-sm w-8 text-right">70%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-8">4 ★</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-green-400 rounded-full" style={{ width: '22%' }}></div>
                            </div>
                            <span className="text-sm w-8 text-right">22%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-8">3 ★</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '5%' }}></div>
                            </div>
                            <span className="text-sm w-8 text-right">5%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-8">2 ★</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-orange-400 rounded-full" style={{ width: '2%' }}></div>
                            </div>
                            <span className="text-sm w-8 text-right">2%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-8">1 ★</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                              <div className="h-2 bg-red-400 rounded-full" style={{ width: '1%' }}></div>
                            </div>
                            <span className="text-sm w-8 text-right">1%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 space-y-4">
                        {defaultReviews.map(review => (
                          <div key={review.id} className="border-2 border-black p-4 rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3 border border-gray-300">
                                  {review.avatar ? (
                                    <AvatarImage src={review.avatar} alt={review.name} />
                                  ) : (
                                    <AvatarFallback className="bg-blue-100 text-blue-600">{review.name.charAt(0)}</AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{review.name}</div>
                                  <div className="text-xs text-gray-500">{review.date}</div>
                                </div>
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="mt-3">
                              <h4 className="font-bold text-sm">{review.title}</h4>
                              <p className="mt-1 text-sm text-gray-700">{review.content}</p>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <div className="flex items-center text-xs text-gray-500">
                                <ThumbsUp className="h-3 w-3 mr-1" /> 
                                <span>{review.helpfulCount} found this helpful</span>
                              </div>
                              {review.verifiedPurchase && (
                                <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                                  <Check className="h-3 w-3 mr-1" /> Verified Purchase
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-center">
                          <Button className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200">
                            View All Reviews
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <LineChart className="mr-2 h-5 w-5 text-blue-600" />
                    Performance Analytics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Performance Overview</h4>
                      <div className="flex justify-between mb-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1">
                          <TrendingUp className="h-3 w-3 mr-1" /> Performance improving
                        </Badge>
                        <div className="flex gap-2">
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-0.5">
                            Week
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 border border-blue-200">
                            Month
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-0.5">
                            Year
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="h-[300px] w-full">
                        <div className="relative h-full w-full border-b border-l border-gray-300 flex items-end">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const height = 30 + Math.sin(i * 0.4) * 20 + Math.random() * 15;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 border-t-2 border-r-2 border-l-2 border-black rounded-t-sm"
                                  style={{ height: `${height}%` }}
                                ></div>
                              </div>
                            );
                          })}
                          
                          <div className="absolute top-1/2 left-0 right-0 border-t border-gray-300 border-dashed"></div>
                          <div className="absolute bottom-1/4 left-0 right-0 border-t border-gray-300 border-dashed"></div>
                          <div className="absolute top-1/4 left-0 right-0 border-t border-gray-300 border-dashed"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>March 1</span>
                        <span>March 15</span>
                        <span>March 30</span>
                      </div>
                    </div>
                    
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Average Completion Time</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold">1.2s</div>
                        <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span>12% faster than last month</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Target: 1.5s</span>
                          <span className="text-xs font-medium text-green-600">20% ahead</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Accuracy Score</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold">94%</div>
                        <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>3% improvement</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Target: 90%</span>
                          <span className="text-xs font-medium text-green-600">4% ahead</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] p-5 rounded-md bg-white">
                      <h4 className="font-bold mb-3">Revision Rate</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold">8%</div>
                        <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span>2% decrease</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Target: &lt;10%</span>
                          <span className="text-xs font-medium text-green-600">20% ahead</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Team Compatibility
                  </h3>
                  
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GitMerge className="h-5 w-5 mr-2 text-blue-600" />
                        Compatible Agents
                      </CardTitle>
                      <CardDescription>
                        {selectedAgent.name} works best with these AI teammates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedAgent.compatibleAgents?.map(compatibleAgent => {
                          const agent = agents.find(a => a.id === compatibleAgent.id);
                          return agent ? (
                            <Card key={agent.id} className="border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden cursor-pointer" onClick={() => setLocation(`/agent-marketplace/${agent.id}`)}>
                          
                              <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                  <div className={`flex-shrink-0 h-10 w-10 ${agent.primaryColor} text-white items-center justify-center rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] flex`}>
                                    {agent.avatar}
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                                    <div className="text-xs text-gray-500">{agent.category}</div>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardFooter className="pt-0">
                                <div className="w-full flex justify-between items-center">
                                  <Badge className="bg-green-100 text-green-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                                    {compatibleAgent.compatibilityScore || 98}% Match
                                  </Badge>
                                  <Button size="sm" className="h-8 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}