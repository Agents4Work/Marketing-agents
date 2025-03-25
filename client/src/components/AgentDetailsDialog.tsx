"use client";

import { useState } from "react";
import { Agent, AgentType } from "@/lib/agents";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  PenTool, 
  PieChart, 
  Image as ImageIcon, 
  Mail, 
  BarChart2, 
  MessageCircle,
  ArrowRight,
  Code,
  Sparkles,
  Play,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentDetailsDialogProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onUseNow: () => void;
  onAddToWorkflow: () => void;
}

const AgentDetailsDialog = ({ 
  agent, 
  isOpen, 
  onClose, 
  onUseNow,
  onAddToWorkflow
}: AgentDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("capabilities");

  // Get appropriate icon based on agent type
  const getIcon = (type: AgentType) => {
    switch (type) {
      case "seo":
        return <Search className="h-6 w-6 text-blue-600" />;
      case "copywriting":
        return <PenTool className="h-6 w-6 text-green-600" />;
      case "ads":
        return <PieChart className="h-6 w-6 text-purple-600" />;
      case "creative":
        return <ImageIcon className="h-6 w-6 text-pink-600" />;
      case "email":
        return <Mail className="h-6 w-6 text-yellow-600" />;
      case "analytics":
        return <BarChart2 className="h-6 w-6 text-indigo-600" />;
      case "social":
        return <MessageCircle className="h-6 w-6 text-orange-600" />;
      default:
        return <Search className="h-6 w-6 text-gray-600" />;
    }
  };

  // Get color classes based on agent type
  const getColorClass = (type: AgentType) => {
    const colorClasses = {
      seo: "bg-blue-50 text-blue-600 border-blue-200",
      copywriting: "bg-green-50 text-green-600 border-green-200",
      ads: "bg-purple-50 text-purple-600 border-purple-200",
      creative: "bg-pink-50 text-pink-600 border-pink-200",
      email: "bg-yellow-50 text-yellow-600 border-yellow-200",
      analytics: "bg-indigo-50 text-indigo-600 border-indigo-200",
      social: "bg-orange-50 text-orange-600 border-orange-200"
    };
    
    return colorClasses[type] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  // Example capabilities for each agent type
  const getCapabilities = (type: AgentType) => {
    const capabilities = {
      seo: [
        "Keyword research and optimization",
        "Content gap analysis",
        "SEO content writing",
        "Meta tag optimization",
        "Site structure recommendations",
        "Competitor analysis"
      ],
      copywriting: [
        "Blog post writing",
        "Website copy",
        "Email copy",
        "Product descriptions",
        "Ad copy",
        "Sales pages"
      ],
      ads: [
        "Ad copy creation",
        "Campaign structure",
        "Budget allocation",
        "A/B testing",
        "Performance tracking",
        "ROI optimization"
      ],
      creative: [
        "Image generation",
        "Banner design",
        "Social media graphics",
        "Logo variations",
        "Product imagery",
        "Brand assets"
      ],
      email: [
        "Email sequence creation",
        "Subject line optimization",
        "A/B testing",
        "Campaign scheduling",
        "Newsletter creation",
        "Automated flows"
      ],
      analytics: [
        "Performance reporting",
        "Data visualization",
        "Trend analysis",
        "KPI tracking",
        "Custom dashboards",
        "Competitive insights"
      ],
      social: [
        "Content calendar creation",
        "Post writing",
        "Hashtag research",
        "Engagement strategies",
        "Platform-specific content",
        "Trend monitoring"
      ]
    };
    
    return capabilities[type] || [];
  };

  // Example use cases for each agent type
  const getUseCases = (type: AgentType) => {
    const useCases = {
      seo: [
        "Optimize product pages to improve rankings",
        "Create SEO-friendly blog content",
        "Analyze and improve existing content",
        "Research competitors' keyword strategy",
        "Generate meta descriptions at scale"
      ],
      copywriting: [
        "Create high-converting landing pages",
        "Write engaging blog posts",
        "Draft professional email newsletters",
        "Generate product descriptions",
        "Create social media content"
      ],
      ads: [
        "Optimize Google Ads campaigns",
        "Create Facebook ad strategies",
        "Design multi-channel ad campaigns",
        "Improve conversion rates",
        "Scale successful campaigns"
      ],
      creative: [
        "Create social media visuals",
        "Design promotional banners",
        "Generate product mockups",
        "Create consistent brand imagery",
        "Design digital ads"
      ],
      email: [
        "Build nurture sequences",
        "Create abandoned cart emails",
        "Design welcome series",
        "Optimize promotional emails",
        "Create customer win-back campaigns"
      ],
      analytics: [
        "Monitor campaign performance",
        "Analyze customer behavior",
        "Create custom dashboards",
        "Generate weekly performance reports",
        "Track competitive metrics"
      ],
      social: [
        "Create platform-specific content",
        "Build engagement strategies",
        "Design content calendars",
        "Optimize posting schedules",
        "Create trending content"
      ]
    };
    
    return useCases[type] || [];
  };

  // Example of agent configuration options
  const renderConfiguration = () => {
    switch (agent.type) {
      case "seo": {
        const seoConfig = agent.configuration as {
          keywords?: string[];
          targetAudience?: string;
          contentType?: string;
          mode: string;
        };
        
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Target Keyword List</h4>
              <div className="flex flex-wrap gap-2">
                {seoConfig.keywords && seoConfig.keywords.length > 0 ? (
                  seoConfig.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary">{keyword}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No keywords specified</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Target Audience</h4>
              <p className="text-sm">{seoConfig.targetAudience || "General"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Content Type</h4>
              <p className="text-sm">{seoConfig.contentType || "Various"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Operation Mode</h4>
              <Badge>{seoConfig.mode}</Badge>
            </div>
          </div>
        );
      }
      case "copywriting": {
        const copyConfig = agent.configuration as {
          contentType?: string;
          tone?: string;
          length?: string;
          mode: string;
        };
        
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Content Type</h4>
              <p className="text-sm">{copyConfig.contentType || "Various"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Tone</h4>
              <p className="text-sm">{copyConfig.tone || "Professional"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Length</h4>
              <p className="text-sm">{copyConfig.length || "Medium"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Operation Mode</h4>
              <Badge>{copyConfig.mode}</Badge>
            </div>
          </div>
        );
      }
      // Add other agent types as needed
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <Settings className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">
              Configuration options available in workflow editor
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-lg", getColorClass(agent.type))}>
              {getIcon(agent.type)}
            </div>
            <DialogTitle className="text-2xl">{agent.name}</DialogTitle>
          </div>
          <DialogDescription>{agent.description}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="capabilities" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="capabilities" 
              onClick={() => setActiveTab("capabilities")}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Capabilities</span>
            </TabsTrigger>
            <TabsTrigger 
              value="examples" 
              onClick={() => setActiveTab("examples")}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              <span>Use Cases</span>
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              onClick={() => setActiveTab("config")}
              className="flex items-center gap-2"
            >
              <Code className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="capabilities" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What This Agent Can Do</h3>
              <ul className="grid gap-2">
                {getCapabilities(agent.type).map((capability, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="rounded-full p-1 bg-primary-50 text-primary mt-0.5">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-3 h-3"
                      >
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Common Use Cases</h3>
              <ul className="grid gap-3">
                {getUseCases(agent.type).map((useCase, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary-100 text-primary w-6 h-6 rounded-full flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-800">{useCase}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="config" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Agent Configuration</h3>
              <div className="bg-white p-4 rounded-md border">
                {renderConfiguration()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={onAddToWorkflow}
            className="gap-2"
          >
            Add to Workflow
          </Button>
          <Button 
            onClick={onUseNow}
            className="gap-2"
          >
            Use Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDetailsDialog;