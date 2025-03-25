import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Copy, 
  Edit2, 
  RefreshCw, 
  MessageSquare, 
  Search, 
  Sparkles, 
  ArrowDown, 
  ArrowUp, 
  PencilLine,
  Clock,
  Loader2,
  LightbulbIcon 
} from "lucide-react";
import { generateContent } from "@/lib/openai";

// Content improvement options
const contentImprovements = [
  { id: "simplify", label: "Simplify for broader audience", icon: <MessageSquare size={16} /> },
  { id: "seo", label: "Increase SEO ranking", icon: <Search size={16} /> },
  { id: "engaging", label: "Make it more engaging", icon: <Sparkles size={16} /> },
  { id: "shorten", label: "Make it shorter", icon: <ArrowDown size={16} /> },
  { id: "expand", label: "Make it longer", icon: <ArrowUp size={16} /> },
  { id: "professional", label: "More professional tone", icon: <PencilLine size={16} /> }
];

interface ContentViewerProps {
  contentType: string;
  content: string;
  onRegenerateClick: () => void;
  onContentUpdate: (newContent: string) => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({
  contentType,
  content,
  onRegenerateClick,
  onContentUpdate
}) => {
  const [activeTab, setActiveTab] = useState<string>("content");
  const [improving, setImproving] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>("Improving your content...");
  
  // Copy content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  
  // Handle content improvements
  const handleImproveContent = async (improvementType: string) => {
    if (!content) return;
    
    setImproving(true);
    setGenerationProgress(10);
    
    try {
      let improvementPrompt = "";
      
      switch (improvementType) {
        case "simplify":
          improvementPrompt = `The following content needs to be simplified for a broader audience. Make it more accessible while maintaining the key points:\n\n${content}`;
          break;
        case "seo":
          improvementPrompt = `Optimize the following content for search engines. Add appropriate keywords, headings, and structure for better SEO performance:\n\n${content}`;
          break;
        case "engaging":
          improvementPrompt = `Make the following content more engaging and interesting. Add more personality, questions, and engaging elements:\n\n${content}`;
          break;
        case "shorten":
          improvementPrompt = `Shorten the following content while preserving the key points and message:\n\n${content}`;
          break;
        case "expand":
          improvementPrompt = `Expand and elaborate on the following content. Add more details, examples, and depth:\n\n${content}`;
          break;
        case "professional":
          improvementPrompt = `Rewrite the following content to have a more professional and authoritative tone:\n\n${content}`;
          break;
        default:
          improvementPrompt = `Improve the following content:\n\n${content}`;
      }
      
      // Simulate progress during the call
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => (prev < 90 ? prev + 10 : prev));
        
        const messages = [
          "Analyzing content structure...",
          "Applying improvements...",
          "Enhancing readability...",
          "Finalizing content..."
        ];
        setLoadingMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 800);
      
      const response = await generateContent(improvementPrompt);
      clearInterval(progressInterval);
      
      if (response) {
        onContentUpdate(response);
        setActiveTab("content"); // Switch back to content tab after improvement
      }
      
    } catch (err) {
      console.error("Error improving content:", err);
    } finally {
      setImproving(false);
      setGenerationProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setGenerationProgress(0);
      }, 500);
    }
  };
  
  // Get content type display name
  const getContentTypeName = () => {
    switch (contentType) {
      case "blog": return "blog post";
      case "social": return "social media post";
      case "email": return "email content";
      case "ad": return "ad copy";
      case "seo": return "SEO content";
      case "video": return "video script";
      default: return "content";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Your AI-generated {getContentTypeName()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Just now</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <div className="border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-0 bg-transparent p-0">
              <TabsTrigger 
                value="content" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Content
              </TabsTrigger>
              <TabsTrigger 
                value="improve" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
              >
                Improve
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent className="p-5">
          <TabsContent value="content" className="mt-0 p-0">
            <div className="whitespace-pre-wrap text-base leading-relaxed bg-gray-50 dark:bg-gray-800 p-6 rounded-md max-h-[500px] overflow-y-auto border">
              {content}
            </div>
          </TabsContent>
          
          <TabsContent value="improve" className="mt-0 p-0 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <LightbulbIcon className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Improvement Options</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Select an option to refine your content</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {contentImprovements.map((improvement) => (
                <motion.div
                  key={improvement.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => handleImproveContent(improvement.id)}
                    disabled={improving}
                  >
                    {improvement.icon}
                    {improvement.label}
                    {improving && (
                      <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {improving && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{loadingMessage}</span>
                  <span className="text-sm text-gray-500">{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t py-3 px-5">
          <Button variant="outline" className="gap-2" onClick={onRegenerateClick}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button className="gap-2" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Add missing Badge component
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  [key: string]: any;
}

const Badge = ({ children, variant = "default", className = "", ...props }: BadgeProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case "outline":
        return "bg-transparent border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-300";
      case "secondary":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-primary text-primary-foreground";
    }
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getVariantClass()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default ContentViewer;