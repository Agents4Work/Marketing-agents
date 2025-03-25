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
              
              {/* Overview Tab Content */}
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
                            <span className="text-xs text-gray-500">(AI Processing)</span>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                          <ArrowDown className="h-5 w-5 text-gray-400 sm:hidden" />
                          
                          {/* Step 3 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-sm font-medium">Output</span>
                            <span className="text-xs text-gray-500">(Polished Content)</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Integration Points */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <GitMerge className="h-4 w-4 mr-1 text-blue-600" />
                              Input Integration
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Google Docs import</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Brand voice settings</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Audience profiling</span>
                              </li>
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <Zap className="h-4 w-4 mr-1 text-blue-600" />
                              Process Optimization
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>AI-powered suggestions</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Style customization</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Drafting acceleration</span>
                              </li>
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <ArrowRight className="h-4 w-4 mr-1 text-blue-600" />
                              Output Destinations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Content management systems</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Social media scheduling</span>
                              </li>
                              <li className="flex items-start">
                                <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                                <span>Email marketing platforms</span>
                              </li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Human vs AI Comparison - New Section */}
                <div className="mb-8">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        Human vs AI Comparison
                      </CardTitle>
                      <CardDescription>
                        See how {selectedAgent.name} performs compared to human copywriters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Radar Chart Placeholder */}
                        <div className="border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] p-4 bg-white">
                          <h3 className="text-md font-semibold mb-2">Performance Metrics</h3>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-blue-600">85%</div>
                              <div className="text-sm text-gray-600">Overall Efficiency</div>
                              <div className="mt-2 text-xs text-gray-500">(Radar chart will display here)</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comparison Table */}
                        <div>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1 items-center">
                                <div className="font-medium text-sm">Speed</div>
                                <div className="text-xs font-medium">
                                  <span className="text-green-600">AI: 5 min</span> vs <span className="text-gray-600">Human: 4 hours</span>
                                </div>
                              </div>
                              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '92%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <div>AI is <span className="font-bold">48x faster</span></div>
                                <div>92% better</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1 items-center">
                                <div className="font-medium text-sm">Cost Efficiency</div>
                                <div className="text-xs font-medium">
                                  <span className="text-green-600">AI: $0.25/page</span> vs <span className="text-gray-600">Human: $25/page</span>
                                </div>
                              </div>
                              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '99%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <div>AI is <span className="font-bold">100x more affordable</span></div>
                                <div>99% better</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1 items-center">
                                <div className="font-medium text-sm">Consistency</div>
                                <div className="text-xs font-medium">
                                  <span className="text-green-600">AI: 95%</span> vs <span className="text-gray-600">Human: 75%</span>
                                </div>
                              </div>
                              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '78%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <div>AI is <span className="font-bold">26% more consistent</span></div>
                                <div>78% better</div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1 items-center">
                                <div className="font-medium text-sm">Creativity</div>
                                <div className="text-xs font-medium">
                                  <span className="text-gray-600">AI: 82%</span> vs <span className="text-green-600">Human: 91%</span>
                                </div>
                              </div>
                              <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <div>Humans have a <span className="font-bold">9% edge</span></div>
                                <div>85% comparable</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Agent Skills - Enhanced */}
                <div className="mb-8">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-blue-600" />
                        Agent Skills
                      </CardTitle>
                      <CardDescription>
                        Specialized capabilities and expertise of {selectedAgent.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedAgent.skills?.map((skill, index) => {
                          const skillName = isSkillObject(skill) ? skill.name : normalizeSkillToString(skill);
                          const skillLevel = isSkillObject(skill) ? skill.level : 5;
                          
                          return (
                            <div key={index} className="flex items-center border-2 border-black rounded-lg p-3 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 border-2 border-black">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{skillName}</div>
                                <div className="flex mt-1 space-x-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < skillLevel ? skillLevel : 0} />
                                  ))}
                                </div>
                              </div>
                              <div className="ml-2">
                                <Badge variant="outline" className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                                  {skillLevel}/5
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Compatible Agents - Enhanced Section */}
                {selectedAgent.compatibleAgents && selectedAgent.compatibleAgents.length > 0 && (
                  <div className="mb-8">
                    <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Compatible Agents
                        </CardTitle>
                        <CardDescription>
                          These agents work well together with {selectedAgent.name} for enhanced workflows
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedAgent.compatibleAgents.map((agentId) => {
                            const agent = agents.find(a => a.id === agentId);
                            if (!agent) return null;
                            
                            return (
                              <Card key={agent.id} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-[-2px] transition-all duration-200">
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 ${agent.primaryColor} rounded flex items-center justify-center text-white border-2 border-black`}>
                                      {agent.avatar}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                                      <div className="text-xs text-gray-500">{agent.category}</div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  <p className="text-xs text-gray-600 line-clamp-2">{agent.shortDescription}</p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] text-xs"
                                    onClick={() => setLocation(`/agent-detail/${agent.id}`)}
                                  >
                                    View Details
                                  </Button>
                                </CardFooter>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              {/* Samples Tab Content */}
              <TabsContent value="samples">
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Sample Outputs
                    </CardTitle>
                    <CardDescription>
                      Examples of content generated by {selectedAgent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedAgent.sampleOutputs?.map((sample, index) => (
                        <div key={index} className="border-2 border-black rounded-lg p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{sample.title || `Sample ${index + 1}`}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(sample.content);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "Sample content has been copied",
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {sample.content}
                          </div>
                          {sample.prompt && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs font-medium text-gray-500 mb-1">Original Prompt:</div>
                              <div className="text-xs text-gray-600 italic">{sample.prompt}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Team Integration Tab Content */}
              <TabsContent value="team">
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Team Integration
                    </CardTitle>
                    <CardDescription>
                      How {selectedAgent.name} can benefit your team's workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Role Synergy Section */}
                    <h3 className="font-semibold text-lg mb-4">Role Synergy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="h-5 mr-2 bg-blue-100 text-blue-700 border-0">For Marketing</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Consistent brand messaging</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Rapid campaign development</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Multilingual content creation</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="h-5 mr-2 bg-green-100 text-green-700 border-0">For Content Teams</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Writer's block elimination</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>SEO optimization built-in</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Content calendar automation</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="h-5 mr-2 bg-purple-100 text-purple-700 border-0">For Management</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Resource optimization</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Consistent quality control</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 mr-1 text-green-600 mt-0.5" />
                              <span>Measurable ROI improvements</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Adoption Steps */}
                    <h3 className="font-semibold text-lg mb-4">Team Adoption Steps</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-black mr-3">
                          <span className="font-bold text-blue-700">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Add to your team workspace</h4>
                          <p className="text-sm text-gray-600 mt-1">Integrate {selectedAgent.name} with one click to your team's environment</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-black mr-3">
                          <span className="font-bold text-blue-700">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Configure your preferences</h4>
                          <p className="text-sm text-gray-600 mt-1">Set your brand voice, style guide, and content parameters</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-black mr-3">
                          <span className="font-bold text-blue-700">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Invite team members</h4>
                          <p className="text-sm text-gray-600 mt-1">Share access with your marketing and content creation teams</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-black mr-3">
                          <span className="font-bold text-blue-700">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Start generating content</h4>
                          <p className="text-sm text-gray-600 mt-1">Begin creating high-quality content with AI assistance</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reviews Tab Content */}
              <TabsContent value="reviews">
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessagesSquare className="h-5 w-5 mr-2 text-blue-600" />
                      User Reviews
                    </CardTitle>
                    <CardDescription>
                      What other users are saying about {selectedAgent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {defaultReviews.map((review) => (
                        <div key={review.id} className="border-2 border-black rounded-lg p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 border-2 border-black">
                                <AvatarFallback className="bg-blue-100 text-blue-700">{review.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <div className="font-medium">{review.name}</div>
                                <div className="text-xs text-gray-500">
                                  {review.date} {review.verifiedPurchase && <span className="inline-flex items-center text-green-600"><BadgeCheck className="h-3 w-3 ml-1 mr-0.5" /> Verified</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="font-medium text-lg">{review.title}</h4>
                            <p className="mt-1 text-gray-700 text-sm">{review.content}</p>
                          </div>
                          
                          <div className="mt-3 flex items-center text-xs text-gray-500">
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Helpful ({review.helpfulCount})
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Performance Tab Content */}
              <TabsContent value="performance">
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription>
                      Detailed performance data and metrics for {selectedAgent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* KPI Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardContent className="p-4 text-center">
                          <BarChart3 className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                          <div className="text-3xl font-bold">98%</div>
                          <div className="text-sm text-gray-500">Accuracy Rate</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                          <div className="text-3xl font-bold">5.2s</div>
                          <div className="text-sm text-gray-500">Avg. Response Time</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardContent className="p-4 text-center">
                          <RefreshCw className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                          <div className="text-3xl font-bold">1.8</div>
                          <div className="text-sm text-gray-500">Revision Rounds</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                        <CardContent className="p-4 text-center">
                          <Award className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                          <div className="text-3xl font-bold">8.7</div>
                          <div className="text-sm text-gray-500">Quality Score</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Performance Graph Placeholder */}
                    <div className="border-2 border-black rounded-lg p-4 mb-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                      <h3 className="font-semibold mb-3">Performance Over Time</h3>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-600">Performance Chart</div>
                          <div className="text-sm text-gray-500 mt-2">(Interactive chart will display here)</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Breakdown */}
                    <h3 className="font-semibold text-lg mb-4">Performance Breakdown</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">Content Quality</div>
                          <div className="text-sm font-medium">87%</div>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">SEO Effectiveness</div>
                          <div className="text-sm font-medium">92%</div>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">Readability Score</div>
                          <div className="text-sm font-medium">95%</div>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">Brand Voice Alignment</div>
                          <div className="text-sm font-medium">89%</div>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm font-medium">Engagement Potential</div>
                          <div className="text-sm font-medium">84%</div>
                        </div>
                        <Progress value={84} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}