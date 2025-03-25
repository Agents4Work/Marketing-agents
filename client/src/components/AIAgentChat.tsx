import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle,
  Clock,
  ArrowLeft,
  ArrowLeftRight,
  Brain,
  FileEdit,
  Mail,
  Search,
  Share2,
  User,
  Bot,
  Save,
  Copy,
  PenTool,
  BarChart3,
  Send
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AgentType } from '@/lib/agents';
import { cn } from '@/lib/utils';
import { createConversation, addMessageToConversation, saveMessageWithRetry, Conversation, Message } from '@/lib/conversation-memory';
import { useToast } from '@/hooks/use-toast';

// Message type definitions
type MessageRole = 'user' | 'assistant' | 'system' | 'agent';
type MessageStatus = 'sending' | 'sent' | 'read' | 'error';

// Chat message interface
interface ChatMessage {
  id: string;
  sender: string;
  senderType: AgentType | 'user' | 'system';
  content: string;
  timestamp: Date;
  type: 'in' | 'out' | 'system' | 'user';
  status?: MessageStatus;
  to?: string;
}

// Custom AI team member definition
interface AITeamMember {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  avatar?: string;
  expertise: string[];
  role: string;
}

// Agent team configurations by content type
const AGENT_TEAMS: Record<string, AITeamMember[]> = {
  blog: [
    {
      id: 'content-strategist',
      name: 'Alex',
      type: 'copywriting',
      description: 'Content Strategy Expert',
      role: 'Lead Strategist',
      expertise: ['Topic research', 'Content planning', 'Target audience analysis']
    },
    {
      id: 'seo-specialist',
      name: 'Taylor',
      type: 'seo',
      description: 'SEO Optimization Expert',
      role: 'SEO Specialist',
      expertise: ['Keyword research', 'SEO best practices', 'Traffic analysis']
    },
    {
      id: 'content-writer',
      name: 'Jordan',
      type: 'copywriting',
      description: 'Professional Content Writer',
      role: 'Lead Writer',
      expertise: ['Blog writing', 'Storytelling', 'Research synthesis']
    }
  ],
  
  social: [
    {
      id: 'social-strategist',
      name: 'Riley',
      type: 'social',
      description: 'Social Media Strategist',
      role: 'Social Media Lead',
      expertise: ['Platform optimization', 'Engagement strategies', 'Content calendars']
    },
    {
      id: 'creative-specialist',
      name: 'Avery',
      type: 'creative',
      description: 'Creative Content Specialist',
      role: 'Creative Director',
      expertise: ['Visual storytelling', 'Trend analysis', 'Content formats']
    },
    {
      id: 'copywriter',
      name: 'Morgan',
      type: 'copywriting',
      description: 'Social Media Copywriter',
      role: 'Content Writer',
      expertise: ['Microcopy', 'Hashtag strategy', 'Brand voice']
    }
  ],
  
  email: [
    {
      id: 'email-strategist',
      name: 'Sam',
      type: 'email',
      description: 'Email Marketing Specialist',
      role: 'Email Campaign Manager',
      expertise: ['Email sequences', 'Segmentation', 'Deliverability']
    },
    {
      id: 'copywriter',
      name: 'Casey',
      type: 'copywriting',
      description: 'Email Copywriter',
      role: 'Conversion Writer',
      expertise: ['Subject lines', 'Call-to-actions', 'Personalization']
    },
    {
      id: 'analytics-specialist',
      name: 'Jamie',
      type: 'analytics',
      description: 'Email Analytics Expert',
      role: 'Performance Analyst',
      expertise: ['A/B testing', 'Open rate optimization', 'Click tracking']
    }
  ],
  
  ad: [
    {
      id: 'ads-specialist',
      name: 'Drew',
      type: 'ads',
      description: 'Paid Advertising Expert',
      role: 'Ads Strategist',
      expertise: ['Campaign structure', 'Audience targeting', 'Budget optimization']
    },
    {
      id: 'copywriter',
      name: 'Parker',
      type: 'copywriting',
      description: 'Ad Copywriter',
      role: 'Ad Copy Specialist',
      expertise: ['Headlines', 'Ad copy frameworks', 'Call-to-actions']
    },
    {
      id: 'analytics-specialist',
      name: 'Quinn',
      type: 'analytics',
      description: 'Ad Performance Analyst',
      role: 'Performance Marketer',
      expertise: ['Conversion tracking', 'ROI analysis', 'Split testing']
    }
  ],
  
  website: [
    {
      id: 'content-strategist',
      name: 'Skyler',
      type: 'copywriting',
      description: 'Web Content Strategist',
      role: 'Content Lead',
      expertise: ['Information architecture', 'User journey mapping', 'Conversion optimization']
    },
    {
      id: 'seo-specialist',
      name: 'Reese',
      type: 'seo',
      description: 'Technical SEO Expert',
      role: 'SEO Lead',
      expertise: ['On-page SEO', 'Structured data', 'Site architecture']
    },
    {
      id: 'copywriter',
      name: 'Blair',
      type: 'copywriting',
      description: 'Web Copywriter',
      role: 'Content Creator',
      expertise: ['Landing pages', 'Value propositions', 'Microcopy']
    }
  ],
  
  // Default team for any unspecified content type
  default: [
    {
      id: 'content-strategist',
      name: 'Alex',
      type: 'copywriting',
      description: 'Content Strategy Expert',
      role: 'Lead Strategist',
      expertise: ['Content planning', 'Target audience analysis', 'Marketing strategy']
    },
    {
      id: 'copywriter',
      name: 'Jordan',
      type: 'copywriting',
      description: 'Professional Content Writer',
      role: 'Lead Writer',
      expertise: ['Content writing', 'Storytelling', 'Brand messaging']
    },
    {
      id: 'seo-specialist',
      name: 'Taylor',
      type: 'seo',
      description: 'SEO Expert',
      role: 'SEO Strategist',
      expertise: ['Keyword research', 'SEO optimization', 'Content performance']
    }
  ]
};

// Agent icons by type
const agentIcons: Record<AgentType | 'user' | 'system', React.ReactNode> = {
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

// Agent colors by type
const agentColors: Record<AgentType | 'user' | 'system', string> = {
  copywriting: 'bg-sky-500 text-sky-50',
  seo: 'bg-amber-500 text-amber-50',
  ads: 'bg-violet-500 text-violet-50',
  creative: 'bg-rose-500 text-rose-50',
  email: 'bg-emerald-500 text-emerald-50',
  analytics: 'bg-blue-500 text-blue-50',
  social: 'bg-pink-500 text-pink-50',
  user: 'bg-gray-700 text-gray-50',
  system: 'bg-gray-400 text-gray-50'
};

// Props for AIAgentChat component
interface AIAgentChatProps {
  contentType: string;
  title: string;
  description: string;
  initialPrompt?: string;
  onBack: () => void;
  onSaveDraft?: (conversation: Conversation) => void;
  onContentGenerated?: (content: string) => void;
}

const AIAgentChat: React.FC<AIAgentChatProps> = ({
  contentType,
  title,
  description,
  initialPrompt = '',
  onBack,
  onSaveDraft,
  onContentGenerated
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [finalContent, setFinalContent] = useState<string>('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  
  // Get the appropriate team for the content type
  const teamMembers = AGENT_TEAMS[contentType] || AGENT_TEAMS.default;
  
  // Keep track of whether a conversation initialization is in progress
  const [isInitializingConversation, setIsInitializingConversation] = useState(false);
  
  // We're now using saveMessageWithRetry from conversation-memory.ts
  
  // Initialize the chat interface with system message
  useEffect(() => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      sender: 'System',
      senderType: 'system',
      content: `Welcome to your AI Content Team! Your team is ready to help you create ${title.toLowerCase()}. Provide details about what you want to create.`,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages([systemMessage]);
    
    // If there's an initial prompt, simulate sending it
    if (initialPrompt) {
      setTimeout(() => {
        handleSubmit(null, initialPrompt);
      }, 500);
    }
    
    // Create a new conversation in Firebase with retry
    const initializeConversation = async () => {
      // Prevent multiple initialization attempts
      if (isInitializingConversation) return;
      setIsInitializingConversation(true);
      
      // Maximum retry attempts
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          // Attempt to create the conversation
          const newConversation = await createConversation({
            title: `${title} - ${new Date().toLocaleDateString()}`,
            initialMessage: systemMessage.content,
            metadata: {
              contentType: contentType,
              tags: [contentType, 'ai-team']
            }
          });
          
          setConversation(newConversation);
          success = true;
          console.log('Conversation created successfully:', newConversation.id);
        } catch (err) {
          retryCount++;
          console.error(`Failed to create conversation (attempt ${retryCount}/${maxRetries}):`, err);
          
          // If this is the last retry attempt, show a toast
          if (retryCount === maxRetries) {
            toast({
              title: "Conversation History Issue",
              description: "Your conversation will continue but might not be saved for later access.",
              variant: "destructive",
            });
          } else {
            // Wait briefly before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      setIsInitializingConversation(false);
    };
    
    initializeConversation();
  }, [contentType, title, initialPrompt, isInitializingConversation, toast]);
  
  // Auto-scroll chat to bottom on new messages with improved handling for animations
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatScrollRef.current) {
        // First immediate scroll
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        
        // Then schedule additional scrolls to handle any animations that might affect layout
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 100);
        
        // Final scroll after all animations should be complete
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 300);
      }
    };
    
    scrollToBottom();
    
    // Also scroll when isProcessing changes from true to false (final message arrived)
    return () => {
      // Cleanup not needed for this effect
    };
  }, [messages, isProcessing]);
  
  // Handle user input submission
  const handleSubmit = async (e?: React.FormEvent | null, overrideInput?: string) => {
    if (e) e.preventDefault();
    
    const input = overrideInput || userInput;
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'You',
      senderType: 'user',
      content: input,
      timestamp: new Date(),
      type: 'out'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    // Save user message to Firebase with retry capability
    if (conversation?.id) {
      // Use our utility function to save the message with retry
      saveMessageWithRetry(conversation.id, {
        role: 'user',
        content: input
      }).catch(err => {
        console.error('Error saving user message:', err);
      });
    }
    
    // Simulate AI team collaboration
    simulateTeamResponses(input);
  };
  
  // Simulate a conversation between team members
  const simulateTeamResponses = (userPrompt: string) => {
    // Assign team members
    const strategist = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('strategist'));
    const writer = teamMembers.find(member => member.type === 'copywriting' && member.id.includes('writer'));
    const specialist = teamMembers.find(member => 
      member.type !== 'copywriting' || (!member.id.includes('strategist') && !member.id.includes('writer'))
    );
    
    // Response chain: first the strategist analyzes the request
    setTimeout(async () => {
      if (strategist) {
        const message: ChatMessage = {
          id: `strategy-${Date.now()}`,
          sender: strategist.name,
          senderType: strategist.type,
          content: `Analyzing the request for "${userPrompt}". Let me outline a strategic approach for this ${contentType}.`,
          timestamp: new Date(),
          type: 'in',
          to: 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase using our utility function
        if (conversation?.id) {
          saveMessageWithRetry(conversation.id, {
            role: 'assistant',
            content: message.content,
            metadata: { agent: strategist.type, name: strategist.name }
          }).catch(err => {
            console.error('Error saving strategist message:', err);
          });
        }
      }
    }, 1000);
    
    // Second, the specialist provides insights specific to the content type
    setTimeout(async () => {
      if (specialist) {
        const message: ChatMessage = {
          id: `specialist-${Date.now()}`,
          sender: specialist.name,
          senderType: specialist.type,
          content: getSpecialistResponse(specialist.type, userPrompt, contentType),
          timestamp: new Date(),
          type: 'in',
          to: strategist ? strategist.name : 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase using our utility function
        if (conversation?.id) {
          saveMessageWithRetry(conversation.id, {
            role: 'assistant',
            content: message.content,
            metadata: { agent: specialist.type, name: specialist.name }
          }).catch(err => {
            console.error('Error saving specialist message:', err);
          });
        }
      }
    }, 3000);
    
    // Third, the writer creates content based on inputs
    setTimeout(async () => {
      if (writer) {
        const message: ChatMessage = {
          id: `writer-${Date.now()}`,
          sender: writer.name,
          senderType: writer.type,
          content: `Based on the strategy and insights, I'll now craft compelling content for "${userPrompt}". I'll incorporate the key points discussed and optimize for engagement.`,
          timestamp: new Date(),
          type: 'in',
          to: specialist ? specialist.name : 'Team'
        };
        
        setMessages(prev => [...prev, message]);
        
        // Save to Firebase using our utility function
        if (conversation?.id) {
          saveMessageWithRetry(conversation.id, {
            role: 'assistant',
            content: message.content,
            metadata: { agent: writer.type, name: writer.name }
          }).catch(err => {
            console.error('Error saving writer message:', err);
          });
        }
      }
    }, 5000);
    
    // Fourth, generate actual content based on user input
    setTimeout(async () => {
      // Generate content (in production this would call the API)
      const generatedContent = getFakeGeneratedContent(contentType, userPrompt);
      
      const finalMessage: ChatMessage = {
        id: `final-${Date.now()}`,
        sender: writer ? writer.name : 'AI Team',
        senderType: writer ? writer.type : 'copywriting',
        content: `Here's the ${title.toLowerCase()} I've created based on your requirements:\n\n${generatedContent}\n\nWhat do you think? Would you like me to make any revisions?`,
        timestamp: new Date(),
        type: 'in',
        to: 'You'
      };
      
      setMessages(prev => [...prev, finalMessage]);
      setFinalContent(generatedContent);
      setIsProcessing(false);
      
      // Save to Firebase using our utility function
      if (conversation?.id) {
        saveMessageWithRetry(conversation.id, {
          role: 'assistant',
          content: finalMessage.content,
          metadata: { 
            agent: finalMessage.senderType, 
            name: finalMessage.sender,
            finalContent: generatedContent
          }
        }).catch(err => {
          console.error('Error saving final message:', err);
        });
      }
      
      // Call the content generated callback if provided
      if (onContentGenerated) {
        onContentGenerated(generatedContent);
      }
    }, 8000);
  };
  
  // Get specialist response based on agent type with improved type safety
  const getSpecialistResponse = (type: AgentType | string, prompt: string, contentType: string): string => {
    // Validate inputs to prevent errors
    if (!type || typeof type !== 'string') {
      return `I've analyzed this content request and will provide expertise based on my specialization.`;
    }

    if (!prompt || typeof prompt !== 'string') {
      prompt = 'this content'; // Safe fallback if prompt is invalid
    }

    // Sanitize the prompt for display (limit length to prevent exceedingly long responses)
    const sanitizedPrompt = prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt;
    
    // Use type assertion with a type guard for safety
    const safeType = type as AgentType;
    
    switch (safeType) {
      case 'seo':
        return `Based on keyword research for "${sanitizedPrompt}", I recommend focusing on these key terms to optimize for search: [keyword1, keyword2, keyword3]. We should aim for a comprehensive piece that answers user intent.`;
      case 'social':
        return `For social media distribution, I suggest adapting this content for Instagram, Twitter, and LinkedIn with platform-specific formats. For "${sanitizedPrompt}", visual storytelling will be particularly effective.`;
      case 'email':
        return `To maximize open rates for this email about "${sanitizedPrompt}", I recommend an engaging subject line and clear segmentation strategy. We should focus on personalization and a strong call-to-action.`;
      case 'analytics':
        return `Looking at performance data for similar content to "${sanitizedPrompt}", we see the highest engagement with [specific format]. Let's optimize for both conversion and engagement metrics.`;
      case 'ads':
        return `For advertising content around "${sanitizedPrompt}", I recommend focusing on clear value propositions and emotional triggers. Our target audience responds well to [specific approach].`;
      case 'creative':
        return `For creative direction on "${sanitizedPrompt}", I suggest a visual approach that emphasizes [key emotional elements]. We should incorporate imagery that resonates with the target audience's aspirations.`;
      case 'copywriting':
        return `Looking at the content brief for "${sanitizedPrompt}", I recommend a narrative structure that highlights the key benefits while addressing potential objections. We should use persuasive language patterns to drive engagement.`;
      default:
        return `I've analyzed the requirements for "${sanitizedPrompt}" and recommend a structured approach focusing on the key benefits and unique selling points. Let's make sure we address the audience pain points directly.`;
    }
  };
  
  // Generate fake content for demo purposes (would connect to API in production)
  const getFakeGeneratedContent = (type: string, prompt: string): string => {
    const baseContent = `# ${prompt}\n\n`;
    
    switch (type) {
      case 'blog':
        return `${baseContent}## Introduction\nEngage your audience with this compelling introduction about ${prompt}. This blog post will explore the key aspects and provide valuable insights.\n\n## Key Points\n1. First important point about ${prompt}\n2. Analysis of current trends related to ${prompt}\n3. Best practices for implementing ${prompt} strategies\n\n## Conclusion\nImplementing these strategies for ${prompt} will help your business grow and succeed in today's competitive market.`;
      case 'social':
        return `${baseContent}**Instagram:**\n"✨ Discover how ${prompt} can transform your business! Swipe up to learn our top 3 strategies that increased engagement by 45% for our clients. #MarketingTips #GrowthHacking"\n\n**LinkedIn:**\nLooking to improve your ${prompt} strategy? Our team has compiled the industry-leading approaches that generated 3x ROI for our enterprise clients. Check out the full case study in comments.`;
      case 'email':
        return `${baseContent}**Subject Line:** The Secret to ${prompt} That No One Is Talking About\n\n**Email Body:**\nHi [FirstName],\n\nHope you're having a great week!\n\nI wanted to share some exclusive insights about ${prompt} that could be a game-changer for your business this quarter.\n\n[Main content about ${prompt}]\n\nWould you be available for a quick 15-minute call to discuss how these strategies could be customized for your specific needs?\n\nBest regards,\n[Your Name]`;
      case 'ad':
        return `${baseContent}**Google Ad:**\n${prompt} Solutions | Boost Results by 50%\nwww.yourbrand.com/solutions\nImplement our proven strategies for ${prompt}. Start your free trial today!\n\n**Facebook Ad:**\n[Headline] Transform Your Business with ${prompt}\n[Description] Discover how our clients achieved 3x growth using our proprietary ${prompt} framework. Limited time offer: Get a free strategy session!\n[CTA] Learn More`;
      case 'website':
        return `${baseContent}## Hero Section\n# Transform Your Business With ${prompt}\nThe industry-leading solution that helps companies achieve their goals faster and more efficiently.\n\n## Features Section\n- **Feature 1:** Streamlined implementation of ${prompt}\n- **Feature 2:** Advanced analytics and reporting\n- **Feature 3:** Seamless integration with your existing tools\n\n## Call to Action\nGet started with ${prompt} today and see results within 30 days, guaranteed.`;
      default:
        return `${baseContent}Here's your custom content about ${prompt}. This is where the AI-generated text would go, tailored specifically to your requirements and optimized for your goals.`;
    }
  };
  
  // Format timestamp to readable time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Save the current draft
  const handleSaveDraft = async () => {
    if (!conversation?.id) return;
    
    setIsSaving(true);
    
    try {
      // In a real implementation, you would call your API or service to save the draft
      if (onSaveDraft && conversation) {
        onSaveDraft(conversation);
      }
      
      toast({
        title: "Draft saved",
        description: "Your content has been saved successfully.",
        duration: 3000
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
      toast({
        title: "Save failed",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Copy content to clipboard
  const handleCopyContent = () => {
    if (!finalContent) return;
    
    navigator.clipboard.writeText(finalContent)
      .then(() => {
        toast({
          title: "Content copied",
          description: "The content has been copied to your clipboard.",
          duration: 2000
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard. Please try again.",
          variant: "destructive",
          duration: 3000
        });
      });
  };
  
  // Render a single message
  // Get safe color and icon values with fallbacks
  const getSafeAgentColor = (type: AgentType | 'user' | 'system' | string): string => {
    // Check if type is valid first
    if (!type || typeof type !== 'string') {
      return agentColors['system']; // Fallback to system color
    }
    return agentColors[type as AgentType | 'user' | 'system'] || agentColors['system']; // Fallback to system color
  };
  
  const getSafeAgentIcon = (type: AgentType | 'user' | 'system' | string): React.ReactNode => {
    // Check if type is valid first
    if (!type || typeof type !== 'string') {
      return agentIcons['system']; // Fallback to system icon
    }
    return agentIcons[type as AgentType | 'user' | 'system'] || agentIcons['system']; // Fallback to system icon
  };

  const renderMessage = (message: ChatMessage) => {
    const isUserMessage = message.senderType === 'user';
    const isSystemMessage = message.senderType === 'system';
    
    if (isSystemMessage) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-2"
        >
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Bot className="h-3 w-3" />
            <span>{message.content}</span>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex mb-4",
          isUserMessage ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn(
          "flex max-w-[80%]",
          isUserMessage ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          {!isUserMessage && (
            <Avatar className="h-8 w-8 mr-2 shrink-0">
              <AvatarFallback className={getSafeAgentColor(message.senderType)}>
                {getSafeAgentIcon(message.senderType)}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Message content */}
          <div>
            {/* Sender name and timestamp */}
            <div className={cn(
              "flex text-xs text-gray-500 mb-1",
              isUserMessage ? "justify-end" : "justify-start"
            )}>
              <span>{message.sender}</span>
              {message.to && (
                <>
                  <span className="mx-1 flex items-center">
                    <ArrowLeftRight className="h-2 w-2 mx-1" />
                  </span>
                  <span>{message.to}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            
            {/* Message bubble */}
            <div className={cn(
              "rounded-lg p-3",
              isUserMessage 
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {/* Message status for user messages */}
            {isUserMessage && message.status && (
              <div className="flex justify-end mt-1">
                {message.status === 'sending' && <Clock className="h-3 w-3 text-gray-400" />}
                {message.status === 'sent' && <CheckCircle className="h-3 w-3 text-gray-400" />}
                {message.status === 'read' && (
                  <div className="flex">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <CheckCircle className="h-3 w-3 text-blue-500 -ml-1" />
                  </div>
                )}
                {message.status === 'error' && (
                  <span className="text-xs text-red-500">Failed to send</span>
                )}
              </div>
            )}
          </div>
          
          {/* User avatar */}
          {isUserMessage && (
            <Avatar className="h-8 w-8 ml-2 shrink-0">
              <AvatarFallback className="bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-850">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title} - AI Team</h3>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Active
                </span>
              </Badge>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{teamMembers.length} team members</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1 h-8" 
            onClick={handleSaveDraft}
            disabled={isSaving || !finalContent}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1 h-8" 
            onClick={handleCopyContent}
            disabled={!finalContent}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </Button>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatScrollRef}>
        {messages.map(message => renderMessage(message))}
        
        {isProcessing && (
          <div className="flex items-center justify-center my-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>AI Team is working...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Team members */}
      <div className="p-3 border-t border-b">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Your AI Team:</span>
          {teamMembers.map((member) => (
            <Badge 
              key={member.id} 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className={getSafeAgentColor(member.type)}>
                  {getSafeAgentIcon(member.type)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
              <span className="text-xs text-gray-500">({member.role})</span>
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Input area */}
      <Card className="m-3 border-0 shadow-none">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              placeholder={`Ask your AI team about ${title.toLowerCase()}...`}
              className="min-h-10 flex-1 resize-none"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10"
              disabled={isProcessing || !userInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentChat;