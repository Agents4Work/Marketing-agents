"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  BarChart2, 
  Mail, 
  Image, 
  PenTool, 
  PieChart, 
  MessageCircle,
  Plus,
  Star,
  ArrowRight,
  Users,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Agent, AgentType } from "@/lib/agents";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AgentCreateModal from "./AgentCreateModal";
import AgentDetailsDialog from "./AgentDetailsDialog";
import {
  SHADOWS,
  BORDERS,
  BORDERS_RADIUS,
  ANIMATIONS,
  BUTTON_3D_STYLES,
  CARD_3D_STYLES,
  UI_COMPONENTS,
  TYPOGRAPHY
} from "@/styles/modern-3d-design-system";

// Agent category tabs
const categories = [
  { id: "all", label: "All AI Agents" },
  { id: "copywriting", label: "Copywriting & Content" },
  { id: "seo", label: "SEO & Organic Growth" },
  { id: "ads", label: "Paid Ads & Performance" },
  { id: "social", label: "Social Media Management" },
  { id: "email", label: "Email & Outreach" },
  { id: "analytics", label: "Analytics & Optimization" },
  { id: "profiles", label: "Agent Profiles" }
];

// Mock usage stats (would be fetched from API in real implementation)
const getAgentUsageStat = (agent: Agent) => {
  const stats = {
    copywriting: "10,000 words written this week",
    seo: "5 keyword strategies optimized",
    ads: "$2,500 ad spend managed",
    creative: "12 designs generated",
    email: "3 campaigns sent (42% open rate)",
    analytics: "15 reports generated",
    social: "28 posts scheduled across platforms"
  };
  
  return stats[agent.type as keyof typeof stats] || "Ready to start working";
};

// Suggested pairings for each agent type
const getAgentPairings = (type: AgentType): AgentType[] => {
  const pairings: Record<AgentType, AgentType[]> = {
    copywriting: ["seo", "social", "email"],
    seo: ["copywriting", "analytics", "ads"],
    ads: ["analytics", "creative", "copywriting"],
    creative: ["social", "ads", "copywriting"],
    email: ["copywriting", "analytics", "creative"],
    analytics: ["ads", "seo", "email"],
    social: ["creative", "copywriting", "analytics"]
  };
  
  return pairings[type] || [];
};

// Icons for each agent type
const getAgentIcon = (type: AgentType) => {
  const icons = {
    seo: <Search className="h-6 w-6" />,
    copywriting: <PenTool className="h-6 w-6" />,
    ads: <PieChart className="h-6 w-6" />,
    creative: <Image className="h-6 w-6" />,
    email: <Mail className="h-6 w-6" />,
    analytics: <BarChart2 className="h-6 w-6" />,
    social: <MessageCircle className="h-6 w-6" />
  };
  
  return icons[type] || <Users className="h-6 w-6" />;
};

// Color classes for each agent type
const getAgentColorClass = (type: AgentType) => {
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

// Agent card component with hover animation
const AgentCard = ({ agent, onAddToWorkflow }: { agent: Agent, onAddToWorkflow?: (agent: Agent) => void }) => {
  const colorClass = getAgentColorClass(agent.type);
  const pairings = getAgentPairings(agent.type);
  const usageStat = getAgentUsageStat(agent);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleUseNow = () => {
    toast({
      title: "Agent activated",
      description: `${agent.name} is now ready to assist you.`,
    });
    
    // Navigate to appropriate tool page based on agent type
    const toolRoutes: Record<AgentType, string> = {
      copywriting: "/content-hub",
      seo: "/content-hub/seo",
      ads: "/analyzer",
      creative: "/ai-tools/image",
      email: "/content-hub/email",
      analytics: "/analyzer",
      social: "/content-hub/social"
    };
    
    setTimeout(() => {
      setLocation(toolRoutes[agent.type] || "/content-hub");
    }, 500);
  };
  
  const handleAddToWorkflow = () => {
    if (onAddToWorkflow) {
      onAddToWorkflow(agent);
    } else {
      toast({
        title: "Agent added to workflow",
        description: "Redirecting to workflow editor...",
      });
      
      setTimeout(() => {
        setLocation("/workflow");
      }, 500);
    }
  };
  
  return (
    <>
      <motion.div 
        className={`relative rounded-xl overflow-hidden transition-all ${CARD_3D_STYLES.variants.modern} ${SHADOWS.md} hover:${SHADOWS.lg}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        {/* Accent gradient at top */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        {/* Agent Header with Icon & Type Badge */}
        <div className="flex items-start justify-between p-5 border-b-2 border-black/10">
          <div className="flex items-center">
            <div className={cn("p-2.5 rounded-lg border-2 border-black shadow-sm", colorClass)}>
              {getAgentIcon(agent.type)}
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{agent.name}</h3>
              <Badge 
                variant="outline" 
                className={`mt-1 ${UI_COMPONENTS.badge} bg-white dark:bg-gray-800`}
              >
                {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
              </Badge>
            </div>
          </div>
          <motion.div 
            whileHover={{ rotate: 90, scale: 1.1, transition: { duration: 0.2 } }}
            className="text-gray-400 hover:text-primary cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            onClick={() => setIsDetailsOpen(true)}
          >
            <Plus size={20} />
          </motion.div>
        </div>
        
        {/* Agent Description */}
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{agent.description}</p>
          
          {/* Usage Stats */}
          <div className="mt-4 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-2">
              <Star size={14} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span>{usageStat}</span>
          </div>
          
          {/* Pairs Well With */}
          <div className="mt-4 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-gray-100 dark:border-gray-700">
            <h4 className={`${TYPOGRAPHY.utility.label} mb-2`}>
              Pairs Well With
            </h4>
            <div className="flex flex-wrap gap-2">
              {pairings.map(pairing => (
                <Badge 
                  key={pairing} 
                  variant="secondary" 
                  className="text-xs border border-black/40 shadow-sm"
                >
                  {pairing.charAt(0).toUpperCase() + pairing.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-t-2 border-black/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              className={`${BUTTON_3D_STYLES.outline} border-2 border-black ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
              onClick={() => setIsDetailsOpen(true)}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              className={`group ${BUTTON_3D_STYLES.primary} ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
              onClick={handleUseNow}
            >
              Use Now
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className={`w-full flex items-center justify-center gap-2 mt-1 ${BUTTON_3D_STYLES.secondary} ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
            onClick={handleAddToWorkflow}
          >
            <Plus size={14} />
            <span>Add to Workflow</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Agent Details Dialog */}
      <AgentDetailsDialog
        agent={agent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUseNow={handleUseNow}
        onAddToWorkflow={handleAddToWorkflow}
      />
    </>
  );
};

// Main AI Agents Marketplace component
const AIAgentsMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch agents from API
  const { data: agentsData, isLoading } = useQuery<{agents: Agent[]}>({
    queryKey: ['/api/agents/dev/all'],
  });
  
  // Extract the agents array from the response
  const agents = Array.isArray(agentsData?.agents) ? agentsData.agents : [];
  
  // Filter agents based on selected category and search query
  const filteredAgents = agents.filter((agent) => {
    const matchesCategory = selectedCategory === "all" || agent.type === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const handleAgentCreated = (agent: Agent) => {
    toast({
      title: "Agent created successfully",
      description: `${agent.name} has been added to your agent marketplace.`,
    });
  };
  
  const handleAddToWorkflow = (agent: Agent) => {
    toast({
      title: "Agent added to workflow",
      description: "Redirecting to workflow editor...",
    });
    
    // Short delay before redirecting to workflow
    setTimeout(() => {
      setLocation("/workflow");
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Header Section */}
      <motion.div 
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl ${CARD_3D_STYLES.variants.solid} mb-8`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <motion.h1 
            className={`${TYPOGRAPHY.headings.h2} text-gray-900 dark:text-white flex items-center gap-3`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              AI Agents Marketplace
            </span>
            <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2 border-2 border-black shadow-sm">
              PREMIUM
            </span>
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300 mt-1 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Find the perfect AI agents for your marketing needs and build powerful automated workflows
          </motion.p>
        </div>
        
        {/* Search & Filter Controls */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search agents..."
              className={`pl-10 w-full md:w-64 ${UI_COMPONENTS.input}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`flex items-center gap-2 ${BUTTON_3D_STYLES.outline} border-2 border-black ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className={`${UI_COMPONENTS.popover} p-1`}
            >
              <DropdownMenuItem onClick={() => setSelectedCategory("all")} className="rounded-md">
                All AI Agents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("copywriting")} className="rounded-md">
                Copywriting & Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("seo")} className="rounded-md">
                SEO & Organic Growth
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("ads")} className="rounded-md">
                Paid Ads & Performance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("social")} className="rounded-md">
                Social Media Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("email")} className="rounded-md">
                Email & Outreach
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("analytics")} className="rounded-md">
                Analytics & Optimization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory("profiles")} className="rounded-md">
                Agent Profiles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>
      
      {/* Category Tabs */}
      <div className={`border-b-3 border-black p-1 relative ${SHADOWS.pronounced}`}>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-40"></div>
        <nav className="flex space-x-2 overflow-x-auto px-2 py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" aria-label="Categories">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "py-2 px-3 font-medium text-sm whitespace-nowrap rounded-md border-2 transition-all duration-200",
                selectedCategory === category.id
                  ? "border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.label}
            </motion.button>
          ))}
        </nav>
      </div>
      
      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
          {[...Array(8)].map((_, index) => (
            <div 
              key={index} 
              className="rounded-xl border bg-gray-50 animate-pulse h-[300px]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
          {filteredAgents.map((agent: Agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onAddToWorkflow={handleAddToWorkflow}
            />
          ))}
          
          {/* Add New Agent Card */}
          <motion.div 
            className={`${CARD_3D_STYLES.variants.modern} ${SHADOWS.md} hover:${SHADOWS.lg} rounded-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center cursor-pointer`}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 border-2 border-transparent bg-origin-border bg-clip-border bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 rounded-xl"></div>
            
            <div className={`h-16 w-16 rounded-full bg-primary-50 dark:bg-primary-900/20 border-2 border-black flex items-center justify-center mb-4 ${SHADOWS.sm}`}>
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className={`${TYPOGRAPHY.headings.h4} text-gray-900 dark:text-white mb-2`}>
              Add Custom Agent
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Create a new AI agent with custom capabilities
            </p>
            <Button 
              variant="outline"
              className={`${BUTTON_3D_STYLES.outline} border-2 border-black ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Get Started
              <ChevronRight size={16} className="ml-1 opacity-70" />
            </Button>
          </motion.div>
          
          {/* Agent Create Modal */}
          <AgentCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onAgentCreated={handleAgentCreated}
          />
          
          {filteredAgents.length === 0 && searchQuery && (
            <motion.div 
              className={`col-span-full py-10 px-8 text-center ${CARD_3D_STYLES.variants.modern} ${SHADOWS.md} rounded-xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className={`h-16 w-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-black flex items-center justify-center ${SHADOWS.sm}`}>
                  <Search size={24} className="text-yellow-500" />
                </div>
              </div>
              <h3 className={`${TYPOGRAPHY.headings.h3} text-gray-900 dark:text-white mb-2`}>No agents found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Try adjusting your search or filter settings to find what you're looking for.
              </p>
              <Button 
                className={`mt-4 ${BUTTON_3D_STYLES.outline} border-2 border-black ${BUTTON_3D_STYLES.interaction.moveOnHover}`}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAgentsMarketplace;