import React, { useState, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Instagram, 
  Mail, 
  Tag, 
  Search, 
  Video, 
  PlusCircle,
  ArchiveIcon,
  ListChecks,
  ClockIcon,
  ChevronRight,
  ArrowRight,
  BarChart,
  BrainCircuit,
  PieChart,
  Megaphone,
  Globe,
  Target,
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  Award,
  Lightbulb,
  LineChart,
  RefreshCw,
  Settings,
  Share2,
  Sparkles,
  Leaf,
  Layout,
  Newspaper,
  BookOpen,
  PenTool,
  MousePointer,
  MessageSquare,
  Mic,
  Star,
  MapPin
} from "lucide-react";
import ContentGenerator from './ContentGenerator';
import ContentViewer from './ContentViewer';
import ConversationHistory from './ConversationHistory';
import AIAgentChat from './AIAgentChat';
import ContentPersonalizationForm, { PersonalizationFormData } from './ContentPersonalizationForm';
import AICollaborativeWorkspace from './AICollaborativeWorkspace';
import ContentLibrary from './ContentLibrary';
import { Conversation } from '@/lib/conversation-memory';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Define CategoryType interface for top-level categories
interface CategoryType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Define ContentType interface for subcategories (AI tools)
interface ContentType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  category: 'content-type' | 'marketing-function' | 'funnel-stage';
  subcategory?: string;
}

// Interface for quick action suggestions
interface QuickAction {
  id: string;
  label: string;
  contentType: string;
  prompt: string;
}

// Define top-level categories
const categories: CategoryType[] = [
  {
    id: "content-type",
    name: "Content Types",
    description: "Choose the type of marketing content you need to create",
    icon: <Layout className="h-6 w-6" />
  },
  {
    id: "marketing-function",
    name: "Marketing Functions",
    description: "Select based on your marketing strategy focus",
    icon: <BarChart className="h-6 w-6" />
  },
  {
    id: "funnel-stage",
    name: "Funnel Stage",
    description: "Choose content based on your customer journey stage",
    icon: <Target className="h-6 w-6" />
  }
];

// Define all content types (AI tools) with their categories
const contentTypes: ContentType[] = [
  // Content Types Category
  {
    id: "blog",
    name: "Blog & Long-form",
    shortName: "Blog",
    icon: <FileText className="h-5 w-5" />,
    description: "Create SEO-optimized blog posts, articles, whitepapers, and guides",
    category: "content-type"
  },
  {
    id: "email",
    name: "Email & Notifications",
    shortName: "Email",
    icon: <Mail className="h-5 w-5" />,
    description: "Craft compelling newsletters, promotional emails, and automated sequences",
    category: "content-type"
  },
  {
    id: "product",
    name: "Product & Enablement",
    shortName: "Product",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Create product documentation, training materials, and technical content",
    category: "content-type"
  },
  {
    id: "remix",
    name: "Remix Content",
    shortName: "Remix",
    icon: <RefreshCw className="h-5 w-5" />,
    description: "Repurpose existing content into new formats, snippets, and highlights",
    category: "content-type"
  },
  {
    id: "social",
    name: "Social Media",
    shortName: "Social",
    icon: <Instagram className="h-5 w-5" />,
    description: "Generate engaging posts, stories, and content for any social platform",
    category: "content-type"
  },
  {
    id: "strategy",
    name: "Strategy & Planning",
    shortName: "Strategy",
    icon: <Calendar className="h-5 w-5" />,
    description: "Develop content calendars, campaign blueprints, and editorial strategies",
    category: "content-type"
  },
  {
    id: "website",
    name: "Website",
    shortName: "Website",
    icon: <Globe className="h-5 w-5" />,
    description: "Create landing pages, web copy, and SEO-optimized website content",
    category: "content-type"
  },
  {
    id: "ad",
    name: "Advertising",
    shortName: "Ads",
    icon: <Tag className="h-5 w-5" />,
    description: "Create high-converting ad copy and creative for various platforms",
    category: "content-type"
  },
  {
    id: "audio-video",
    name: "Audio & Video",
    shortName: "Audio/Video",
    icon: <Video className="h-5 w-5" />,
    description: "Create scripts for podcasts, videos, and other audio-visual content",
    category: "content-type"
  },
  {
    id: "image",
    name: "Image",
    shortName: "Image",
    icon: <PenTool className="h-5 w-5" />,
    description: "Generate infographics, illustrations, and visual branding elements",
    category: "content-type"
  },
  {
    id: "pr",
    name: "PR & Comms",
    shortName: "PR",
    icon: <Newspaper className="h-5 w-5" />,
    description: "Create press releases, public statements, and corporate communications",
    category: "content-type"
  },

  // Marketing Functions Category
  {
    id: "product-marketing",
    name: "Product Marketing",
    shortName: "Product",
    icon: <Briefcase className="h-5 w-5" />,
    description: "Develop messaging, positioning, and competitive analysis for your products",
    category: "marketing-function"
  },
  {
    id: "social-marketing",
    name: "Social Media Marketing",
    shortName: "Social",
    icon: <Share2 className="h-5 w-5" />,
    description: "Build engagement, growth strategies, and community on social platforms",
    category: "marketing-function"
  },
  {
    id: "performance-marketing",
    name: "Performance Marketing",
    shortName: "Performance",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Create paid ads, conversion funnels, and optimization strategies",
    category: "marketing-function"
  },
  {
    id: "brand-marketing",
    name: "Brand Marketing",
    shortName: "Brand",
    icon: <Award className="h-5 w-5" />,
    description: "Develop brand identity, thought leadership, and brand positioning",
    category: "marketing-function"
  },
  {
    id: "content-marketing",
    name: "Content Marketing",
    shortName: "Content",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Create inbound content strategies and lead generation materials",
    category: "marketing-function"
  },
  {
    id: "field-marketing",
    name: "Field Marketing",
    shortName: "Field",
    icon: <MapPin className="h-5 w-5" />,
    description: "Generate content for events, sponsorships, and in-person campaigns",
    category: "marketing-function"
  },
  {
    id: "lifecycle-marketing",
    name: "Lifecycle Marketing",
    shortName: "Lifecycle",
    icon: <RefreshCw className="h-5 w-5" />,
    description: "Build customer journey maps and retention strategies",
    category: "marketing-function"
  },
  {
    id: "partner-marketing",
    name: "Partner Marketing",
    shortName: "Partner",
    icon: <Users className="h-5 w-5" />,
    description: "Create affiliate programs, co-marketing materials, and partner content",
    category: "marketing-function"
  },
  {
    id: "pr-communications",
    name: "PR & Communications",
    shortName: "PR & Comms",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Develop crisis management plans and reputation building content",
    category: "marketing-function"
  },

  // Funnel Stage Category
  {
    id: "awareness",
    name: "Awareness",
    shortName: "Awareness",
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Create SEO content, blog posts, and social content for new audiences",
    category: "funnel-stage"
  },
  {
    id: "consideration",
    name: "Consideration",
    shortName: "Consideration",
    icon: <Search className="h-5 w-5" />,
    description: "Build case studies, product comparisons, and webinar content",
    category: "funnel-stage"
  },
  {
    id: "conversion",
    name: "Conversion",
    shortName: "Conversion",
    icon: <MousePointer className="h-5 w-5" />,
    description: "Create landing pages, sales copy, and retargeting ad content",
    category: "funnel-stage"
  },
  {
    id: "retention",
    name: "Retention",
    shortName: "Retention",
    icon: <Star className="h-5 w-5" />,
    description: "Develop onboarding emails, loyalty programs, and survey content",
    category: "funnel-stage"
  }
];

// Define content tab options
const contentTabs = [
  { id: "browse", label: "Browse Tools", icon: <Layout className="h-4 w-4" /> },
  { id: "create", label: "Create Content", icon: <PlusCircle className="h-4 w-4" /> },
  { id: "recent", label: "Recent Content", icon: <ClockIcon className="h-4 w-4" /> },
  { id: "saved", label: "Saved", icon: <ArchiveIcon className="h-4 w-4" /> }
];

// Featured AI tools for the dashboard
const featuredTools = [
  {
    id: "blog-writer",
    name: "Blog Writer Pro",
    description: "Create SEO-optimized blog posts that drive traffic",
    icon: <FileText className="h-10 w-10 text-blue-500" />,
    color: "blue",
    category: "content-type",
    contentType: "blog"
  },
  {
    id: "social-generator",
    name: "Social Media Genius",
    description: "Generate platform-specific posts that engage your audience",
    icon: <Instagram className="h-10 w-10 text-pink-500" />,
    color: "pink",
    category: "content-type",
    contentType: "social"
  },
  {
    id: "email-wizard",
    name: "Email Campaign Wizard",
    description: "Craft email sequences that convert prospects to customers",
    icon: <Mail className="h-10 w-10 text-purple-500" />,
    color: "purple",
    category: "content-type",
    contentType: "email"
  },
  {
    id: "ad-creator",
    name: "Ad Copy Creator",
    description: "Write high-converting ad copy for multiple platforms",
    icon: <Tag className="h-10 w-10 text-green-500" />,
    color: "green",
    category: "content-type",
    contentType: "ad"
  }
];

// Now that we've imported MapPin from lucide-react, we don't need this custom implementation

export default function AIContentHub() {
  // State for navigation and content display
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeContentType, setActiveContentType] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ContentType[]>([]);
  const { toast } = useToast();
  
  // New states for personalization workflow
  const [showPersonalizationForm, setShowPersonalizationForm] = useState<boolean>(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationFormData | null>(null);
  const [showCollaborativeWorkspace, setShowCollaborativeWorkspace] = useState<boolean>(false);
  
  // References for smooth scrolling
  const categoryRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  
  // Function to find active content type details
  const getActiveContentDetails = () => {
    if (!activeContentType) return null;
    return contentTypes.find(type => type.id === activeContentType);
  };
  
  // Handle content category selection
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveContentType(null); // Reset content type selection when category changes
    
    // Scroll to tools section
    setTimeout(() => {
      if (toolsRef.current) {
        toolsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // Handle content type (AI tool) selection
  const handleContentTypeSelect = (contentType: string) => {
    setActiveContentType(contentType);
    setActiveTab("create"); // Switch to content creation tab
    setShowPersonalizationForm(true); // Show the personalization form for the selected content type
  };
  
  // Handle personalization form submission
  const handlePersonalizationFormSubmit = (data: PersonalizationFormData) => {
    setPersonalizationData(data);
    setShowPersonalizationForm(false);
    setShowCollaborativeWorkspace(true);
    // Log the data to track the workflow
    console.log("Personalization data submitted:", data);
  };
  
  // Filter content types by active category
  const getContentTypesByCategory = useCallback(() => {
    if (!activeCategory) return [];
    return contentTypes.filter(type => type.category === activeCategory);
  }, [activeCategory]);
  
  // Search function for content types
  const searchContentTypes = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const results = contentTypes.filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) || 
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.shortName.toLowerCase().includes(lowercaseQuery)
    );
    
    setSearchResults(results);
  }, []);
  
  // Handle content generation callback
  const handleContentGenerated = async (content: string, agentInfo?: { id: string, version: string }) => {
    setGeneratedContent(content);
    
    // Importamos el servicio de agentes para registrar el uso
    const agentServiceModule = await import('@/services/agentService').catch(err => {
      console.error('Error importing agent service:', err);
      return null;
    });
    
    // Extraemos el servicio default
    const agentService = agentServiceModule?.default;
    
    // Optional: Save the content as a conversation in Firestore
    if (content && activeContentType) {
      try {
        // Get the content type details
        const contentTypeDetails = contentTypes.find(type => type.id === activeContentType);
        
        // Track agent usage if we have agent info
        if (agentService && agentInfo) {
          agentService.trackAgentUsage(
            agentInfo.id,
            agentInfo.version || '1.0.0',
            { 
              type: 'content-hub',
              component: 'content-generator' 
            },
            {
              action: 'content-generation',
              contentType: activeContentType,
              category: activeCategory,
              timestamp: new Date().toISOString()
            }
          );
        }
        
        // Only import what we need to avoid circular dependencies
        const { createConversation, addMessageToConversation } = await import('@/lib/conversation-memory');
        
        // Create a title based on the content type
        const title = `${contentTypeDetails?.name || 'Content'} - ${new Date().toLocaleDateString()}`;
        
        // Create a new conversation with agent version information
        const conversation = await createConversation({
          title,
          initialMessage: "Please generate content for me based on the following details.",
          metadata: {
            contentType: activeContentType,
            category: activeCategory,
            tags: [contentTypeDetails?.category || '', contentTypeDetails?.name || ''],
            agentId: agentInfo?.id,
            agentVersion: agentInfo?.version,
            generatedAt: new Date().toISOString()
          }
        });
        
        // Add the AI response (the generated content)
        if (conversation && conversation.id) {
          await addMessageToConversation(
            conversation.id,
            { 
              role: 'assistant', 
              content: content,
              metadata: agentInfo ? {
                agentId: agentInfo.id,
                agentVersion: agentInfo.version
              } : undefined
            }
          );
          
          console.log("Content saved to conversation history:", conversation.id);
        }
      } catch (err) {
        console.error("Failed to save content to conversation history:", err);
        // We don't need to show an error to the user since this is a background operation
      }
    }
  };
  
  // Handle content regeneration
  const handleRegenerateContent = () => {
    setGeneratedContent("");
  };
  
  // Handle content updates (e.g., from improvements)
  const handleContentUpdate = (newContent: string) => {
    setGeneratedContent(newContent);
  };
  
  // Reset to main category view
  const handleBackToCategories = () => {
    setActiveCategory(null);
    setActiveContentType(null);
    
    // Scroll back to top
    setTimeout(() => {
      if (categoryRef.current) {
        categoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  
  // Animations for transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Render function for AI tool card
  const renderToolCard = (tool: ContentType) => (
    <motion.div
      key={tool.id}
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="cursor-pointer"
      onClick={() => handleContentTypeSelect(tool.id)}
    >
      <Card className="overflow-hidden h-full border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${getToolColorClasses(tool.id)}`}>
              {tool.icon}
            </div>
            <Badge variant="outline" className="text-xs">AI Powered</Badge>
          </div>
          <CardTitle className="text-base font-semibold">{tool.name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">{tool.description}</CardDescription>
        </CardHeader>
        <CardFooter className="pt-0 pb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto text-primary hover:text-primary/90 hover:bg-transparent"
          >
            <span className="text-xs">Select</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  // Function to determine tool color based on ID
  const getColorForTool = (id: string) => {
    const colorMap: { [key: string]: string } = {
      blog: "blue",
      email: "purple",
      product: "indigo",
      remix: "amber",
      social: "pink",
      strategy: "green",
      website: "cyan",
      ad: "orange",
      "audio-video": "red",
      image: "violet",
      pr: "emerald",
      "product-marketing": "blue",
      "social-marketing": "pink",
      "performance-marketing": "amber",
      "brand-marketing": "indigo",
      "content-marketing": "green",
      "field-marketing": "orange",
      "lifecycle-marketing": "purple",
      "partner-marketing": "cyan",
      "pr-communications": "emerald",
      awareness: "blue",
      consideration: "amber",
      conversion: "green",
      retention: "purple"
    };
    return colorMap[id] || "gray";
  };
  
  // Function to get pre-defined Tailwind classes for tool colors by ID
  // This avoids dynamic class generation issues with Tailwind
  const getToolColorClasses = (id: string) => {
    const color = getColorForTool(id);
    return getToolColorClass(color);
  };
  
  // Function to get pre-defined Tailwind classes for a specific color
  const getToolColorClass = (color: string) => {
    // Map colors to actual Tailwind classes
    const bgColorMap: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
      green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
      emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      gray: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
    };
    
    return bgColorMap[color] || bgColorMap.gray;
  };
  
  // Render the main UI
  return (
    <div className="space-y-8">
      {/* Main Content */}
      {activeTab === "browse" ? (
        <div className="space-y-10">
          {/* AI Content Hub Dashboard */}
          <AnimatePresence mode="wait">
            {!activeCategory ? (
              /* Main Categories View */
              <motion.div 
                key="categories"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
                ref={categoryRef}
              >
                {/* Search Bar */}
                <motion.div variants={itemVariants} className="relative max-w-2xl mx-auto">
                  <Input
                    type="text"
                    placeholder="Search for AI content tools..."
                    className="pl-10 h-12 shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      setIsSearching(query.length > 0);
                      searchContentTypes(query);
                    }}
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-8 w-8 p-0"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearching(false);
                        setSearchResults([]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Search Results Dropdown */}
                  {isSearching && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Search Results</h4>
                        
                        {searchResults.length > 0 ? (
                          <div className="space-y-1">
                            {searchResults.map((tool) => (
                              <div 
                                key={tool.id} 
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                onClick={() => {
                                  setActiveContentType(tool.id);
                                  setActiveTab("create");
                                  setSearchQuery("");
                                  setIsSearching(false);
                                  setSearchResults([]);
                                }}
                              >
                                <div className={`p-2 rounded-md ${getToolColorClasses(tool.id)}`}>
                                  {tool.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{tool.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{tool.category}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Search className="h-6 w-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try searching for a different term</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Featured AI Tools */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Featured AI Tools</h2>
                    <Button variant="link" className="text-primary">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredTools.map((tool) => (
                      <motion.div
                        key={tool.id}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="cursor-pointer"
                        onClick={() => {
                          setActiveCategory(tool.category);
                          setActiveContentType(tool.contentType);
                          setActiveTab("create");
                        }}
                      >
                        <Card className="overflow-hidden h-full border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                          <CardHeader className="p-4">
                            <div className={`p-3 rounded-lg ${getToolColorClass(tool.color || "gray")} inline-block mb-2`}>
                              {tool.icon}
                            </div>
                            <CardTitle className="text-base font-semibold">{tool.name}</CardTitle>
                            <CardDescription className="text-sm">{tool.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-0 pb-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-auto text-primary hover:text-primary/90 hover:bg-transparent"
                            >
                              <span className="text-sm">Use Tool</span>
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Main Categories */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-xl font-semibold">Browse by Category</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="cursor-pointer"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <Card className="overflow-hidden h-full border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {category.icon}
                              </div>
                              <div className="flex items-center text-gray-400 hover:text-primary">
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            </div>
                            <CardTitle>{category.name}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Activity Section */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <ClockIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                          Your recently used AI tools and created content will appear here for quick access
                        </p>
                        <Button>Start Creating</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              /* Content Type (AI Tools) View based on selected category */
              <motion.div 
                key="toolsList"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
                ref={toolsRef}
              >
                {/* Back Navigation */}
                <motion.div variants={itemVariants}>
                  <Button 
                    variant="ghost" 
                    className="pl-0 hover:bg-transparent"
                    onClick={handleBackToCategories}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Categories
                  </Button>
                </motion.div>
                
                {/* Category Title and Description */}
                <motion.div variants={itemVariants}>
                  <h1 className="text-2xl font-semibold mb-1">
                    {categories.find(cat => cat.id === activeCategory)?.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {categories.find(cat => cat.id === activeCategory)?.description}
                  </p>
                </motion.div>
                
                {/* AI Tools Grid */}
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {getContentTypesByCategory().map((tool) => renderToolCard(tool))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Content Creation Tab */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-10 mb-6">
            {contentTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Create Content Tab */}
          <TabsContent value="create" className="m-0">
            {activeContentType ? (
              <div className="space-y-4">
                {/* Tool Information */}
                <Card className="border border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getToolColorClasses(activeContentType)}`}>
                        {getActiveContentDetails()?.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{getActiveContentDetails()?.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getActiveContentDetails()?.description}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab("browse")}
                    >
                      Change Tool
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Personalization Workflow */}
                {showPersonalizationForm && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContentPersonalizationForm
                        contentType={activeContentType}
                        contentName={getActiveContentDetails()?.name || ''}
                        onSubmit={handlePersonalizationFormSubmit}
                        onCancel={() => setShowPersonalizationForm(false)}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Collaborative Workspace */}
                {!showPersonalizationForm && showCollaborativeWorkspace && personalizationData && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-[75vh] mt-4"
                    >
                      <AICollaborativeWorkspace
                        contentType={activeContentType}
                        contentName={getActiveContentDetails()?.name || ''}
                        formData={personalizationData}
                        onBack={() => {
                          setShowPersonalizationForm(true);
                          setShowCollaborativeWorkspace(false);
                        }}
                        onContentGenerated={handleContentGenerated}
                        onSaveDraft={(conversation) => {
                          toast({
                            title: "Draft saved",
                            description: "Your content has been saved successfully",
                            duration: 3000
                          });
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
                
                {/* Legacy AI Team Interface (will show only if not using personalization workflow) */}
                {!showPersonalizationForm && !showCollaborativeWorkspace && (
                  <div className="h-[70vh] mt-4">
                    <AIAgentChat
                      contentType={activeContentType}
                      title={getActiveContentDetails()?.name || "Content"}
                      description={getActiveContentDetails()?.description || "Generate content with AI"}
                      onContentGenerated={handleContentGenerated}
                      onBack={() => setActiveTab("browse")}
                      onSaveDraft={(conversation) => {
                        toast({
                          title: "Draft saved",
                          description: "Your content has been saved successfully",
                          duration: 3000
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select an AI Tool</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Choose a content creation tool from the browsing section to get started
                </p>
                <Button onClick={() => setActiveTab("browse")}>
                  Browse AI Tools
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Recent Content Tab */}
          <TabsContent value="recent" className="m-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recent Conversations</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("create")}
                >
                  Create New Content
                </Button>
              </div>
              <ConversationHistory 
                onSelectConversation={(conversation) => {
                  // Load the selected conversation content
                  if (conversation.messages.length > 0) {
                    const lastAssistantMessage = conversation.messages
                      .filter(m => m.role === 'assistant')
                      .pop();
                    
                    if (lastAssistantMessage) {
                      setGeneratedContent(lastAssistantMessage.content);
                      
                      // Also set the active content type if it's in metadata
                      if (conversation.metadata?.contentType) {
                        // Find the content type in our list
                        const matchingType = contentTypes.find(
                          type => type.id === conversation.metadata?.contentType
                        );
                        
                        if (matchingType) {
                          setActiveCategory(matchingType.category);
                          setActiveContentType(matchingType.id);
                        }
                      }
                      
                      // Switch to the "create" tab to show the content
                      setActiveTab("create");
                    }
                  }
                }}
                limit={10}
              />
            </div>
          </TabsContent>
          
          {/* Saved Content Tab - Content Library Integration */}
          <TabsContent value="saved" className="m-0">
            <QueryClientProvider client={queryClient}>
              <ContentLibrary />
            </QueryClientProvider>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Missing ChevronLeft and X icons
const ChevronLeft = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
};

const X = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
};