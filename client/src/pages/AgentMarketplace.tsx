import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarOptimized from '@/components/SidebarOptimized';
import PremiumAgentCard from '@/components/PremiumAgentCard';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Zap,
  BrainCircuit,
  Compass,
  Users,
  PenTool,
  BarChart,
  LineChart,
  Mail,
  MessageSquare,
  FileText,
  Target,
  Globe,
  Lightbulb
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { Agent, Category, FilterOptions, ExtendedAgent, AgentSkill, normalizeSkillToString } from '@/types/marketplace';
import { agents as agentsDataImport } from '@/data/agents';

// Helper function to normalize skills to string format for display
const normalizeSkills = (skills: AgentSkill[]): string[] => {
  return skills.map(skill => typeof skill === 'string' ? skill : skill.name);
};

// Convert ExtendedAgent array to Agent array for consistent handling
const agentsData: Agent[] = agentsDataImport;

// Define agent categories
const agentCategories: Category[] = [
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'AI agents specialized in writing and creating various types of content',
    icon: <PenTool />,
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600',
    agents: 12,
    popular: true
  },
  {
    id: 'seo-optimization',
    name: 'SEO & Growth',
    description: 'Agents that help optimize content and strategies for search engines',
    icon: <TrendingUp />,
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-600',
    agents: 8,
    popular: true
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Specialized in creating and managing content for social platforms',
    icon: <Globe />,
    color: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-600',
    agents: 10,
    popular: true
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Experts in crafting compelling email campaigns and sequences',
    icon: <Mail />,
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-600',
    agents: 7,
    popular: false
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Agents that analyze data and provide actionable marketing insights',
    icon: <BarChart />,
    color: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-600',
    agents: 6,
    popular: false
  },
  {
    id: 'strategy',
    name: 'Marketing Strategy',
    description: 'Strategic advisors that help plan and optimize marketing campaigns',
    icon: <Lightbulb />,
    color: 'from-cyan-500 to-sky-600',
    textColor: 'text-cyan-600',
    agents: 9,
    popular: true
  },
  {
    id: 'customer-engagement',
    name: 'Customer Engagement',
    description: 'Specialized in customer communication and relationship building',
    icon: <MessageSquare />,
    color: 'from-teal-500 to-emerald-600',
    textColor: 'text-teal-600',
    agents: 5,
    popular: false
  },
  {
    id: 'conversion',
    name: 'Conversion Optimization',
    description: 'Experts in optimizing content and experiences for conversions',
    icon: <Target />,
    color: 'from-red-500 to-rose-600',
    textColor: 'text-red-600',
    agents: 8,
    popular: false
  }
];

// Define trending agents
// Convert our extended agents to the simpler Agent interface for the marketplace
const trendingAgents: Agent[] = [
  // Analytics Advisor (existing agent)
  {
    id: 'analytics-advisor',
    name: 'Analytics Advisor',
    category: 'analytics',
    description: 'Analyzes marketing data to provide actionable insights and recommendations',
    avatar: '📊',
    rating: 4.6,
    reviews: 198,
    level: 'Expert',
    compatibility: 88,
    skills: ['Data Analysis', 'Reporting', 'Trend Identification'],
    primaryColor: 'bg-amber-600',
    secondaryColor: 'from-amber-500 to-orange-600',
  },
  // Add all agents from agentsData to ensure all are searchable
  ...agentsData.map(agent => ({
    id: agent.id,
    name: agent.name,
    category: agent.category,
    description: agent.description,
    avatar: agent.avatar,
    rating: agent.rating,
    reviews: agent.reviews,
    level: agent.level,
    compatibility: agent.compatibility,
    skills: agent.skills || [],
    primaryColor: agent.primaryColor,
    secondaryColor: agent.secondaryColor,
    featured: agent.featured,
    trending: agent.trending,
    new: agent.new,
    premium: agent.premium
  }))
];

// Using Agent interface from types/marketplace.ts

// Category Card Component
// Using Category interface from types/marketplace.ts

const CategoryCard = ({ category, onClick }: { category: Category, onClick: (id: string) => void }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={() => onClick(category.id)}
    >
      <Card className="overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
        <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className={`p-3 rounded-full ${category.textColor} bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`}>
              {category.icon}
            </div>
            
            <Badge variant="outline" className="font-medium border-2 border-black ml-2">
              {category.agents} Agents
            </Badge>
          </div>
          <CardTitle className="mt-2">{category.name}</CardTitle>
          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
        </CardHeader>
        
        <CardFooter className="pt-0 pb-4">
          <Button 
            variant="outline" 
            className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
          >
            Browse Agents <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Main Marketplace Component
export default function AgentMarketplace() {
  console.log("Rendering AgentMarketplace component");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Using the FilterOptions interface for proper typing
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    level: 'all',
    sort: 'popular'
  });
  
  // Filter agents based on all filter criteria
  const filteredAgents = useMemo(() => {
    console.log("Filtering with:", filters);
    
    // Create a copy of the agents array for filtering
    let results = [...trendingAgents];
    
    // Apply category filter first (exact match)
    if (filters.category !== 'all') {
      console.log("Applying category filter:", filters.category);
      results = results.filter(agent => agent.category === filters.category);
      console.log("After category filter:", results.length, "agents");
    }
    
    // Apply level filter next (case-insensitive)
    if (filters.level !== 'all') {
      console.log("Applying level filter:", filters.level);
      results = results.filter(agent => 
        agent.level.toLowerCase() === filters.level.toLowerCase()
      );
      console.log("After level filter:", results.length, "agents");
    }
    
    // Apply search filter if there's a search term - Content Hub approach
    if (filters.search && filters.search.trim()) {
      console.log("Applying search filter:", filters.search);
      const searchTerms = filters.search.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        results = results.filter(agent => {
          // Build searchable text for each agent
          const nameText = agent.name.toLowerCase();
          const descriptionText = agent.description.toLowerCase();
          const categoryText = agent.category.replace(/-/g, ' ').toLowerCase();
          const levelText = agent.level.toLowerCase();
          const skillsText = agent.skills
            .map(skill => normalizeSkillToString(skill).toLowerCase())
            .join(' ');
          
          // Combine all searchable text
          const combinedText = `${nameText} ${descriptionText} ${categoryText} ${levelText} ${skillsText}`;
          
          // Check if ALL search terms are found in the combined text
          const matches = searchTerms.every(term => combinedText.includes(term));
          
          // For debugging, log which agents match or don't match the search
          if (matches) {
            console.log(`Agent "${agent.name}" matches search for "${filters.search}"`);
          }
          
          return matches;
        });
      }
      
      console.log("After search filter:", results.length, "agents");
    }
    
    // Apply sorting
    if (filters.sort === 'popular') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'newest') {
      // Sort by newest (we'll assume newer agents have higher ratings for this example)
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === 'alphabetical') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    console.log("Final filtered results:", results.length, "agents");
    return results;
  }, [filters, trendingAgents]);

  // Calculate agent counts by category
  const getCategoryAgentCount = (categoryId: string) => {
    return trendingAgents.filter(agent => agent.category === categoryId).length;
  };

  // Generate search suggestions based on current input - using Content Hub approach
  const generateSearchSuggestions = (input: string) => {
    if (!input.trim()) {
      setSearchSuggestions([]);
      return;
    }
    
    const inputLower = input.toLowerCase();
    
    // Create a map to store terms with their associated metadata
    const searchableTermsMap = new Map<string, {
      type: 'name' | 'skill' | 'category' | 'level',
      count: number,
      related?: string
    }>();
    
    // Collect agent names, skills, and categories with metadata
    trendingAgents.forEach(agent => {
      // Add agent name
      const nameKey = agent.name.toLowerCase();
      if (nameKey.includes(inputLower)) {
        const existing = searchableTermsMap.get(agent.name) || { type: 'name', count: 0 };
        searchableTermsMap.set(agent.name, { ...existing, count: existing.count + 1 });
      }
      
      // Add category
      if (agent.category) {
        const categoryName = agent.category.replace('-', ' ');
        const categoryKey = categoryName.toLowerCase();
        if (categoryKey.includes(inputLower)) {
          const existing = searchableTermsMap.get(categoryName) || { type: 'category', count: 0 };
          searchableTermsMap.set(categoryName, { ...existing, count: existing.count + 1 });
        }
      }
      
      // Add level
      if (agent.level) {
        const levelKey = agent.level.toLowerCase();
        if (levelKey.includes(inputLower)) {
          const existing = searchableTermsMap.get(agent.level) || { type: 'level', count: 0 };
          searchableTermsMap.set(agent.level, { ...existing, count: existing.count + 1 });
        }
      }
      
      // Add skills
      if (agent.skills && agent.skills.length > 0) {
        agent.skills.forEach(skill => {
          const skillText = normalizeSkillToString(skill);
          const skillKey = skillText.toLowerCase();
          if (skillKey.includes(inputLower)) {
            const existing = searchableTermsMap.get(skillText) || { 
              type: 'skill', 
              count: 0,
              related: agent.name
            };
            searchableTermsMap.set(skillText, { 
              ...existing, 
              count: existing.count + 1,
              // Keep the existing related agent name or use this one
              related: existing.related || agent.name
            });
          }
        });
      }
    });
    
    // Convert to array and sort by relevance (exact matches first, then by count)
    const results = Array.from(searchableTermsMap.entries())
      .map(([term, metadata]) => ({ term, ...metadata }))
      .sort((a, b) => {
        // Exact match gets highest priority
        if (a.term.toLowerCase() === inputLower) return -1;
        if (b.term.toLowerCase() === inputLower) return 1;
        
        // Then sort by whether the term starts with the input
        const aStartsWith = a.term.toLowerCase().startsWith(inputLower);
        const bStartsWith = b.term.toLowerCase().startsWith(inputLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then sort by count (popularity)
        return b.count - a.count;
      })
      .slice(0, 5) // Limit to 5 suggestions
      .map(item => item.term); // Return just the term
    
    setSearchSuggestions(results);
  };
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({...filters, search: value});
    generateSearchSuggestions(value);
    setShowSuggestions(true);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    console.log("Search suggestion clicked:", suggestion);
    
    // First hide the suggestions dropdown
    setShowSuggestions(false);
    
    // Updated search focus - simplified for better reliability
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search agents"]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    }, 100);
    
    // Then update the filters state with the new search term
    setFilters(prevFilters => {
      const newFilters = {...prevFilters, search: suggestion};
      console.log("Setting new filters:", newFilters);
      return newFilters;
    });
    
    // For added certainty, force a filter update in the next event loop
    requestAnimationFrame(() => {
      console.log("Forcing search application for:", suggestion);
      // This direct DOM approach as a fallback - with additional safety
      setTimeout(() => {
        const searchInputs = document.querySelectorAll('input[placeholder*="Search agents"]');
        if (searchInputs && searchInputs.length > 0) {
          const searchInput = searchInputs[0] as HTMLInputElement;
          searchInput.value = suggestion;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 100);
    });
  };

  // Update category counts on component mount
  useEffect(() => {
    console.log("AgentMarketplace component mounted");
    // Update the agent counts in categories based on available agents
    agentCategories.forEach(category => {
      // Update the count dynamically based on available agents
      category.agents = getCategoryAgentCount(category.id);
    });
    return () => console.log("AgentMarketplace component unmounted");
  }, []);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    console.log(`Category selected: ${categoryId}`);
    setLocation(`/agent-marketplace/category/${categoryId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Agent Marketplace</h1>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">PREMIUM</Badge>
                </div>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Build your dream marketing team with specialized AI agents
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setLocation("/lego-workflow")}
                  className="relative border-2 border-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transform hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
                >
                  <div className="flex items-center">
                    <span>Build Team Workflow</span>
                    <Sparkles className="h-4 w-4 ml-1.5" />
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transform hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all bg-white"
                  onClick={() => setLocation("/agent-marketplace/create")}
                >
                  <div className="flex items-center">
                    <span>Create Custom Agent</span>
                    <PlusCircle className="h-4 w-4 ml-1.5" />
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Search & Filter Section */}
            <Card className="mb-8 border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1" ref={searchRef}>
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search agents by name, skills, or specialty..."
                      className="pl-8 border-2 border-black"
                      value={filters.search}
                      onChange={handleSearchChange}
                      onFocus={() => setShowSuggestions(Boolean(searchSuggestions.length))}
                    />
                    
                    {/* Autocomplete Suggestions - ContentHub Style */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-md shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] max-h-72 overflow-auto">
                        <div className="p-2 border-b border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 px-2">Search Suggestions</h4>
                        </div>
                        <ul className="py-2">
                          {searchSuggestions.map((suggestion, index) => (
                            <li 
                              key={index}
                              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center group transition-colors"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <div className="p-1.5 rounded-md bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                <Search className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <span className="font-medium text-gray-800 block">{suggestion}</span>
                                <span className="text-xs text-gray-500">Click to search</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </li>
                          ))}
                        </ul>
                        {filters.search.trim().length > 0 && (
                          <div className="px-4 py-2 border-t border-gray-200">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm text-blue-600 hover:text-blue-700"
                              onClick={() => handleSuggestionClick(filters.search)}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Search for "<span className="font-medium">{filters.search}</span>"
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="w-[180px]">
                      <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters({...filters, category: value})}
                      >
                        <SelectTrigger className="border-2 border-black">
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Category" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="content-creation">Content Creation</SelectItem>
                          <SelectItem value="seo-optimization">SEO & Growth</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="email-marketing">Email Marketing</SelectItem>
                          <SelectItem value="analytics">Analytics & Insights</SelectItem>
                          <SelectItem value="strategy">Marketing Strategy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-[180px]">
                      <Select
                        value={filters.level}
                        onValueChange={(value) => setFilters({...filters, level: value})}
                      >
                        <SelectTrigger className="border-2 border-black">
                          <div className="flex items-center">
                            <BrainCircuit className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Experience" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="border-3 border-black p-1 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  All Agents
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    Trending
                  </div>
                </TabsTrigger>
                <TabsTrigger value="newest" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Newest
                  </div>
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black rounded-md data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1.5" />
                    Saved
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {/* Featured Categories Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Categories</h2>
                    <Button 
                      variant="link" 
                      className="font-medium flex items-center text-blue-600 dark:text-blue-400"
                      onClick={() => setLocation('/agent-marketplace/categories')}
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {agentCategories.slice(0, 8).map((category) => (
                      <CategoryCard 
                        key={category.id} 
                        category={category} 
                        onClick={handleCategorySelect}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Trending Agents Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Agents</h2>
                      <Badge className="ml-2 bg-gradient-to-r from-orange-400 to-pink-500 border-0 text-white">HOT</Badge>
                    </div>
                    <Button 
                      variant="link" 
                      className="font-medium flex items-center text-blue-600 dark:text-blue-400"
                      onClick={() => setActiveTab('trending')}
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filters.search.trim() ? (
                      filteredAgents.length > 0 ? (
                        // Show all filtered agents, not just trending ones when searching
                        filteredAgents.slice(0, 8).map((agent) => (
                          <PremiumAgentCard key={agent.id} agent={agent} />
                        ))
                      ) : (
                        <div className="text-center py-16 w-full col-span-4">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="h-10 w-10 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No agents found for "{filters.search}"</h3>
                          <p className="text-gray-500 mb-4">Try searching for a different term</p>
                          <Button 
                            variant="outline"
                            className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                            onClick={() => setFilters({...filters, search: ''})}
                          >
                            Clear Search
                          </Button>
                        </div>
                      )
                    ) : (
                      // When not searching, show trending agents
                      <>
                        {/* Agents trending */}
                        {trendingAgents
                          .filter(agent => agent.trending)
                          .slice(0, 7)
                          .map((agent) => (
                            <PremiumAgentCard key={agent.id} agent={agent} />
                          ))
                        }
                      </>
                    )}
                  </div>
                </div>
                
                {/* Recent Teams Showcase */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Collections</h2>
                    <Button 
                      variant="link" 
                      className="font-medium flex items-center text-blue-600 dark:text-blue-400"
                      onClick={() => setLocation('/agent-marketplace/teams')}
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* Content Team Card */}
                    <Card className="overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 cursor-pointer">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                      <CardHeader>
                        <CardTitle>Content Dream Team</CardTitle>
                        <CardDescription>
                          Perfect team for comprehensive content creation and distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex -space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md">✍️</div>
                          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center border-2 border-white shadow-md">🔍</div>
                          <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center border-2 border-white shadow-md">📱</div>
                          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-white shadow-md">✉️</div>
                        </div>
                        <div className="mt-4 text-sm flex justify-between">
                          <span className="font-medium">4 Agents</span>
                          <span className="text-green-600 flex items-center">
                            <Sparkles className="w-4 h-4 mr-1" /> 98% Compatibility
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          Add to Workflow
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* SEO Team Card */}
                    <Card className="overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 cursor-pointer">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                      <CardHeader>
                        <CardTitle>SEO Power Squad</CardTitle>
                        <CardDescription>
                          Specialized team focused on search engine optimization and ranking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex -space-x-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center border-2 border-white shadow-md">🔍</div>
                          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center border-2 border-white shadow-md">📊</div>
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md">✍️</div>
                        </div>
                        <div className="mt-4 text-sm flex justify-between">
                          <span className="font-medium">3 Agents</span>
                          <span className="text-green-600 flex items-center">
                            <Sparkles className="w-4 h-4 mr-1" /> 95% Compatibility
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full border-2 border-black bg-gradient-to-r from-green-500 to-emerald-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          Add to Workflow
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Social Media Team Card */}
                    <Card className="overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 cursor-pointer">
                      <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-600"></div>
                      <CardHeader>
                        <CardTitle>Social Media Squad</CardTitle>
                        <CardDescription>
                          Complete team for dominating social media platforms and engagement
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex -space-x-3">
                          <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center border-2 border-white shadow-md">📱</div>
                          <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center border-2 border-white shadow-md">💡</div>
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md">✍️</div>
                          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center border-2 border-white shadow-md">📊</div>
                        </div>
                        <div className="mt-4 text-sm flex justify-between">
                          <span className="font-medium">4 Agents</span>
                          <span className="text-green-600 flex items-center">
                            <Sparkles className="w-4 h-4 mr-1" /> 97% Compatibility
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full border-2 border-black bg-gradient-to-r from-pink-500 to-rose-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]">
                          Add to Workflow
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trending">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* If search is active, show filtered results, otherwise show trending agents */}
                  {filters.search.trim() ? (
                    filteredAgents.length > 0 ? (
                      filteredAgents.filter(agent => agent.trending).map((agent, index) => (
                        <PremiumAgentCard key={`${agent.id}-${index}`} agent={agent} />
                      ))
                    ) : (
                      <div className="text-center py-16 w-full col-span-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Trending agents */}
                      {trendingAgents
                        .filter(agent => agent.trending)
                        .map((agent, index) => (
                          <PremiumAgentCard key={`${agent.id}-${index}`} agent={agent} />
                        ))
                      }
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="newest">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* If search is active, show filtered results, otherwise show trending agents */}
                  {filters.search.trim() ? (
                    filteredAgents.length > 0 ? (
                      filteredAgents.map((agent, index) => (
                        <PremiumAgentCard key={`${agent.id}-${index}`} agent={agent} />
                      ))
                    ) : (
                      <div className="text-center py-16 w-full">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Newest agents */}
                      {trendingAgents
                        .slice(0, 7)
                        .map((agent, index) => (
                          <PremiumAgentCard key={`${agent.id}-${index}`} agent={agent} />
                        ))
                      }
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Star className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No saved agents yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    You haven't saved any agents to your favorites. Browse the marketplace and save agents you'd like to use later.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('all')}
                    className="border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
                  >
                    Browse Marketplace
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}