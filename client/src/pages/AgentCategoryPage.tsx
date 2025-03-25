import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import SidebarOptimized from '@/components/SidebarOptimized';
import PremiumAgentCard from '@/components/PremiumAgentCard';
import {
  ArrowLeft,
  Filter,
  Search,
  SlidersHorizontal,
  Check,
  TrendingUp,
  Clock,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  Star,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Agent, AgentSkill, normalizeSkillToString } from '@/types/marketplace';

// Define CategoryData type
interface CategoryData {
  id: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  icon: string;
  headerBg: string;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Checkbox,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';

// Sample category data (in a real app, this would come from an API)
const categoryData: Record<string, CategoryData> = {
  'content-creation': {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'AI agents specialized in writing and creating various types of content for marketing channels, websites, emails and more.',
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-600',
    icon: '✍️',
    headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-600'
  },
  'seo-optimization': {
    id: 'seo-optimization',
    name: 'SEO & Growth',
    description: 'Specialized agents that help optimize content and strategies for search engines and growth marketing.',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-600',
    icon: '🔍',
    headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
  },
  'social-media': {
    id: 'social-media',
    name: 'Social Media',
    description: 'Expert agents in creating, scheduling, and managing content for social media platforms.',
    color: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-600',
    icon: '📱',
    headerBg: 'bg-gradient-to-r from-pink-500 to-rose-600'
  },
  'email-marketing': {
    id: 'email-marketing', 
    name: 'Email Marketing',
    description: 'Specialists in crafting compelling email campaigns, sequences, and newsletters.',
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-600',
    icon: '✉️',
    headerBg: 'bg-gradient-to-r from-purple-500 to-violet-600'
  },
  'analytics': {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Data-focused agents that analyze marketing performance and provide actionable insights.',
    color: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-600',
    icon: '📊',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-600'
  },
  'strategy': {
    id: 'strategy',
    name: 'Marketing Strategy',
    description: 'Strategic advisors that help plan comprehensive marketing campaigns and initiatives.',
    color: 'from-cyan-500 to-sky-600',
    textColor: 'text-cyan-600',
    icon: '💡',
    headerBg: 'bg-gradient-to-r from-cyan-500 to-sky-600'
  }
};

// Sample agent data for content creation
const contentCreationAgents: Agent[] = [
  {
    id: 'content-strategist', 
    name: 'Content Strategist',
    category: 'content-creation',
    description: 'Creates comprehensive content strategies aligned with marketing goals', 
    avatar: '📝',
    rating: 4.7, 
    reviews: 217,
    level: 'Advanced',
    compatibility: 98,
    skills: ['Copywriting', 'Ad Writing', 'Landing Pages'],
    primaryColor: 'bg-blue-600',
    secondaryColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'blog-specialist',
    name: 'Blog Specialist',
    category: 'content-creation',
    description: 'Creates in-depth, engaging blog posts optimized for both readers and search engines',
    avatar: '📝',
    rating: 4.7,
    reviews: 208,
    level: 'Expert',
    compatibility: 94,
    skills: ['Long-form Content', 'SEO Writing', 'Topic Research'],
    primaryColor: 'bg-indigo-600',
    secondaryColor: 'from-indigo-500 to-purple-600',
  },

  {
    id: 'email-copywriter',
    name: 'Email Copywriter',
    category: 'content-creation',
    description: 'Expert in crafting high-converting email sequences and newsletters',
    avatar: '📧',
    rating: 4.6,
    reviews: 231,
    level: 'Intermediate',
    compatibility: 95,
    skills: ['Email Sequences', 'Subject Lines', 'Newsletters'],
    primaryColor: 'bg-sky-600',
    secondaryColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'technical-writer',
    name: 'Technical Writer',
    category: 'content-creation',
    description: 'Specializes in creating clear, accurate technical documentation and guides',
    avatar: '📘',
    rating: 4.5,
    reviews: 156,
    level: 'Expert',
    compatibility: 88,
    skills: ['Technical Docs', 'Product Guides', 'Tutorials'],
    primaryColor: 'bg-cyan-600',
    secondaryColor: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'social-copywriter',
    name: 'Social Media Copywriter',
    category: 'content-creation',
    description: 'Creates engaging, platform-optimized content for social media posts',
    avatar: '📱',
    rating: 4.8,
    reviews: 274,
    level: 'Advanced',
    compatibility: 96,
    skills: ['Social Posts', 'Captions', 'Platform Optimization'],
    primaryColor: 'bg-pink-600',
    secondaryColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'storyteller',
    name: 'Brand Storyteller',
    category: 'content-creation',
    description: 'Crafts compelling brand narratives and emotional storytelling content',
    avatar: '📚',
    rating: 4.7,
    reviews: 193,
    level: 'Advanced',
    compatibility: 93,
    skills: ['Brand Stories', 'Narratives', 'Emotional Copy'],
    primaryColor: 'bg-amber-600',
    secondaryColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'content-planner',
    name: 'Content Strategist',
    category: 'content-creation',
    description: 'Plans comprehensive content strategies across multiple channels',
    avatar: '📋',
    rating: 4.9,
    reviews: 217,
    level: 'Expert',
    compatibility: 97,
    skills: ['Content Planning', 'Editorial Calendar', 'Topic Research'],
    primaryColor: 'bg-emerald-600',
    secondaryColor: 'from-emerald-500 to-green-600',
  }
];

// Sample SEO agents
const seoAgents: Agent[] = [
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    category: 'seo-optimization',
    description: 'Specializes in optimizing content for maximum search engine visibility',
    avatar: '🔍',
    rating: 4.8,
    reviews: 287,
    level: 'Expert',
    compatibility: 92,
    skills: ['Keyword Research', 'On-page SEO', 'Content Optimization'],
    primaryColor: 'bg-green-600',
    secondaryColor: 'from-green-500 to-emerald-600',
  },
  {
    id: 'local-seo',
    name: 'Local SEO Expert',
    category: 'seo-optimization',
    description: 'Focused on improving local search presence and Google Business profiles',
    avatar: '📍',
    rating: 4.6,
    reviews: 173,
    level: 'Advanced',
    compatibility: 89,
    skills: ['Local Search', 'Google Business', 'Local Content'],
    primaryColor: 'bg-teal-600',
    secondaryColor: 'from-teal-500 to-green-600',
  }
];

// Sample social media agents
const socialMediaAgents: Agent[] = [
  {
    id: 'social-strategist',
    name: 'Social Media Strategist',
    category: 'social-media',
    description: 'Creates engaging, platform-optimized content for social media channels',
    avatar: '📱',
    rating: 4.7,
    reviews: 312,
    level: 'Advanced',
    compatibility: 95,
    skills: ['Social Posts', 'Content Calendar', 'Platform Optimization'],
    primaryColor: 'bg-pink-600',
    secondaryColor: 'from-pink-500 to-rose-600',
  }
];

// Map category to agents list
const categoryAgentsMap: Record<string, Agent[]> = {
  'content-creation': contentCreationAgents,
  'seo-optimization': seoAgents,
  'social-media': socialMediaAgents,
  'email-marketing': contentCreationAgents.filter(a => a.skills && a.skills.some(s => typeof s === 'string' && s.toLowerCase().includes('email'))),
  'analytics': [contentCreationAgents[7]], // Content strategist
  'strategy': [contentCreationAgents[7]] // Content strategist
};

// Expertise Filter
const expertiseLevels = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

// Skills Filter
const skillCategories = [
  {
    name: 'Content Types',
    skills: ['Copywriting', 'Long-form Content', 'Technical Docs', 'Blog Posts', 'Product Guides', 'Email Sequences', 'Social Posts', 'Video Scripts']
  },
  {
    name: 'Marketing Skills',
    skills: ['SEO Writing', 'Landing Pages', 'Ad Writing', 'Storytelling', 'Brand Stories', 'Subject Lines']
  },
  {
    name: 'Strategy',
    skills: ['Content Planning', 'Topic Research', 'Editorial Calendar', 'Platform Optimization']
  }
];

export default function AgentCategoryPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  
  // Get the correct category data
  const category = categoryData[params.id] || categoryData['content-creation'];
  
  // Get agents for this category
  const agents = categoryAgentsMap[params.id] || contentCreationAgents;
  
  // Filter and sort agents
  const filteredAgents = agents
    .filter((agent: Agent) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          (agent.skills && agent.skills.some(skill => 
            normalizeSkillToString(skill).toLowerCase().includes(query)
          ))
        );
      }
      return true;
    })
    .filter((agent: Agent) => {
      // Expertise filter
      if (selectedExpertise.length > 0) {
        return selectedExpertise.includes(agent.level?.toLowerCase() || '');
      }
      return true;
    })
    .filter((agent: Agent) => {
      // Skills filter
      if (selectedSkills.length > 0) {
        return agent.skills && agent.skills.some(skill => 
          selectedSkills.includes(normalizeSkillToString(skill).toLowerCase())
        );
      }
      return true;
    })
    .sort((a: Agent, b: Agent) => {
      // Sorting
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'popularity') {
        return (b.reviews || 0) - (a.reviews || 0);
      } else if (sortBy === 'compatibility') {
        return (b.compatibility || 0) - (a.compatibility || 0);
      }
      return 0;
    });
  
  // Handle adding an agent to team
  const handleAddAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      toast({
        title: "Agent Added to Team",
        description: `${agent.name} has been added to your team.`,
        variant: "default",
      });
    }
  };
  
  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    const normalizedSkill = skill.toLowerCase();
    if (selectedSkills.includes(normalizedSkill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== normalizedSkill));
    } else {
      setSelectedSkills([...selectedSkills, normalizedSkill]);
    }
  };
  
  // Toggle expertise selection
  const toggleExpertise = (expertise: string) => {
    const normalizedExpertise = expertise.toLowerCase();
    if (selectedExpertise.includes(normalizedExpertise)) {
      setSelectedExpertise(selectedExpertise.filter(e => e !== normalizedExpertise));
    } else {
      setSelectedExpertise([...selectedExpertise, normalizedExpertise]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setSelectedExpertise([]);
    setSortBy('rating');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          {/* Header Section with background */}
          <div className={`${category.headerBg} text-white`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  className="flex items-center text-white hover:text-white/80 hover:bg-white/10 mb-4"
                  onClick={() => setLocation('/agent-marketplace')}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Marketplace
                </Button>
                
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl mr-4 shadow-lg border-2 border-black">
                    {category.icon}
                  </div>
                  <h1 className="text-3xl font-bold">{category.name}</h1>
                </div>
                <p className="text-white/90 max-w-3xl text-lg">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                <Card className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] sticky top-6">
                  <CardContent className="p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center">
                          <Filter className="w-5 h-5 mr-2" />
                          Filters
                        </h3>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 p-0 h-auto mb-3"
                          onClick={clearFilters}
                        >
                          Clear all filters
                        </Button>
                        
                        <div className="space-y-5">
                          {/* Expertise Filter */}
                          <div>
                            <h4 className="font-semibold mb-2">Expertise Level</h4>
                            <div className="space-y-2">
                              {expertiseLevels.map(level => (
                                <div key={level.value} className="flex items-center">
                                  <Checkbox 
                                    id={`expertise-${level.value}`}
                                    checked={selectedExpertise.includes(level.value)}
                                    onCheckedChange={() => toggleExpertise(level.value)}
                                    className="border-2 border-black"
                                  >
                                    <CheckboxIndicator>
                                      <Check className="h-4 w-4" />
                                    </CheckboxIndicator>
                                  </Checkbox>
                                  <label 
                                    htmlFor={`expertise-${level.value}`}
                                    className="text-sm ml-2 cursor-pointer"
                                  >
                                    {level.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Skills Filter */}
                          <div>
                            <h4 className="font-semibold mb-2">Skills</h4>
                            <Accordion type="multiple" className="w-full">
                              {skillCategories.map((category, idx) => (
                                <AccordionItem key={idx} value={`skills-${idx}`} className="border-b">
                                  <AccordionTrigger className="text-sm font-medium py-2">
                                    {category.name}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-2 pt-1 pb-2">
                                      {category.skills.map(skill => (
                                        <div key={skill} className="flex items-center">
                                          <Checkbox 
                                            id={`skill-${skill}`}
                                            checked={selectedSkills.includes(skill.toLowerCase())}
                                            onCheckedChange={() => toggleSkill(skill)}
                                            className="border-2 border-black"
                                          >
                                            <CheckboxIndicator>
                                              <Check className="h-4 w-4" />
                                            </CheckboxIndicator>
                                          </Checkbox>
                                          <label 
                                            htmlFor={`skill-${skill}`}
                                            className="text-sm ml-2 cursor-pointer"
                                          >
                                            {skill}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="lg:w-3/4">
                {/* Toolbar */}
                <Card className="mb-6 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder={`Search ${category.name} agents...`}
                          className="pl-8 border-2 border-black"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center mr-2 text-sm text-gray-500">
                          Sort by:
                        </div>
                        <Select
                          value={sortBy}
                          onValueChange={(value) => setSortBy(value)}
                        >
                          <SelectTrigger className="w-[160px] border-2 border-black">
                            <div className="flex items-center">
                              <SlidersHorizontal className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Sort by" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                <span>Highest Rated</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="popularity">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-pink-500" />
                                <span>Most Popular</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="compatibility">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-green-500" />
                                <span>Team Compatibility</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="newest">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                <span>Newest</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="hidden md:flex ml-2">
                          <Tabs defaultValue={viewMode} onValueChange={setViewMode} className="w-auto">
                            <TabsList className="border-2 border-black">
                              <TabsTrigger value="grid" className="px-2">
                                <LayoutGrid className="h-4 w-4" />
                              </TabsTrigger>
                              <TabsTrigger value="list" className="px-2">
                                <LayoutList className="h-4 w-4" />
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Filters */}
                    {(selectedSkills.length > 0 || selectedExpertise.length > 0) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedExpertise.map(expertise => (
                          <Badge 
                            key={`exp-${expertise}`} 
                            variant="outline"
                            className="px-2 py-1 border-2 border-black flex items-center gap-1 bg-gray-100"
                          >
                            <span className="capitalize">{expertise}</span>
                            <button 
                              onClick={() => toggleExpertise(expertise)}
                              className="ml-1 focus:outline-none"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        
                        {selectedSkills.map(skill => (
                          <Badge 
                            key={`skill-${skill}`} 
                            variant="outline"
                            className="px-2 py-1 border-2 border-black flex items-center gap-1 bg-gray-100"
                          >
                            <span className="capitalize">{skill}</span>
                            <button 
                              onClick={() => toggleSkill(skill)}
                              className="ml-1 focus:outline-none"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Results Count */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold">
                    {filteredAgents.length} {filteredAgents.length === 1 ? 'Agent' : 'Agents'} Found
                  </h2>
                </div>
                
                {/* Agent Cards */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map((agent, index) => (
                      <PremiumAgentCard 
                        key={agent.id} 
                        agent={agent} 
                        onQuickAdd={handleAddAgent}
                        animationDelay={index * 0.05}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAgents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        whileHover={{ x: 5 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
                          <div className={`h-1 bg-gradient-to-r ${agent.secondaryColor}`}></div>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${agent.primaryColor} text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`}>
                                  <span className="text-2xl">{agent.avatar}</span>
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-bold">{agent.name}</h3>
                                  <div className="flex items-center mt-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold ml-1">{agent.rating}</span>
                                    <span className="text-sm text-gray-500 ml-1">({agent.reviews})</span>
                                    <Badge variant="outline" className="ml-2 font-medium text-xs border-2 border-black">
                                      {agent.level}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{agent.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
                                  onClick={() => setLocation(`/agent-marketplace/${agent.id}`)}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm"
                                  className="text-sm border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] text-white"
                                  onClick={() => handleAddAgent(agent.id)}
                                >
                                  Add to Team
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {agent.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="font-medium">
                                  {normalizeSkillToString(skill)}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* No Results */}
                {filteredAgents.length === 0 && (
                  <Card className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        We couldn't find any agents matching your current filters. Try adjusting your search criteria or clear the filters.
                      </p>
                      <Button 
                        onClick={clearFilters}
                        className="border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                      >
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}