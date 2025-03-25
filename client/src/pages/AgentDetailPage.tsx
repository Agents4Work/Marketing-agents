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
import { Agent, ExtendedAgent, AgentSkill } from '@/types/marketplace';
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
    company: "Marketing Agency Inc.",
    avatar: "",
    date: "2025-03-01",
    rating: 5,
    text: "This AI copywriter has transformed how we create content. It produces high-quality marketing copy consistently and the output barely needs editing. Saved us countless hours!",
    helpfulCount: 42,
    verifiedPurchase: true
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    company: "E-commerce Solutions",
    avatar: "",
    date: "2025-02-20",
    rating: 4,
    text: "I've been using this for my ecommerce product descriptions and it's been fantastic. The copy is engaging and converts well. Knocked off one star only because sometimes I need to run it twice to get the perfect tone.",
    helpfulCount: 18,
    verifiedPurchase: true
  },
  {
    id: 3,
    name: "Emma Liu",
    company: "Solo Entrepreneur",
    avatar: "",
    date: "2025-02-15",
    rating: 5,
    text: "As a solo entrepreneur, this tool has been invaluable. It helps me create professional-sounding copy without hiring an expensive copywriter. The output is creative and on-brand every time.",
    helpfulCount: 27,
    verifiedPurchase: true
  }
];

const defaultCompatibleAgents = [
  {
    id: "seo-specialist",
    name: "SEO Specialist",
    avatar: "🔍",
    compatibility: 95,
    color: "bg-green-500"
  },
  {
    id: "social-media-strategist",
    name: "Social Media Strategist",
    avatar: "📱",
    compatibility: 92,
    color: "bg-pink-500"
  },
  {
    id: "analytics-advisor",
    name: "Analytics Advisor",
    avatar: "📊",
    compatibility: 90,
    color: "bg-orange-500"
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
  const [selectedTab, setSelectedTab] = useState("overview");
  
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
            <Tabs defaultValue="overview" className="mb-8" value={selectedTab} onValueChange={setSelectedTab}>
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
              
              <TabsContent value="overview" className={selectedTab === "overview" ? "" : "hidden"}>
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
                            <div className={`h-14 w-14 rounded-full ${selectedAgent.primaryColor} flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]`}>
                              <Sparkles className="h-6 w-6 text-white" />
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
                            <span className="text-sm font-medium">Approval</span>
                            <span className="text-xs text-gray-500">(Minimal Edits)</span>
                          </div>
                          
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                          <ArrowDown className="h-5 w-5 text-gray-400 sm:hidden" />
                          
                          {/* Step 4 */}
                          <div className="flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                              <Rocket className="h-6 w-6 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium">Publish</span>
                            <span className="text-xs text-gray-500">(Multi-channel)</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2 mt-4 md:mt-0">
                          <Badge variant="outline" className="px-3 py-1.5 bg-green-50 text-green-700 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> 
                            <span>Save 8+ hours per week</span>
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1.5 bg-blue-50 text-blue-700 flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" /> 
                            <span>One-click integration</span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Key Features */}
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-blue-600" />
                        Key Features
                      </CardTitle>
                      <CardDescription>
                        Why {selectedAgent.name} stands out from the competition
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedAgent.features && selectedAgent.features.map((feature, index) => (
                          <div key={index} className="flex items-start">
                            <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-100 text-blue-600">
                              <Check className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-medium">{feature.title}</h4>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                        
                        {!selectedAgent.features && (
                          <>
                            <div className="flex items-start">
                              <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-100 text-blue-600">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">AI-Powered Copywriting</h4>
                                <p className="text-sm text-gray-600">Creates high-converting marketing copy for various platforms and audiences.</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-100 text-blue-600">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">Multi-format Support</h4>
                                <p className="text-sm text-gray-600">Generates content for social media, blogs, email campaigns, and advertisements.</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-100 text-blue-600">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">Brand Voice Adaptation</h4>
                                <p className="text-sm text-gray-600">Automatically adapts to your brand's unique tone and style guidelines.</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="mt-0.5 mr-3 p-0.5 rounded-full bg-blue-100 text-blue-600">
                                <Check className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">SEO Optimization</h4>
                                <p className="text-sm text-gray-600">Incorporates relevant keywords and SEO best practices into all content.</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Skills & Expertise */}
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Skills & Expertise
                      </CardTitle>
                      <CardDescription>
                        Specialized capabilities and knowledge areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedAgent.skills && selectedAgent.skills.map((skill, index) => {
                          const skillName = isSkillObject(skill) ? skill.name : skill;
                          const skillLevel = isSkillObject(skill) ? skill.level : 5;
                          
                          return (
                            <div key={index} className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{skillName}</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < skillLevel ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={skillLevel * 20} max={100} className="h-1.5" />
                            </div>
                          );
                        })}
                        
                        {!selectedAgent.skills && (
                          <>
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Copywriting</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < 5 ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={100} max={100} className="h-1.5" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Brand Voice Adaptation</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < 4 ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={80} max={100} className="h-1.5" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Persuasive Language</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < 5 ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={100} max={100} className="h-1.5" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">SEO Knowledge</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < 4 ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={80} max={100} className="h-1.5" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">Creative Storytelling</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <SkillDot key={i} level={i < 4 ? 1 : 0} />
                                  ))}
                                </div>
                              </div>
                              <Progress value={80} max={100} className="h-1.5" />
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Specifications */}
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Layers className="h-5 w-5 mr-2 text-blue-600" />
                        Specifications
                      </CardTitle>
                      <CardDescription>
                        Technical details and capabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">AI Model</h4>
                          <p className="font-medium">Advanced GPT-4</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Training Data</h4>
                          <p className="font-medium">2024 Marketing Corpus</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Languages</h4>
                          <p className="font-medium">12+ Languages</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Content Types</h4>
                          <p className="font-medium">8+ Formats</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Industry Knowledge</h4>
                          <p className="font-medium">25+ Verticals</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Token Limit</h4>
                          <p className="font-medium">8,000 words per request</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">API Integration</h4>
                          <p className="font-medium">REST & GraphQL</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Update Frequency</h4>
                          <p className="font-medium">Weekly Improvements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Use Cases */}
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                        Use Cases
                      </CardTitle>
                      <CardDescription>
                        Ideal scenarios for using this agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <Award className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Sales & Marketing Campaigns</h4>
                            <p className="text-sm text-gray-600">Create compelling copy for ads, landing pages, and email campaigns.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Content Marketing</h4>
                            <p className="text-sm text-gray-600">Generate blog posts, articles, and social media content that engages audiences.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <Repeat className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Product Descriptions</h4>
                            <p className="text-sm text-gray-600">Craft persuasive descriptions for e-commerce and product catalogs.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Customer Communication</h4>
                            <p className="text-sm text-gray-600">Develop professional customer service responses and announcements.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Eliminated Pricing & Usage section as requested */}
                
                {/* Recommendations */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Recommended Team</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(selectedAgent.compatibleAgents || defaultCompatibleAgents).map((agent, index) => (
                      <Card key={index} className="border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-12 w-12 rounded-lg ${agent.color} text-white flex items-center justify-center`}>
                              {agent.avatar}
                            </div>
                            <div>
                              <h4 className="font-medium">{agent.name}</h4>
                              <div className="text-sm text-green-600">{agent.compatibility}% Compatible</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="samples" className={selectedTab === "samples" ? "" : "hidden"}>
                <div className="mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Sample Outputs
                      </CardTitle>
                      <CardDescription>
                        Examples of content created by {selectedAgent.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="sample1" className="w-full">
                        <TabsList className="w-full justify-start mb-4 overflow-x-auto flex-nowrap">
                          {selectedAgent.sampleOutputs && selectedAgent.sampleOutputs.map((sample, index) => (
                            <TabsTrigger 
                              key={index} 
                              value={`sample${index + 1}`}
                              className="min-w-max data-[state=active]:border-blue-500 data-[state=active]:border-b-2"
                            >
                              {sample.title}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {selectedAgent.sampleOutputs && selectedAgent.sampleOutputs.map((sample, index) => (
                          <TabsContent key={index} value={`sample${index + 1}`} className="border border-gray-200 rounded-md p-4 mt-0">
                            <div className="mb-4 pb-3 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">
                                    {sample.type}
                                  </Badge>
                                  <h3 className="font-medium">{sample.title}</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </Button>
                              </div>
                            </div>
                            
                            <div className="prose max-w-none dark:prose-invert">
                              <pre className="text-sm whitespace-pre-wrap font-sans">
                                {sample.content}
                              </pre>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-blue-600" />
                        Customization Options
                      </CardTitle>
                      <CardDescription>
                        Ways to personalize the output for your needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Tone & Style</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <Badge className="justify-center py-1.5 font-normal">Professional</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Casual</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Persuasive</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Informative</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Enthusiastic</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Humorous</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Content Length</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <Badge className="justify-center py-1.5 font-normal">Short</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Medium</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Long</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Target Audience</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <Badge className="justify-center py-1.5 font-normal">General</Badge>
                            <Badge className="justify-center py-1.5 font-normal">B2B</Badge>
                            <Badge className="justify-center py-1.5 font-normal">B2C</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Technical</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Executive</Badge>
                            <Badge className="justify-center py-1.5 font-normal">Millennials</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="h-5 w-5 mr-2 text-blue-600" />
                        Input Examples
                      </CardTitle>
                      <CardDescription>
                        Sample prompts to get optimal results
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-1">Social Media Post</h4>
                          <p className="text-sm text-gray-600">Create a LinkedIn post announcing our new eco-friendly packaging initiative for green-conscious professionals. Include a call-to-action.</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-1">Product Description</h4>
                          <p className="text-sm text-gray-600">Write a compelling product description for our premium wireless headphones with noise cancellation, 24-hour battery life, and ergonomic design. Target audience: tech enthusiasts.</p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-1">Email Campaign</h4>
                          <p className="text-sm text-gray-600">Draft a follow-up email for webinar attendees thanking them for their participation and highlighting the key takeaways. Include information about our upcoming workshop series.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="h-5 w-5 mr-2 text-blue-600" />
                      Advanced Generation Capabilities
                    </CardTitle>
                    <CardDescription>
                      Special features that enhance content creation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">Multi-variant Testing</h3>
                        </div>
                        <p className="text-sm text-gray-600">Generate multiple versions of content to test effectiveness and engagement metrics.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <Link className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">SEO Enhancement</h3>
                        </div>
                        <p className="text-sm text-gray-600">Automatically optimizes content with relevant keywords and SEO best practices.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <Gauge className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">Readability Analysis</h3>
                        </div>
                        <p className="text-sm text-gray-600">Evaluates and adjusts content to match desired reading level and complexity.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <Database className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">Knowledge Integration</h3>
                        </div>
                        <p className="text-sm text-gray-600">Incorporates up-to-date industry information and market trends into content.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <PenTool className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">Style Mimicking</h3>
                        </div>
                        <p className="text-sm text-gray-600">Analyzes and replicates specific writing styles or brand voices for consistent content.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                            <Target className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium">Audience Targeting</h3>
                        </div>
                        <p className="text-sm text-gray-600">Tailors messaging to specific demographic segments for more effective engagement.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className={selectedTab === "team" ? "" : "hidden"}>
                <div className="mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Team Integration
                      </CardTitle>
                      <CardDescription>
                        How {selectedAgent.name} works with other agents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-gray-700">
                          {selectedAgent.name} is designed to collaborate seamlessly with other AI agents in your marketing workflow. 
                          Here's how it can enhance your team's productivity and results:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                                  <Search className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">SEO Expert</h3>
                                  <div className="text-sm text-gray-500">95% Compatible</div>
                                </div>
                              </div>
                              <Badge className="bg-green-600">Perfect Match</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              The SEO Expert provides keyword research and optimization strategies that {selectedAgent.name} 
                              can incorporate directly into generated content. This ensures all copy is not only engaging but also
                              optimized for search engines.
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex items-center text-blue-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> 
                                <span>Direct integration</span>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-pink-100 text-pink-600 mr-3">
                                  <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">Social Media Manager</h3>
                                  <div className="text-sm text-gray-500">92% Compatible</div>
                                </div>
                              </div>
                              <Badge className="bg-pink-600">Strong Match</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {selectedAgent.name} creates the base content that the Social Media Manager agent adapts
                              for different platforms and audience segments. Together, they ensure consistent messaging 
                              with platform-appropriate formatting.
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex items-center text-blue-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> 
                                <span>Automated handoff</span>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-orange-100 text-orange-600 mr-3">
                                  <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">Analytics Advisor</h3>
                                  <div className="text-sm text-gray-500">90% Compatible</div>
                                </div>
                              </div>
                              <Badge className="bg-orange-600">Good Match</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              The Analytics Advisor provides performance data that {selectedAgent.name} uses to 
                              refine and improve content over time. This feedback loop ensures continuous improvement 
                              in engagement and conversion rates.
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex items-center text-blue-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> 
                                <span>Data-driven refinement</span>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                                  <Target className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">Campaign Manager</h3>
                                  <div className="text-sm text-gray-500">88% Compatible</div>
                                </div>
                              </div>
                              <Badge className="bg-purple-600">Good Match</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              The Campaign Manager coordinates content distribution and scheduling, working with 
                              {selectedAgent.name} to ensure content is delivered at optimal times for maximum impact 
                              across all channels.
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex items-center text-blue-600">
                                <CheckCircle className="h-4 w-4 mr-1" /> 
                                <span>Synchronized delivery</span>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Factory className="h-5 w-5 mr-2 text-blue-600" />
                        Workflow Automation
                      </CardTitle>
                      <CardDescription>
                        Automations enabled by team integration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <Repeat className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Content Repurposing</h4>
                            <p className="text-sm text-gray-600">Automatically transform blog posts into social media content, email newsletters, and more.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <RefreshCw className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">A/B Testing Cycles</h4>
                            <p className="text-sm text-gray-600">Generate variations, test performance, and automatically refine based on results.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Content Calendar Population</h4>
                            <p className="text-sm text-gray-600">Fill content schedules automatically based on campaign requirements and target audience.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 mt-0.5 mr-3">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">Performance Monitoring</h4>
                            <p className="text-sm text-gray-600">Track content effectiveness and generate reports on engagement and conversion.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                        Common Questions
                      </CardTitle>
                      <CardDescription>
                        Frequently asked questions about team integration
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">How many agents can work together?</h4>
                          <p className="text-sm text-gray-600">You can combine up to 5 agents in a single workflow for maximum efficiency without performance degradation.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1">Is there a learning curve for integration?</h4>
                          <p className="text-sm text-gray-600">No, agents automatically adapt to each other. Setup typically takes less than 5 minutes with our one-click integration system.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1">Do I need premium agents for full integration?</h4>
                          <p className="text-sm text-gray-600">Basic integration works with free agents, but premium agents unlock advanced workflow automations and deeper data sharing.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1">Can I create custom agent combinations?</h4>
                          <p className="text-sm text-gray-600">Yes, you can create and save custom team configurations for different projects or clients through the Team Builder feature.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Ready to build your dream marketing team?</h3>
                      <p className="text-gray-600 mt-1">Start by adding {selectedAgent.name} and discover compatible agents for maximum efficiency.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add to Team
                      </Button>
                      <Button variant="outline" className="min-w-[120px]">
                        <Users className="mr-2 h-4 w-4" />
                        Team Builder
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className={selectedTab === "reviews" ? "" : "hidden"}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="col-span-1">
                    <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                          Rating Summary
                        </CardTitle>
                        <CardDescription>
                          Overall user satisfaction
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold mb-1">{selectedAgent.rating.toFixed(1)}</div>
                          <div className="flex items-center justify-center mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < Math.floor(selectedAgent.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">Based on {selectedAgent.reviews || 124} reviews</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-10 text-right mr-2">5 ★</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                            <span className="w-10 text-left ml-2 text-sm">72%</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="w-10 text-right mr-2">4 ★</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '23%' }}></div>
                            </div>
                            <span className="w-10 text-left ml-2 text-sm">23%</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="w-10 text-right mr-2">3 ★</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '3%' }}></div>
                            </div>
                            <span className="w-10 text-left ml-2 text-sm">3%</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="w-10 text-right mr-2">2 ★</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '1%' }}></div>
                            </div>
                            <span className="w-10 text-left ml-2 text-sm">1%</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="w-10 text-right mr-2">1 ★</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '1%' }}></div>
                            </div>
                            <span className="w-10 text-left ml-2 text-sm">1%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                          User Testimonials
                        </CardTitle>
                        <CardDescription>
                          What users are saying about this agent
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(selectedAgent.testimonials || defaultReviews).map((review, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-medium">{review.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">{review.company}</span>
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
                              <p className="text-sm text-gray-600">"{review.text}"</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-center mt-4">
                          <Button variant="outline">
                            View All Reviews
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="col-span-1 lg:col-span-2">
                    <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MessagesSquare className="h-5 w-5 mr-2 text-blue-600" />
                          Reviews & Feedback
                        </CardTitle>
                        <CardDescription>
                          What users are saying about {selectedAgent.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {defaultReviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 pb-5 last:border-0">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">{review.name}</h4>
                                    <div className="flex items-center">
                                      <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                                      {review.verifiedPurchase && (
                                        <Badge variant="outline" className="ml-2 h-5 text-xs">Verified</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <h5 className="font-medium mb-1">{review.title}</h5>
                              <p className="text-sm text-gray-700 mb-3">{review.text}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500">
                                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                    Helpful ({review.helpfulCount})
                                  </Button>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-center mt-6">
                          <Button variant="outline">
                            Load More Reviews
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className={selectedTab === "performance" ? "" : "hidden"}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                        Performance Metrics
                      </CardTitle>
                      <CardDescription>
                        Key indicators of agent effectiveness
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Conversion Rate Improvement</span>
                            <span className="text-green-600 font-medium">+37%</span>
                          </div>
                          <Progress value={37} max={100} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                          <p className="text-xs text-gray-500 mt-1">Average improvement in landing page conversion rates</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Engagement Score</span>
                            <span className="text-green-600 font-medium">+42%</span>
                          </div>
                          <Progress value={42} max={100} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                          <p className="text-xs text-gray-500 mt-1">Average increase in content engagement metrics</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Output Quality</span>
                            <span className="text-green-600 font-medium">98%</span>
                          </div>
                          <Progress value={98} max={100} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                          <p className="text-xs text-gray-500 mt-1">Quality rating based on human evaluators</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Creativity Score</span>
                            <span className="text-green-600 font-medium">95%</span>
                          </div>
                          <Progress value={95} max={100} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                          <p className="text-xs text-gray-500 mt-1">Originality and creative approach rating</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Consistency Rating</span>
                            <span className="text-green-600 font-medium">96%</span>
                          </div>
                          <Progress value={96} max={100} className="h-2.5 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                          <p className="text-xs text-gray-500 mt-1">Consistency across multiple content pieces</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <Scale className="h-5 w-5 mr-2 text-blue-600" />
                        Benchmarking
                      </CardTitle>
                      <CardDescription>
                        How this agent compares to alternatives
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h4 className="font-medium mb-4">Human vs AI Copywriter Comparison</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <div className="w-24 text-sm font-medium">Speed</div>
                            <div className="flex-1 flex items-center">
                              <div className="w-1/2 text-right pr-2 text-sm text-gray-600">Human: 1x</div>
                              <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">AI: 8.5x faster</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-24 text-sm font-medium">Cost Efficiency</div>
                            <div className="flex-1 flex items-center">
                              <div className="w-1/2 text-right pr-2 text-sm text-gray-600">Human: 1x</div>
                              <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">AI: 83% less</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-24 text-sm font-medium">Consistency</div>
                            <div className="flex-1 flex items-center">
                              <div className="w-1/2 text-right pr-2 text-sm text-gray-600">Human: Variable</div>
                              <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">AI: 98% consistent</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-24 text-sm font-medium">Creativity</div>
                            <div className="flex-1 flex items-center">
                              <div className="w-1/2 text-right pr-2 text-sm text-gray-600">Human: Still leads</div>
                              <div className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">AI: 85% as creative</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">AI Agent Version History</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                            <div>
                              <span className="font-medium text-green-700">Current</span>
                              <span className="ml-2">Version 3.5</span>
                            </div>
                            <span className="text-gray-500">Released 2 weeks ago</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2">
                            <div>
                              <span className="font-medium">Version 3.0</span>
                            </div>
                            <span className="text-gray-500">Released 3 months ago</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-2">
                            <div>
                              <span className="font-medium">Version 2.5</span>
                            </div>
                            <span className="text-gray-500">Released 6 months ago</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2">Recent Improvements</h5>
                          <ul className="text-xs space-y-1 text-gray-600">
                            <li className="flex items-start">
                              <span className="inline-block mr-1">-</span>
                              <span>Enhanced understanding of brand voice</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block mr-1">-</span>
                              <span>Improved headline generation capabilities</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block mr-1">-</span>
                              <span>Better optimization for different platforms</span>
                            </li>
                            <li className="flex items-start">
                              <span className="inline-block mr-1">-</span>
                              <span>Advanced emotional intelligence in writing</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Ready to supercharge your marketing?</h3>
                      <p className="text-gray-600">Add Copywriting Pro to your team and start creating compelling content today.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add to Team
                      </Button>
                      <Button variant="outline">
                        <Zap className="mr-2 h-4 w-4" />
                        Try Demo
                      </Button>
                    </div>
                  </div>
                </Card>
                
                {/* Related Agents */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Related Agents</h3>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-green-500 text-white flex items-center justify-center">
                            <Search className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">SEO Specialist</h4>
                            <div className="text-sm text-green-600">95% Compatible</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-pink-500 text-white flex items-center justify-center">
                            <MessageSquare className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">Social Media Strategist</h4>
                            <div className="text-sm text-green-600">92% Compatible</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">Analytics Advisor</h4>
                            <div className="text-sm text-green-600">90% Compatible</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}