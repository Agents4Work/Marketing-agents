import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import {
  AlertTriangle,
  ArrowRightIcon,
  BarChart,
  Check,
  FileText,
  Globe,
  LineChart,
  PenTool,
  Repeat,
  Rocket,
  Settings,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// This component is not used, so we can remove the import
// import { CardWithTabs, TabContent } from "@/components/ui/card-with-tabs";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiRequest from "../lib/apiRequest";
import { agents } from "@/data/agents";
import { AgentSkill, CompatibleAgent } from "@/types/marketplace";

const isSkillObject = (skill: AgentSkill): skill is { name: string; level: number } => {
  return typeof skill === 'object' && 'name' in skill && 'level' in skill;
};

// Default compatible agents if agent doesn't have them defined
const defaultCompatibleAgents: CompatibleAgent[] = [
  {
    name: "SEO Specialist",
    avatar: "🔍",
    color: "bg-green-600",
    compatibility: 95,
  },
  {
    name: "Social Media Strategist",
    avatar: "📱",
    color: "bg-pink-600",
    compatibility: 92,
  },
  {
    name: "Analytics Advisor",
    avatar: "📊",
    color: "bg-orange-600",
    compatibility: 90,
  },
];

export default function AgentDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isTryingAgent, setIsTryingAgent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(
    agents.find((agent) => agent.id === params.id) || agents[0]
  );

  useEffect(() => {
    const agent = agents.find((agent) => agent.id === params.id);
    if (agent) {
      setSelectedAgent(agent);
    } else {
      // Redirect to first agent if ID doesn't exist
      setLocation(`/marketplace/${agents[0].id}`);
    }
  }, [params.id, setLocation]);

  useEffect(() => {
    if (isTryingAgent) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTryingAgent(false);
            return 100;
          }
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isTryingAgent]);

  const handleTryAgent = async () => {
    setIsTryingAgent(true);
    setProgress(0);

    try {
      // Navigate to the copywriter workspace
      window.location.href = `/workspace/copywriter/${selectedAgent.id}`;
    } catch (error) {
      console.error('Error navigating to workspace:', error);
      setIsTryingAgent(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
          onClick={() => setLocation("/agent-marketplace")}
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
          Back to Marketplace
        </Button>
        <h2 className="text-2xl font-bold ml-4">Agent Details</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="mb-4 relative">
                  <div className="bg-blue-600 text-white p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] w-24 h-24 flex items-center justify-center text-4xl">
                    {selectedAgent.avatar || "🤖"}
                  </div>
                  {selectedAgent.premium && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                      PRO
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2">{selectedAgent.name}</h1>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < (selectedAgent.rating || 4.5)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-1">
                    {selectedAgent.rating || 4.5} ({selectedAgent.reviews || 120} reviews)
                  </span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 w-full text-center mb-4 border border-blue-100">
                  <p className="text-sm text-gray-700">{selectedAgent.shortDescription}</p>
                </div>
                <div className="w-full">
                  <Button
                    className="w-full mb-3 bg-blue-600 hover:bg-blue-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200"
                    onClick={handleTryAgent}
                    disabled={isTryingAgent}
                  >
                    {isTryingAgent ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <Progress value={progress} className="w-1/3 h-2" />
                      </>
                    ) : (
                      <>Try This Agent</>
                    )}
                  </Button>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {selectedAgent.highlight1 || "Creates engaging content based on your brand voice"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {selectedAgent.highlight2 || "Optimizes content for SEO and readability"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {selectedAgent.highlight3 || "Adapts to different content formats and platforms"}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <h3 className="font-semibold">Capabilities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(selectedAgent.skills) && selectedAgent.skills.map((skill, index) => {
                    // Convert both string skills and object skills to a standard format
                    const skillName = isSkillObject(skill) ? skill.name : skill;
                    const skillLevel = isSkillObject(skill) ? skill.level : 85;
                    
                    return (
                      <div key={index} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{skillName}</span>
                          <span className="text-xs text-gray-500">{skillLevel}%</span>
                        </div>
                        <Progress value={skillLevel} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="font-semibold">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.languages?.map((language, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      <Globe className="h-3 w-3 mr-1" />
                      {language}
                    </Badge>
                  )) || (
                    <>
                      <Badge variant="outline" className="bg-blue-50">
                        <Globe className="h-3 w-3 mr-1" />
                        English
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50">
                        <Globe className="h-3 w-3 mr-1" />
                        Spanish
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50">
                        <Globe className="h-3 w-3 mr-1" />
                        French
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="font-semibold">Compatible With</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.integrations?.map((integration, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {integration}
                    </Badge>
                  )) || (
                    <>
                      <Badge variant="outline" className="bg-gray-50">
                        Google Docs
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        WordPress
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        Mailchimp
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs
            defaultValue="overview"
            value={selectedTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                <TabsTrigger value="overview" className="font-semibold">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="examples" className="font-semibold">
                  Examples
                </TabsTrigger>
                <TabsTrigger value="team" className="font-semibold">
                  Team
                </TabsTrigger>
                <TabsTrigger value="reviews" className="font-semibold">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="performance" className="font-semibold">
                  Performance
                </TabsTrigger>
              </TabsList>
            </div>

            <div>
              <TabsContent value="overview" className={selectedTab === "overview" ? "" : "hidden"}>
                <div className="space-y-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        About {selectedAgent.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">{selectedAgent.description}</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <Rocket className="h-4 w-4 mr-2" />
                            What Makes This Agent Special
                          </h3>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span>
                                {selectedAgent.uniqueFeature1 ||
                                  "Advanced understanding of copywriting principles including persuasion, clarity, and emotional appeal"}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span>
                                {selectedAgent.uniqueFeature2 ||
                                  "Ability to analyze and adapt to your brand voice and existing content style"}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span>
                                {selectedAgent.uniqueFeature3 ||
                                  "Built-in SEO optimization to ensure your content ranks well while maintaining readability"}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-blue-600" />
                        How It Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                                1
                              </div>
                              <h3 className="font-medium">Input Your Requirements</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              Provide your topic, target audience, content goals, and any specific
                              brand guidelines or tone preferences.
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <ArrowRightIcon className="hidden md:block text-gray-400" />
                            <div className="block md:hidden bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <ArrowRightIcon className="text-gray-400 rotate-90" />
                            </div>
                          </div>

                          <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                                2
                              </div>
                              <h3 className="font-medium">AI Content Creation</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              {selectedAgent.name} analyzes your inputs and creates a draft using
                              advanced language models optimized for marketing copy.
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <ArrowRightIcon className="hidden md:block text-gray-400" />
                            <div className="block md:hidden bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <ArrowRightIcon className="text-gray-400 rotate-90" />
                            </div>
                          </div>

                          <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                                3
                              </div>
                              <h3 className="font-medium">Review & Refine</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              Provide feedback on the generated content, and the agent will refine
                              it until it perfectly matches your requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                        Use Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Blog Articles & Web Content
                          </h3>
                          <p className="text-sm text-gray-600">
                            Create engaging, SEO-optimized blog posts, landing pages, and website
                            copy that converts visitors into customers.
                          </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Email Campaigns
                          </h3>
                          <p className="text-sm text-gray-600">
                            Craft compelling email sequences that nurture leads, announce products,
                            and drive engagement with your audience.
                          </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Social Media Posts
                          </h3>
                          <p className="text-sm text-gray-600">
                            Generate platform-specific social content that resonates with your
                            audience and encourages sharing and interaction.
                          </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Ad Copy & Product Descriptions
                          </h3>
                          <p className="text-sm text-gray-600">
                            Write persuasive ad copy and product descriptions that highlight
                            benefits and drive conversions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="examples" className={selectedTab === "examples" ? "" : "hidden"}>
                <div className="space-y-6">
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
                      <div className="space-y-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium">Blog Post Introduction</h3>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Blog</Badge>
                          </div>
                          <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-3">
                            <p className="text-gray-700 italic">
                              "The landscape of digital marketing is constantly evolving, with new
                              technologies and strategies emerging faster than most businesses can
                              adapt. In this comprehensive guide, we'll explore the five most
                              transformative trends that are reshaping how brands connect with their
                              audiences in 2025. Whether you're a seasoned marketing professional or
                              a business owner looking to stay ahead of the curve, these insights
                              will help you navigate the complex digital ecosystem with confidence
                              and creativity."
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              High engagement rate
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>94% human-like</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium">Product Description</h3>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">E-commerce</Badge>
                          </div>
                          <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-3">
                            <p className="text-gray-700 italic">
                              "Introducing the EcoFlex Pro: the ultimate standing desk for the
                              modern professional. Crafted from sustainable bamboo and recycled
                              aluminum, this adjustable workspace solution seamlessly transitions
                              from sitting to standing with our whisper-quiet dual-motor system.
                              With customizable height presets, integrated cable management, and
                              smart device connectivity, the EcoFlex Pro doesn't just elevate your
                              work—it transforms your entire work experience. Your body and the
                              planet will thank you."
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              23% conversion rate
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>91% human-like</span>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium">Email Campaign</h3>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Email</Badge>
                          </div>
                          <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-3">
                            <p className="text-gray-700 italic">
                              "Subject: Your Design Journey Starts Today: 30% Off for New Members
                              <br /><br />
                              Hi [Name],
                              <br /><br />
                              We noticed you've been exploring our design templates but haven't
                              taken the plunge yet. What if today could be the day your brand
                              visuals go from good to unforgettable?
                              <br /><br />
                              For the next 48 hours, new members can unlock our entire Premium
                              Template Library at 30% off – that's access to over 10,000
                              professionally designed templates for everything from social media to
                              comprehensive brand kits.
                              <br /><br />
                              No design experience? No problem. Our intuitive editor makes
                              customization simpler than ordering your morning coffee.
                              <br /><br />
                              Ready to transform your visual identity?
                              <br /><br />
                              [Start Creating Today – 30% Off]"
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              42% open rate
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>96% human-like</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              Content Creation Workflow
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedAgent.name} works together with content strategy agents to execute on content plans.
                              Simply connect your content planner to {selectedAgent.name} and streamline your creation process.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <LineChart className="h-4 w-4 text-blue-500" />
                              Performance Optimization
                            </h3>
                            <p className="text-sm text-gray-600">
                              Pair {selectedAgent.name} with analytics agents to continuously improve content performance.
                              Feedback loops ensure each piece of content performs better than the last.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <PenTool className="h-4 w-4 text-blue-500" />
                              Multi-format Adaptation
                            </h3>
                            <p className="text-sm text-gray-600">
                              Connect {selectedAgent.name} with channel-specific agents to automatically adapt content for
                              different platforms and formats while maintaining messaging consistency.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium flex items-center gap-2 mb-2">
                              <Repeat className="h-4 w-4 text-blue-500" />
                              Continuous Improvement
                            </h3>
                            <p className="text-sm text-gray-600">
                              {selectedAgent.name} can learn from past performance when paired with analytics agents.
                              Each new piece of content builds on the success of previous campaigns.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Best Team Combinations
                      </CardTitle>
                      <CardDescription>
                        Agents that work exceptionally well with {selectedAgent.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(selectedAgent.compatibleAgents || defaultCompatibleAgents).map((agent, index) => (
                          <div key={index} className="flex flex-col">
                            <div className="flex items-start gap-3 mb-2">
                              <div className={`h-12 w-12 rounded-lg ${agent.color} text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`}>
                                {agent.avatar}
                              </div>
                              <div>
                                <h4 className="font-medium">{agent.name}</h4>
                                <div className="text-sm text-green-600">Compatibility: {agent.compatibility}%</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
                              View Agent
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mb-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                        Quick Team Builder
                      </CardTitle>
                      <CardDescription>
                        Create an optimized team with {selectedAgent.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-100">
                          <h3 className="font-medium mb-2">Content Dream Team</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex -space-x-2">
                              <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white z-30">
                                {selectedAgent.avatar || "✍️"}
                              </div>
                              <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white z-20">
                                🔍
                              </div>
                              <div className="h-10 w-10 rounded-full bg-pink-500 text-white flex items-center justify-center border-2 border-white z-10">
                                📱
                              </div>
                            </div>
                            <div className="text-sm">
                              3 agents optimized for content creation and distribution
                            </div>
                          </div>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
                            Build This Team
                          </Button>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-100">
                          <h3 className="font-medium mb-2">SEO Power Squad</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex -space-x-2">
                              <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white z-30">
                                {selectedAgent.avatar || "✍️"}
                              </div>
                              <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center border-2 border-white z-20">
                                🔍
                              </div>
                              <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center border-2 border-white z-10">
                                📊
                              </div>
                            </div>
                            <div className="text-sm">
                              3 agents focused on SEO-optimized content
                            </div>
                          </div>
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
                            Build This Team
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className={selectedTab === "reviews" ? "" : "hidden"}>
                <div className="space-y-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-blue-600" />
                        What Users Say
                      </CardTitle>
                      <CardDescription>
                        Reviews and feedback from real users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {selectedAgent.rating || 4.5}
                            </div>
                            <div className="flex justify-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < Math.floor(selectedAgent.rating || 4.5)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : i < (selectedAgent.rating || 4.5)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {selectedAgent.reviews || 120} reviews
                            </div>
                          </div>

                          <Separator orientation="vertical" className="h-16" />

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm w-6">5★</div>
                              <Progress value={76} className="h-2" />
                              <div className="text-sm text-gray-500 w-8">76%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm w-6">4★</div>
                              <Progress value={18} className="h-2" />
                              <div className="text-sm text-gray-500 w-8">18%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm w-6">3★</div>
                              <Progress value={4} className="h-2" />
                              <div className="text-sm text-gray-500 w-8">4%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm w-6">2★</div>
                              <Progress value={1} className="h-2" />
                              <div className="text-sm text-gray-500 w-8">1%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm w-6">1★</div>
                              <Progress value={1} className="h-2" />
                              <div className="text-sm text-gray-500 w-8">1%</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-800">
                                  JD
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">John D.</div>
                                <div className="text-sm text-gray-500">Marketing Director</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 text-sm">
                              "This agent has transformed our content production workflow. We're
                              creating twice as much content in half the time, and the quality is
                              actually better than what we were producing manually. The ROI has been
                              incredible."
                            </p>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-green-100 text-green-800">
                                  SP
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Sarah P.</div>
                                <div className="text-sm text-gray-500">E-commerce Owner</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 text-sm">
                              "I was skeptical about AI writing, but this agent surprised me. It
                              created product descriptions that actually increased our conversion
                              rate by 18%. It did need some edits for brand voice, but overall a
                              huge time-saver."
                            </p>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-2">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-purple-100 text-purple-800">
                                  MK
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">Miguel K.</div>
                                <div className="text-sm text-gray-500">Content Manager</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 text-sm">
                              "The quality of writing from this agent is impressive. What I
                              appreciate most is how well it adapts to different tones and styles.
                              We've used it for everything from formal whitepapers to casual social
                              posts, and it nails both."
                            </p>
                          </div>

                          <Button variant="outline" className="w-full">
                            View All 120 Reviews
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className={selectedTab === "performance" ? "" : "hidden"}>
                <div className="space-y-6">
                  <Card className="border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                        Performance Metrics
                      </CardTitle>
                      <CardDescription>
                        How {selectedAgent.name} performs compared to industry standards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="border-2 border-gray-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Speed</CardTitle>
                              <CardDescription className="text-xs">
                                Average time to generate content
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-600">4.2x</div>
                              <p className="text-sm text-gray-500">
                                faster than manual writing
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="border-2 border-gray-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Quality</CardTitle>
                              <CardDescription className="text-xs">
                                User satisfaction score
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-600">92%</div>
                              <p className="text-sm text-gray-500">
                                of users rate content 4+ stars
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="border-2 border-gray-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Edits Needed</CardTitle>
                              <CardDescription className="text-xs">
                                Content accuracy and relevance
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-600">-37%</div>
                              <p className="text-sm text-gray-500">
                                fewer edits vs. other AI tools
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="font-medium mb-2">Human vs. AI Comparison</h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <div className="text-sm font-medium">Content Creation Speed</div>
                                <div className="text-sm text-blue-600">4.2x faster</div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="text-xs text-gray-500 w-16">Human</div>
                                <div className="h-4 w-20 bg-gray-200 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">1x</div>
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <div className="text-xs text-gray-500 w-16">AI Agent</div>
                                <div className="h-4 w-80 bg-blue-500 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">4.2x</div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <div className="text-sm font-medium">Consistency</div>
                                <div className="text-sm text-blue-600">19% more consistent</div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="text-xs text-gray-500 w-16">Human</div>
                                <div className="h-4 w-48 bg-gray-200 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">78%</div>
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <div className="text-xs text-gray-500 w-16">AI Agent</div>
                                <div className="h-4 w-60 bg-blue-500 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">97%</div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <div className="text-sm font-medium">Originality</div>
                                <div className="text-sm text-orange-600">Comparable</div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className="text-xs text-gray-500 w-16">Human</div>
                                <div className="h-4 w-56 bg-gray-200 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">93%</div>
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <div className="text-xs text-gray-500 w-16">AI Agent</div>
                                <div className="h-4 w-52 bg-blue-500 rounded-full"></div>
                                <div className="text-xs text-gray-500 w-16 text-right">89%</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Card className="border border-yellow-200 bg-yellow-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                              Suggested Human Review
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700">
                              While {selectedAgent.name} produces high-quality content, we recommend
                              human review for:
                            </p>
                            <ul className="text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
                              <li>Legal compliance and regulatory content</li>
                              <li>High-stakes communications (investor relations, crisis responses)</li>
                              <li>Deeply technical industry-specific content</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}