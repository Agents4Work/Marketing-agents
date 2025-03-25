import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PersonalizationFormData } from './ContentPersonalizationForm';
import SimpleChat from './SimpleChat';
import { AgentType } from '@/lib/agents';
import { cn } from '@/lib/utils';
import { createConversation, addMessageToConversation, Conversation, Message } from '@/lib/conversation-memory';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Save,
  Send,
  AlertCircle,
  AlertTriangle,
  FileEdit,
  Mail,
  Search,
  Share2,
  User,
  Bot,
  Clock,
  Download,
  PenTool,
  BarChart3,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  RefreshCw,
  RotateCw,
  Loader2
} from 'lucide-react';

// Interface definitions
interface ChatMessage {
  id: string;
  sender: string;
  senderType: string;
  content: string;
  timestamp: Date;
  type: 'in' | 'out' | 'system';
  to?: string;
}

interface AITeamMember {
  id: string;
  name: string;
  type: AgentType | string; // Using flexible type to work with both AgentType enum and string literals
  description: string;
  icon?: React.ReactNode;
}

// Team members for different content types
const AGENT_TEAMS: Record<string, AITeamMember[]> = {
  default: [
    {
      id: 'strategist-1',
      name: 'AI Strategist',
      type: 'copywriting',
      description: 'Content strategy and planning specialist'
    },
    {
      id: 'writer-1',
      name: 'AI Writer',
      type: 'copywriting',
      description: 'Creative content creator'
    }
  ],
  blog: [
    {
      id: 'strategist-blog',
      name: 'Blog Strategist',
      type: 'copywriting',
      description: 'Blog content strategy specialist'
    },
    {
      id: 'seo-specialist',
      name: 'SEO Expert',
      type: 'seo',
      description: 'Search optimization specialist'
    },
    {
      id: 'writer-blog',
      name: 'Content Writer',
      type: 'copywriting',
      description: 'Long-form content creator'
    }
  ],
  social: [
    {
      id: 'social-strategist',
      name: 'Social Media Strategist',
      type: 'social',
      description: 'Social media campaign specialist'
    },
    {
      id: 'creative-specialist',
      name: 'Creative Specialist',
      type: 'creative',
      description: 'Visual content and creativity expert'
    },
    {
      id: 'writer-social',
      name: 'Social Copywriter',
      type: 'copywriting',
      description: 'Engaging short-form content creator'
    }
  ],
  email: [
    {
      id: 'email-strategist',
      name: 'Email Campaign Manager',
      type: 'email',
      description: 'Email marketing specialist'
    },
    {
      id: 'writer-email',
      name: 'Email Copywriter',
      type: 'copywriting',
      description: 'Conversion-focused content creator'
    }
  ],
  ad: [
    {
      id: 'ad-strategist',
      name: 'Ad Campaign Manager',
      type: 'ads',
      description: 'Advertising strategy specialist'
    },
    {
      id: 'copywriter-ads',
      name: 'Ad Copywriter',
      type: 'copywriting',
      description: 'Conversion-focused copywriter'
    },
    {
      id: 'analytics-specialist',
      name: 'Analytics Specialist',
      type: 'analytics',
      description: 'Performance measurement expert'
    }
  ]
};

// Define the interface for the AICollaborativeWorkspace component props
interface AICollaborativeWorkspaceProps {
  contentType: string;
  contentName: string;
  formData: PersonalizationFormData;
  onBack: () => void;
  onSaveDraft?: (conversation: Conversation) => void;
  onContentGenerated?: (content: string) => void;
}

// Agent icons
const agentIcons: Record<AgentType | 'user' | 'system' | string, React.ReactNode> = {
  copywriting: <FileEdit className="h-4 w-4" />,
  ads: <BarChart3 className="h-4 w-4" />,
  creative: <PenTool className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  seo: <Search className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  system: <Bot className="h-4 w-4" />
};

// Agent colors
const agentColors: Record<AgentType | 'user' | 'system' | string, string> = {
  copywriting: 'bg-sky-500 text-sky-50',
  seo: 'bg-amber-500 text-amber-50',
  ads: 'bg-violet-500 text-violet-50',
  creative: 'bg-rose-500 text-rose-50',
  email: 'bg-emerald-500 text-emerald-50',
  analytics: 'bg-blue-500 text-blue-50',
  social: 'bg-pink-500 text-pink-50',
  user: 'bg-gray-700 text-gray-50',
  system: 'bg-gray-400 text-gray-50',
  // Default colors for any other agent types
  content: 'bg-purple-500 text-purple-50',
  strategy: 'bg-indigo-500 text-indigo-50'
};

// Function to convert form data to a structured prompt
function formDataToPrompt(formData: PersonalizationFormData): string {
  // Start building the prompt
  let prompt = `# ${formData.contentType.toUpperCase()} CONTENT BRIEF\n\n`;
  
  // Add primary goal and target audience
  prompt += `## Primary Goal\n${formData.primaryGoal || 'Not specified'}\n\n`;
  prompt += `## Target Audience\n${formData.targetAudience || 'Not specified'}\n\n`;
  
  // Add tone and style
  prompt += `## Tone and Style\n${formData.toneAndStyle || 'Not specified'}\n\n`;
  
  // Add key points if available
  if (formData.keyPoints && formData.keyPoints.length > 0) {
    prompt += '## Key Points\n';
    formData.keyPoints.forEach((point, index) => {
      if (point.trim()) {
        prompt += `${index + 1}. ${point}\n`;
      }
    });
    prompt += '\n';
  }
  
  // Add call to action if available
  if (formData.callToAction) {
    prompt += `## Call to Action\n${formData.callToAction}\n\n`;
  }
  
  // Add content type specific fields
  switch (formData.contentType) {
    case 'social':
      prompt += `## Platform\n${formData.platform || 'Not specified'}\n\n`;
      prompt += `## Post Type\n${formData.postType || 'Not specified'}\n\n`;
      prompt += `## Length\n${formData.postLength || 'Medium'}\n\n`;
      prompt += `## Additional Requirements\n`;
      prompt += `- ${formData.includeHashtags ? 'Include' : 'Exclude'} hashtags\n`;
      prompt += `- ${formData.includeEmojis ? 'Include' : 'Exclude'} emojis\n\n`;
      break;
      
    case 'blog':
      prompt += `## Word Count\nApproximately ${formData.wordCount || 1200} words\n\n`;
      prompt += `## Content Structure\n${formData.contentStructure || 'Not specified'}\n\n`;
      prompt += `## SEO Requirements\n`;
      prompt += `- Target Keyword: ${formData.targetKeyword || 'Not specified'}\n`;
      if (formData.keywords && formData.keywords.length > 0) {
        prompt += `- Secondary Keywords: ${formData.keywords.join(', ')}\n`;
      }
      prompt += `- SEO Optimized: ${formData.seoOptimized ? 'Yes' : 'No'}\n`;
      prompt += `- Include Subheadings: ${formData.includeSubheadings ? 'Yes' : 'No'}\n`;
      prompt += `- Include FAQ Section: ${formData.includeFAQs ? 'Yes' : 'No'}\n\n`;
      prompt += `## Reading Level\n${formData.readingLevel || 'Intermediate'}\n\n`;
      break;
      
    case 'email':
      prompt += `## Email Type\n${formData.emailType || 'Not specified'}\n\n`;
      prompt += `## Subject Line\n${formData.subjectLine || 'Not specified'}\n\n`;
      prompt += `## Personalization Level\n${formData.personalizationLevel || 'Medium'}\n\n`;
      prompt += `## Urgency Level\n${formData.urgencyLevel || 'Medium'}\n\n`;
      prompt += `## Design Elements\n`;
      prompt += `- Include CTA Buttons: ${formData.includeButtons ? 'Yes' : 'No'}\n\n`;
      break;
      
    case 'ad':
      prompt += `## Ad Platform\n${formData.adPlatform || 'Not specified'}\n\n`;
      prompt += `## Ad Type\n${formData.adType || 'Not specified'}\n\n`;
      if (formData.headlines && formData.headlines.length > 0) {
        prompt += `## Headline Themes\n`;
        formData.headlines.forEach((headline: string, index: number) => {
          if (headline.trim()) {
            prompt += `${index + 1}. ${headline}\n`;
          }
        });
        prompt += '\n';
      }
      prompt += `## Primary Benefit\n${formData.primaryBenefit || 'Not specified'}\n\n`;
      prompt += `## Character Limit\n${formData.characterLimit || 'Not specified'}\n\n`;
      prompt += `## Additional Requirements\n`;
      prompt += `- Include Pricing: ${formData.includePrice ? 'Yes' : 'No'}\n`;
      prompt += `- Include Promo Code: ${formData.includePromoCode ? 'Yes' : 'No'}\n\n`;
      break;
  }
  
  // Add brand guidelines if available
  if (formData.brandGuidelines) {
    prompt += `## Brand Guidelines\n${formData.brandGuidelines}\n\n`;
  }
  
  // Add any additional notes
  if (formData.additionalNotes) {
    prompt += `## Additional Notes\n${formData.additionalNotes}\n\n`;
  }
  
  // Add references if available
  if (formData.references && formData.references.length > 0) {
    prompt += '## References\n';
    formData.references.forEach((ref, index) => {
      if (ref.trim()) {
        prompt += `${index + 1}. ${ref}\n`;
      }
    });
    prompt += '\n';
  }
  
  // Add competitors if available
  if (formData.competitors && formData.competitors.length > 0) {
    prompt += '## Competitors\n';
    formData.competitors.forEach((competitor, index) => {
      if (competitor.trim()) {
        prompt += `${index + 1}. ${competitor}\n`;
      }
    });
    prompt += '\n';
  }
  
  return prompt;
}

// Helper function to get specialist responses based on the content type
function getSpecialistResponse(specialistType: string, prompt: string, contentType: string): string {
  const responses: Record<string, string> = {
    seo: `I've analyzed the SEO requirements for this ${contentType}. I'll make sure we optimize for the target keywords and search intent while maintaining readability. I'll suggest appropriate heading structures and semantic markup to boost visibility.`,
    social: `I've analyzed the social media requirements. For this ${contentType} we'll optimize the content for engagement metrics like shares and comments, while maintaining the right tone for the platform selected.`,
    email: `I've analyzed the email marketing parameters. We'll create a compelling subject line and optimize the email structure for high open and click-through rates. I'll ensure the personalization level matches requirements.`,
    ads: `I've analyzed the advertising requirements. For this ${contentType} ad campaign, I'll ensure we craft compelling headlines and maintain appropriate character limits for the platform. The primary benefit will be clearly highlighted.`,
    analytics: `I've set up tracking parameters to measure the performance of this ${contentType}. We'll be able to analyze engagement, conversion, and ROI metrics after deployment.`
  };
  
  return responses[specialistType] || `I've analyzed the requirements for this ${contentType} and will provide specialized insights to optimize our content strategy.`;
}

// Main component
const AICollaborativeWorkspace: React.FC<AICollaborativeWorkspaceProps> = ({
  contentType,
  contentName,
  formData,
  onBack,
  onSaveDraft,
  onContentGenerated
}) => {
  // Get the appropriate team for the content type
  const teamMembers = AGENT_TEAMS[contentType] || AGENT_TEAMS.default;
  
  // State for messages, conversation, and UI state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [finalContent, setFinalContent] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50); // Default 50/50 split
  const [isMaximized, setIsMaximized] = useState<'agents' | 'document' | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat"); // Tab can be "chat" or "document"
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contentStatus, setContentStatus] = useState<'waiting' | 'generating' | 'complete' | 'error'>('waiting');
  
  // Convert form data to a structured prompt
  const initialPrompt = formDataToPrompt(formData);
  
  // References for scrolling
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  
  // Initialize the workspace with system message
  useEffect(() => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      sender: 'System',
      senderType: 'system',
      content: `Welcome to your AI Content Team workspace! Your specialized team is collaborating to create your ${contentName.toLowerCase()} based on your specifications. You can interact with the team at any time.`,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages([systemMessage]);
    
    // Begin content generation process with the form data
    setTimeout(() => {
      handleAgentGeneration(initialPrompt);
    }, 500);
    
    // Create a new conversation in Firebase
    const initializeConversation = async () => {
      try {
        const newConversation = await createConversation({
          title: `${contentName} - ${new Date().toLocaleDateString()}`,
          initialMessage: systemMessage.content,
          metadata: {
            contentType: contentType,
            tags: [contentType, 'ai-team']
          }
        });
        
        setConversation(newConversation);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        // Continue anyway, just without persistence
      }
    };
    
    initializeConversation();
  }, [contentType, contentName, initialPrompt]);
  
  // Auto-scroll chat to bottom whenever messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [messages]);
  
  // Also scroll when processing state changes to show typing indicator
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [isProcessing]);
  
  // Initialize edited content when final content changes
  useEffect(() => {
    if (finalContent && finalContent.trim().length > 0) {
      console.log("[Document Panel] Updating editedContent with finalContent:", finalContent.substring(0, 50) + "...");
      
      // Validate that finalContent is a proper string
      if (typeof finalContent !== 'string') {
        console.error("[Document Panel] finalContent is not a string:", typeof finalContent);
        return;
      }
      
      // Set the edited content (for display in the document panel)
      setEditedContent(finalContent);
      
      // Back up the content to localStorage for persistence
      try {
        localStorage.setItem('finalContent', finalContent);
        localStorage.setItem('finalContentTimestamp', new Date().toISOString());
        console.log("[Document Panel] Content successfully backed up to localStorage");
      } catch (err) {
        console.error("[Document Panel] Error saving to localStorage:", err);
      }
      
      // Only update status if it's not already complete (prevent unnecessary re-renders)
      if (contentStatus !== 'complete') {
        console.log("[Document Panel] Updating content status to complete");
        setContentStatus('complete');
      }
      
      // Force tab change to document panel
      setTimeout(() => {
        console.log("[Document Panel] Forcing tab change to document");
        setActiveTab("document");
      }, 500);
      
      // Notify parent component about the generated content
      if (onContentGenerated) {
        console.log("[Document Panel] Notifying parent component about content");
        onContentGenerated(finalContent);
      }
    } else if (finalContent === '') {
      // Don't do anything for empty string (this is an intentional reset)
      console.log("[Document Panel] Received empty finalContent - this is likely an intentional reset");
    } else {
      console.log("[Document Panel] finalContent is invalid:", finalContent);
    }
  }, [finalContent, contentStatus, onContentGenerated]);
  
  // Effect to monitor document tab activation and restore from backup if needed
  useEffect(() => {
    if (activeTab === "document") {
      console.log("[Document Tab] Tab is now active, checking content status");
      
      // Verificar si hay contenido en localStorage pero no en el estado
      const backupContent = localStorage.getItem('finalContent');
      if (!finalContent && backupContent) {
        console.log("[Document Tab] Detected content in localStorage but not in state - restoring from backup");
        setFinalContent(backupContent);
        setEditedContent(backupContent);
        setContentStatus('complete');
      }
    }
  }, [activeTab]);
  
  // Timeout check to ensure content appears properly
  useEffect(() => {
    if (contentStatus === 'generating') {
      // Set a timeout to check if content has been generated
      const timeoutId = setTimeout(() => {
        if (contentStatus === 'generating') {
          console.log("[Content Generation] Checking generation status");
          
          // If we have finalContent but somehow status is still 'generating', update it
          if (finalContent && finalContent.trim().length > 0) {
            console.log("[Content Generation] Found valid finalContent but status was still 'generating'");
            setContentStatus('complete');
            return;
          }
          
          // If no finalContent available, try to recover from backup
          console.log("[Content Generation] No finalContent - checking backup");
          const backupContent = localStorage.getItem('finalContent');
          
          if (backupContent && backupContent.trim().length > 0) {
            console.log("[Content Generation] Found valid backup content");
            setFinalContent(backupContent);
            setEditedContent(backupContent);
            setContentStatus('complete');
            toast({
              title: "Content restored",
              description: "Content was recovered from backup storage.",
              variant: "default"
            });
          } else {
            console.log("[Content Generation] No valid content found - marking as error");
            setContentStatus('error');
            setErrorMessage("Content generation timed out. Please try again.");
          }
        }
      }, 30000); // 30 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [contentStatus, finalContent]);
  
  // Function to handle agent-based content generation
  const handleAgentGeneration = async (prompt: string) => {
    setIsProcessing(true);
    setContentStatus('generating');
    
    // Strategist agent analyzes the request first
    const strategist = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('strategist'));
    
    setTimeout(async () => {
      if (strategist) {
        const message: ChatMessage = {
          id: `strategy-${Date.now()}`,
          sender: strategist.name,
          senderType: strategist.type,
          content: `I'm analyzing the content brief for this ${contentName}. Let me outline a strategic approach based on the requirements.`,
          timestamp: new Date(),
          type: 'in',
          to: 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase
        if (conversation?.id) {
          try {
            await addMessageToConversation(conversation.id, {
              role: 'assistant',
              content: message.content,
              metadata: { agent: strategist.type, name: strategist.name }
            });
          } catch (err) {
            console.error('Failed to save message:', err);
          }
        }
      }
    }, 1500);
    
    // Find the specialist based on content type
    const getSpecialistByContentType = (): AITeamMember | undefined => {
      switch (contentType) {
        case 'social':
          return teamMembers.find(member => member.type === 'social');
        case 'blog':
          return teamMembers.find(member => member.type === 'seo');
        case 'email':
          return teamMembers.find(member => member.type === 'email');
        case 'ad':
          return teamMembers.find(member => member.type === 'ads');
        default:
          return teamMembers.find(member => 
            member.type !== 'copywriting' || (!member.id.includes('strategist') && !member.id.includes('writer'))
          );
      }
    };
    
    const specialist = getSpecialistByContentType();
    
    // Specialist provides insights
    setTimeout(async () => {
      if (specialist) {
        const specialistResponse = getSpecialistResponse(specialist.type, prompt, contentType);
        
        const message: ChatMessage = {
          id: `specialist-${Date.now()}`,
          sender: specialist.name,
          senderType: specialist.type,
          content: specialistResponse,
          timestamp: new Date(),
          type: 'in',
          to: strategist ? strategist.name : 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase
        if (conversation?.id) {
          try {
            await addMessageToConversation(conversation.id, {
              role: 'assistant',
              content: message.content,
              metadata: { agent: specialist.type, name: specialist.name }
            });
          } catch (err) {
            console.error('Failed to save message:', err);
          }
        }
      }
    }, 4000);
    
    // Writer creates content based on inputs
    const writer = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('writer'));
    
    setTimeout(async () => {
      if (writer) {
        const message: ChatMessage = {
          id: `writer-${Date.now()}`,
          sender: writer.name,
          senderType: writer.type,
          content: `Based on the strategy and insights, I'll now craft compelling ${contentName} content. I'll incorporate all the requirements from the brief and optimize for the target audience and desired outcomes.`,
          timestamp: new Date(),
          type: 'in',
          to: specialist ? specialist.name : 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase
        if (conversation?.id) {
          try {
            await addMessageToConversation(conversation.id, {
              role: 'assistant',
              content: message.content,
              metadata: { agent: writer.type, name: writer.name }
            });
          } catch (err) {
            console.error('Failed to save message:', err);
          }
        }
      }
    }, 6000);
    
    // Generate the actual content using the proper AI API
    setTimeout(async () => {
      try {
        console.log("Starting content generation with prompt:", prompt.substring(0, 100) + "...");
        console.log("Content type:", contentType);
        
        // Import the openai/generateContent function
        const { generateContent } = await import('@/lib/openai');
        
        console.log("Function imported successfully, making API call...");
        
        try {
          // Set status to generating before making API call
          setContentStatus('generating');
          
          // Call the real API with the prompt from form data
          const response = await generateContent(prompt, contentType);
          
          // Log entire response structure for debugging
          console.log("API Response structure:", JSON.stringify(response, null, 2));
          
          // Extract the content from the response object with validation
          if (!response || typeof response !== 'object') {
            throw new Error("Invalid response format: Response is not an object");
          }
          
          const generatedContent = response.content;
          
          // Validate the generated content with improved error handling
          if (!generatedContent) {
            console.error("No content returned from API");
            throw new Error(`No content returned from API`);
          }
          
          if (typeof generatedContent !== 'string') {
            console.error(`Invalid content format: ${typeof generatedContent}`);
            throw new Error(`Invalid content format: ${typeof generatedContent}`);
          }
          
          if (generatedContent.trim().length < 10) {
            console.error("Content too short, likely an error response");
            throw new Error(`Generated content too short (${generatedContent.length} chars)`);
          }
          
          if (response.error) {
            console.warn("Content generation warning:", response.error);
            // Continue anyway since we have valid content despite the warning
          }
          
          console.log("Generated content received:", generatedContent.substring(0, 100) + "...");
          console.log("Content length:", generatedContent.length);
          
          // Save to localStorage as backup with timestamp
          localStorage.setItem('finalContent', generatedContent);
          localStorage.setItem('finalContentTimestamp', new Date().toISOString());
          
          if (writer) {
            const message: ChatMessage = {
              id: `content-${Date.now()}`,
              sender: writer.name,
              senderType: writer.type,
              content: "I've completed the initial draft of your content. You can review it in the document tab, make any edits, and then download or save it to your content library.",
              timestamp: new Date(),
              type: 'in',
              to: 'You'
            };
            
            setMessages(prev => [...prev, message]);
            
            // Save to Firebase
            if (conversation?.id) {
              try {
                await addMessageToConversation(conversation.id, {
                  role: 'assistant',
                  content: message.content,
                  metadata: { agent: writer.type, name: writer.name }
                });
              } catch (err) {
                console.error('Failed to save message:', err);
              }
            }
          }
          
          // Update states in the right order with improved validation and synchronization
          console.log("[Content Generation] Setting finalContent with validated content:", 
                     generatedContent.substring(0, 100) + "...");
                     
          // First update the final content state
          setFinalContent(generatedContent);
          
          // Then update edited content state directly, don't wait for useEffect
          setEditedContent(generatedContent);
          
          setTimeout(() => {
            // Verify content was properly set before marking as complete
            const contentCheck = localStorage.getItem('finalContent');
            if (contentCheck && contentCheck.length > 0) {
              console.log("[Content Generation] Content verified in localStorage, marking as complete");
              setContentStatus('complete');
              
              // Force a tab change to document
              setActiveTab("document");
            } else {
              console.log("[Content Generation] Content not verified in localStorage, retrying");
              // Try to set it again to be safe
              localStorage.setItem('finalContent', generatedContent);
              setContentStatus('complete');
              setActiveTab("document");
            }
          }, 500);
          
          // Callback to parent if provided
          if (onContentGenerated) {
            onContentGenerated(generatedContent);
          }
        } catch (error) {
          console.error("Error generating content:", error);
          
          // Provide more detailed error message based on the error type
          const errorMessageText = error instanceof Error
            ? `Error: ${error.message}`
            : "Failed to generate content. Please try again.";
            
          console.log("Setting error message:", errorMessageText);
          setErrorMessage(errorMessageText);
          setContentStatus('error');
          
          // Add error message to chat
          const errorChatMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: 'System',
            senderType: 'system',
            content: `There was an error generating the content. Please try a different approach or adjust your requirements.`,
            timestamp: new Date(),
            type: 'system'
          };
          
          setMessages(prev => [...prev, errorChatMsg]);
        }
      } catch (error) {
        console.error("Error importing generateContent:", error);
        setErrorMessage("Failed to load content generation module. Please refresh the page and try again.");
        setContentStatus('error');
      } finally {
        setIsProcessing(false);
      }
    }, 8000);
  };
  
  // Function to handle user input submission
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'You',
      senderType: 'user',
      content: userInput,
      timestamp: new Date(),
      type: 'out'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    // Save to Firebase
    if (conversation?.id) {
      try {
        await addMessageToConversation(conversation.id, {
          role: 'user',
          content: userInput
        });
      } catch (err) {
        console.error('Failed to save message:', err);
      }
    }
    
    // Find active agent to respond
    const getRespondingAgent = (): AITeamMember => {
      // Default to the first copywriter
      const writer = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('writer'));
      if (writer) return writer;
      
      // Fallback to strategist
      const strategist = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('strategist'));
      if (strategist) return strategist;
      
      // Last resort, just use the first team member
      return teamMembers[0];
    };
    
    const respondingAgent = getRespondingAgent();
    
    // Import the AI chat generation function
    try {
      const { generateContent } = await import('@/lib/openai');
      
      // Prepare conversation history for AI context
      const historyText = messages.map(msg => 
        `${msg.sender}: ${msg.content}`
      ).join('\n\n');
      
      // Create a prompt that includes conversation history and context about the responding agent
      const chatPrompt = `
You are ${respondingAgent.name}, a ${respondingAgent.description} specialized in ${respondingAgent.type} content.

CONVERSATION HISTORY:
${historyText}

USER QUERY:
${userInput}

Please respond to the user's query in a helpful and professional manner, drawing on your expertise in ${respondingAgent.type}.
`;
      
      // Generate AI response
      setTimeout(async () => {
        try {
          // Use the standard content generation function with our chat prompt
          const response = await generateContent(chatPrompt, 'conversation');
          
          // Log the entire response structure for debugging
          console.log("Chat API Response:", JSON.stringify(response, null, 2));
          
          // Validate response structure
          if (!response || typeof response !== 'object') {
            throw new Error("Invalid chat response format: Response is not an object");
          }
          
          // Extract the content from the response object with validation
          const aiResponseContent = response.content;
          
          // Validate response content
          if (!aiResponseContent || typeof aiResponseContent !== 'string') {
            throw new Error(`Invalid chat content format: ${typeof aiResponseContent}`);
          }
          
          if (response.error) {
            console.warn("Chat response warning:", response.error);
            // Continue processing as long as we have valid content
          }
          
          console.log("Chat content received, length:", aiResponseContent.length);
          
          const agentMessage: ChatMessage = {
            id: `response-${Date.now()}`,
            sender: respondingAgent.name,
            senderType: respondingAgent.type,
            content: aiResponseContent,
            timestamp: new Date(),
            type: 'in',
            to: 'You'
          };
          
          setMessages(prev => [...prev, agentMessage]);
          
          // Save to Firebase
          if (conversation?.id) {
            try {
              await addMessageToConversation(conversation.id, {
                role: 'assistant',
                content: aiResponseContent,
                metadata: { agent: respondingAgent.type, name: respondingAgent.name }
              });
            } catch (err) {
              console.error('Failed to save message:', err);
            }
          }
        } catch (error) {
          console.error("Error generating chat response:", error);
          
          // Add error message to chat
          const chatErrorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: 'System',
            senderType: 'system',
            content: `Sorry, there was an error generating a response. Please try again.`,
            timestamp: new Date(),
            type: 'system'
          };
          
          setMessages(prev => [...prev, chatErrorMsg]);
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Error importing content generation module:", error);
      setIsProcessing(false);
      
      // Add error message to chat
      const moduleErrorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'System',
        senderType: 'system',
        content: `Sorry, there was an error connecting to the AI service. Please try again later.`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, moduleErrorMsg]);
    }
  };
  
  // Function to handle content saving/publishing
  const handleSaveContent = async () => {
    setIsSaving(true);
    
    try {
      // If we have a finalized content
      if (isEditing) {
        // Use the edited content
        const contentToSave = editedContent;
        
        // Save to localStorage backup
        localStorage.setItem('finalContent', contentToSave);
        
        // Update the final content
        setFinalContent(contentToSave);
        
        // Turn off editing mode
        setIsEditing(false);
        
        // Notify the parent component
        if (onContentGenerated) {
          onContentGenerated(contentToSave);
        }
        
        toast({
          title: "Content updated",
          description: "Your edited content has been saved.",
          variant: "default"
        });
      } else if (finalContent) {
        // If not editing, but have final content, just trigger the parent callback
        if (onSaveDraft && conversation) {
          await onSaveDraft(conversation);
        }
        
        toast({
          title: "Content saved",
          description: "Your content has been saved to your content library.",
          variant: "default"
        });
      } else {
        toast({
          title: "No content to save",
          description: "Please generate content first or wait for the current generation to complete.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error saving content",
        description: "There was an error saving your content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to copy content to clipboard
  const handleCopyContent = () => {
    const contentToCopy = isEditing ? editedContent : finalContent;
    
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy).then(
        () => {
          toast({
            title: "Content copied",
            description: "Your content has been copied to the clipboard.",
            variant: "default"
          });
        },
        (err) => {
          console.error("Error copying content:", err);
          toast({
            title: "Error copying content",
            description: "There was an error copying your content. Please try manually selecting and copying.",
            variant: "destructive"
          });
        }
      );
    }
  };
  
  // Function to download content as text file
  const handleDownloadContent = () => {
    const contentToDownload = isEditing ? editedContent : finalContent;
    
    if (contentToDownload) {
      const element = document.createElement("a");
      const file = new Blob([contentToDownload], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${contentName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  // Function to toggle editing mode
  const handleToggleEditing = () => {
    if (isEditing) {
      // Turn off editing mode
      setIsEditing(false);
    } else {
      // Turn on editing mode if we have content
      if (finalContent) {
        setIsEditing(true);
      } else {
        toast({
          title: "No content to edit",
          description: "Please generate content first or wait for the current generation to complete.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Function to handle the edit changes
  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };
  
  // Function to refresh/regenerate content
  const handleRegenerateContent = async () => {
    // Reset states
    setFinalContent('');
    setEditedContent('');
    setIsEditing(false);
    setContentStatus('waiting');
    setErrorMessage(null);
    
    // Add system message about regeneration
    const systemMessage: ChatMessage = {
      id: `system-regen-${Date.now()}`,
      sender: 'System',
      senderType: 'system',
      content: `Regenerating content based on the original brief...`,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Start generation process
    handleAgentGeneration(initialPrompt);
  };
  
  // Function to handle maximizing a panel
  const handleMaximize = (panel: 'agents' | 'document') => {
    if (isMaximized === panel) {
      setIsMaximized(null);
    } else {
      setIsMaximized(panel);
    }
  };
  
  // Function to format the message time
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render the component
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">{contentName}</h2>
          <Badge variant="outline" className="ml-2">{contentType}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveContent}
            disabled={isSaving || (contentStatus !== 'complete' && !isEditing)}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyContent}
            disabled={contentStatus !== 'complete' && !isEditing}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadContent}
            disabled={contentStatus !== 'complete' && !isEditing}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Main content area with split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Show the AI agents panel only if not maximizing document */}
        {isMaximized !== 'document' && (
          <div 
            className={cn(
              "flex flex-col border-r transition-all duration-300",
              isMaximized === 'agents' ? "w-full" : `w-[${splitRatio}%]`
            )}
            style={{ width: isMaximized === 'agents' ? '100%' : `${splitRatio}%` }}
          >
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-semibold">AI Content Team</h3>
              <Button variant="ghost" size="icon" onClick={() => handleMaximize('agents')}>
                {isMaximized === 'agents' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Mobile selector for tabs */}
            <div className="md:hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="document">Document</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-4" ref={chatScrollRef}>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "mb-3",
                    message.type === 'out' ? "mr-8 ml-16" : "ml-8 mr-16",
                    message.type === 'system' ? "mx-8" : ""
                  )}
                >
                  {message.type === 'system' ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 text-sm">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-500">System</span>
                      </div>
                      <div className="mt-1">{message.content}</div>
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "rounded-md p-3 relative",
                        message.type === 'out' 
                          ? "bg-primary text-primary-foreground ml-auto" 
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center">
                        {message.type === 'in' && (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className={agentColors[message.senderType]}>
                                {agentIcons[message.senderType] || <User className="h-4 w-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{message.sender}</span>
                            {message.to && (
                              <span className="text-xs text-gray-500 ml-2">
                                to {message.to}
                              </span>
                            )}
                          </div>
                        )}
                        {message.type === 'out' && (
                          <span className="font-medium text-sm">You</span>
                        )}
                        <span className="text-xs ml-2 opacity-70">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mx-8 mb-3">
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="border-t p-3">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || !userInput.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Show the document panel only if not maximizing agents */}
        {isMaximized !== 'agents' && (
          <div 
            className={cn(
              "flex flex-col transition-all duration-300",
              isMaximized === 'document' ? "w-full" : `w-[${100 - splitRatio}%]`
            )}
            style={{ width: isMaximized === 'document' ? '100%' : `${100 - splitRatio}%` }}
          >
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-semibold">{contentName} - Document</h3>
              <div className="flex items-center space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleEditing}
                        disabled={contentStatus !== 'complete'}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isEditing ? 'Exit Edit Mode' : 'Edit Content'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRegenerateContent}
                        disabled={isProcessing || contentStatus === 'generating'}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Regenerate Content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button variant="ghost" size="icon" onClick={() => handleMaximize('document')}>
                  {isMaximized === 'document' ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Document content */}
            <div className="flex-1 overflow-y-auto p-4">
              {contentStatus === 'waiting' && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Preparing Document</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Your AI content team is about to generate content based on your requirements.
                  </p>
                </div>
              )}
              
              {contentStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                  <h3 className="text-lg font-medium mb-2">Generating Content</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Your AI content team is crafting your {contentType} content. This may take a few moments...
                  </p>
                </div>
              )}
              
              {contentStatus === 'error' && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-medium mb-2">Generation Error</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    {errorMessage || "There was an error generating your content. Please try again."}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleRegenerateContent}
                  >
                    <RotateCw className="h-3.5 w-3.5 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
              
              {contentStatus === 'complete' && (
                <>
                  {/* Debug information banner */}
                  <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                    <CardContent className="p-3">
                      <details className="text-xs">
                        <summary className="font-semibold cursor-pointer">Debug Info</summary>
                        <div className="mt-2 space-y-1">
                          <div><span className="font-semibold">Content Status:</span> {contentStatus}</div>
                          <div><span className="font-semibold">Content Length:</span> {finalContent ? finalContent.length : 0} characters</div>
                          <div><span className="font-semibold">Content Type:</span> {contentType}</div>
                          <div><span className="font-semibold">Is Editing:</span> {isEditing ? 'Yes' : 'No'}</div>
                          <div><span className="font-semibold">Has Error:</span> {errorMessage ? 'Yes' : 'No'}</div>
                          {errorMessage && <div><span className="font-semibold">Error:</span> {errorMessage}</div>}
                          <div><span className="font-semibold">Content First 100 Chars:</span> {finalContent ? finalContent.substring(0, 100) + '...' : 'N/A'}</div>
                          <div><span className="font-semibold">Content Update Time:</span> {localStorage.getItem('finalContentTimestamp') || 'N/A'}</div>
                        </div>
                      </details>
                    </CardContent>
                  </Card>

                  {isEditing ? (
                    <Textarea
                      value={editedContent}
                      onChange={handleEditChange}
                      className="w-full h-full min-h-[400px] font-mono text-sm"
                    />
                  ) : (
                    <Card className="w-full">
                      <CardContent className="p-6">
                        {/* Show warning for empty content */}
                        {(!finalContent || finalContent.trim().length === 0) && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                            <AlertTriangle className="h-4 w-4 inline mr-2" />
                            No content was generated. Please try again or check for errors.
                          </div>
                        )}
                        
                        {/* Actual content with whitespace preservation */}
                        <div className="whitespace-pre-wrap">
                          {finalContent || 'Content unavailable'}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
            
            {/* Document footer */}
            {contentStatus === 'complete' && (
              <div className="border-t p-3 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  {isEditing ? (
                    <span className="flex items-center">
                      <FileEdit className="h-4 w-4 mr-1" />
                      Editing Mode
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      Content Ready
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditedContent(finalContent);
                          toast({
                            title: "Changes discarded",
                            description: "Your content has been reverted to the original.",
                            variant: "default"
                          });
                        }}
                      >
                        Discard Changes
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          setFinalContent(editedContent);
                          localStorage.setItem('finalContent', editedContent);
                          setIsEditing(false);
                          toast({
                            title: "Changes saved",
                            description: "Your edited content has been saved.",
                            variant: "default"
                          });
                          
                          // Notify parent component
                          if (onContentGenerated) {
                            onContentGenerated(editedContent);
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICollaborativeWorkspace;