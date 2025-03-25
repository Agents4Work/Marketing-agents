import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  Loader2,
  FileText,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Linkedin as LinkedinIcon,
  Sparkles,
  HelpCircle,
  LightbulbIcon,
  ChevronDown,
  Zap
} from "lucide-react";
import { generateContent } from "@/lib/openai";

// Interface for quick action suggestions
interface QuickAction {
  id: string;
  label: string;
  contentType: string;
  prompt: string;
}

// Quick action suggestions by content type
const quickActionSuggestions: QuickAction[] = [
  {
    id: "blog-intro",
    label: "Write an attention-grabbing blog introduction",
    contentType: "blog",
    prompt: "Write an attention-grabbing introduction for a blog post about artificial intelligence in marketing."
  },
  {
    id: "blog-headline",
    label: "Generate compelling blog headlines",
    contentType: "blog",
    prompt: "Generate 5 compelling blog headlines about productivity tips for marketers."
  },
  {
    id: "social-engagement",
    label: "Create an engaging social media post",
    contentType: "social",
    prompt: "Create an engaging social media post about a new product launch for a tech company."
  },
  {
    id: "email-subject",
    label: "Write email subject lines that boost open rates",
    contentType: "email",
    prompt: "Write 5 email subject lines that will boost open rates for a special discount promotion."
  },
  {
    id: "ad-facebook",
    label: "Create a Facebook ad that converts",
    contentType: "ad",
    prompt: "Create a Facebook ad for a new fitness app that targets busy professionals."
  },
  {
    id: "seo-meta",
    label: "Generate SEO-optimized meta descriptions",
    contentType: "seo",
    prompt: "Generate 3 SEO-optimized meta descriptions for a page about digital marketing services."
  },
  {
    id: "video-intro",
    label: "Create an engaging YouTube video intro script",
    contentType: "video",
    prompt: "Create an engaging 30-second YouTube video intro script for a marketing tutorial channel."
  }
];

interface ContentGeneratorProps {
  contentType: string;
  title: string;
  description: string;
  onContentGenerated: (content: string) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  contentType,
  title,
  description,
  onContentGenerated
}) => {
  // Content generation state
  const [prompt, setPrompt] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Generating your content...");
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  
  // UI state
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  
  // Content type specific state
  const [blogTitle, setBlogTitle] = useState<string>("");
  const [blogStyle, setBlogStyle] = useState<string>("informative");
  const [socialPlatform, setSocialPlatform] = useState<string>("instagram");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [adPlatform, setAdPlatform] = useState<string>("facebook");
  const [adTarget, setAdTarget] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string>("");
  const [videoLength, setVideoLength] = useState<string>("short");
  const [contentTone, setContentTone] = useState<string>("professional");
  
  // Animation text for placeholder
  const typingTexts = [
    "What should this content be about?",
    "Describe your target audience...",
    "What's the main purpose of this content?",
    "Enter your topic here..."
  ];
  const [typingTextIndex, setTypingTextIndex] = useState<number>(0);

  // Progress animation for generation
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
        
        // Update loading messages to show activity
        setLoadingStep(prev => (prev + 1) % 4);
        const messages = [
          "Analyzing your request...",
          "Crafting your content...",
          "Optimizing for engagement...",
          "Finalizing your content..."
        ];
        setLoadingMessage(messages[loadingStep]);
      }, 800);
      
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [generating, loadingStep]);
  
  // Rotate typing text placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingTextIndex(prev => (prev + 1) % typingTexts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle AI content generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe what you want the content to be about");
      return;
    }
    
    setError("");
    setGenerating(true);
    setGenerationProgress(10);
    
    try {
      // Create enhanced prompt based on content type and chosen options
      let enhancedPrompt = `Create a ${contentType} ${contentType === 'blog' ? 'post' : contentType === 'social' ? 'post' : contentType === 'email' ? 'message' : contentType === 'ad' ? 'advertisement' : contentType === 'seo' ? 'article' : 'script'} with a ${contentTone} tone about: ${prompt}.\n\n`;
      
      // Add type-specific instructions
      if (contentType === "blog" && blogTitle) {
        enhancedPrompt += `Blog title: ${blogTitle}.\n`;
      }
      
      if (contentType === "blog") {
        enhancedPrompt += `Style: ${blogStyle}.\n`;
      }
      
      if (contentType === "social") {
        enhancedPrompt += `Platform: ${socialPlatform}.\n`;
      }
      
      if (contentType === "email" && emailSubject) {
        enhancedPrompt += `Email subject: ${emailSubject}.\n`;
      }
      
      if (contentType === "ad") {
        enhancedPrompt += `Ad platform: ${adPlatform}.\n`;
        if (adTarget) enhancedPrompt += `Target audience: ${adTarget}.\n`;
      }
      
      if (contentType === "seo" && seoKeywords) {
        enhancedPrompt += `Keywords to optimize for: ${seoKeywords}.\n`;
      }
      
      if (contentType === "video") {
        enhancedPrompt += `Video length: ${videoLength === 'short' ? 'Short (1-2 minutes)' : videoLength === 'medium' ? 'Medium (3-5 minutes)' : 'Long (6-10 minutes)'}.\n`;
      }
      
      const response = await generateContent(enhancedPrompt, contentType);
      console.log("OpenAI response:", response);
      
      if (response && response.content) {
        onContentGenerated(response.content);
      } else {
        setError("Failed to generate content. Please try again.");
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
      setGenerationProgress(100);
    }
  };
  
  // Handle applying a quick action suggestion
  const handleQuickAction = (action: QuickAction) => {
    setPrompt(action.prompt);
  };
  
  // Get content type options for the current type
  const getContentOptions = () => {
    switch (contentType) {
      case "blog":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blog Title (Optional)</label>
                <Input 
                  placeholder="Enter a title for your blog post" 
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Style</label>
                <Select value={blogStyle} onValueChange={setBlogStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="thought-leadership">Thought Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="witty">Witty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "social":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={socialPlatform} onValueChange={setSocialPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4" />
                      <span>Instagram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <TwitterIcon className="h-4 w-4" />
                      <span>Twitter</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="h-4 w-4" />
                      <span>Facebook</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject Line</label>
              <Input 
                placeholder="Enter a compelling subject line"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "ad":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Input 
                  placeholder="Describe your target audience"
                  value={adTarget}
                  onChange={(e) => setAdTarget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad Platform</label>
                <Select value={adPlatform} onValueChange={setAdPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook Ads</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="instagram">Instagram Ads</SelectItem>
                    <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    <SelectItem value="tiktok">TikTok Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "seo":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Keywords</label>
              <Input 
                placeholder="Enter keywords separated by commas"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
              />
              <p className="text-xs text-gray-500">Enter primary and secondary keywords you want to rank for</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={contentTone} onValueChange={setContentTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="helpful">Helpful</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case "video":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Length</label>
                <Select value={videoLength} onValueChange={setVideoLength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 minutes)</SelectItem>
                    <SelectItem value="medium">Medium (3-5 minutes)</SelectItem>
                    <SelectItem value="long">Long (6-10 minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={contentTone} onValueChange={setContentTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="entertaining">Entertaining</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Get the relevant quick actions for the current content type
  const getQuickActions = () => {
    return quickActionSuggestions.filter(action => action.contentType === contentType);
  };
  
  // Get tips for the current content type
  const getTipsForContentType = () => {
    switch (contentType) {
      case "blog":
        return (
          <>
            <li>Be specific about your blog's main topic and target audience</li>
            <li>Specify if you need specific sections like introduction, conclusion, etc.</li>
            <li>Include desired word count for better results</li>
          </>
        );
      case "social":
        return (
          <>
            <li>Consider your platform's best practices (character limits, hashtag usage)</li>
            <li>Specify if you need a call-to-action or engagement prompt</li>
            <li>Mention if images/videos will accompany the post</li>
          </>
        );
      case "email":
        return (
          <>
            <li>Be clear about the email's purpose (promotional, newsletter, etc.)</li>
            <li>Include any specific sections needed (intro, CTA, closing)</li>
            <li>Specify your brand voice and relationship with the audience</li>
          </>
        );
      case "ad":
        return (
          <>
            <li>Be detailed about your product/service's unique selling points</li>
            <li>Clearly define your target audience and their pain points</li>
            <li>Specify ad character limits for your chosen platform</li>
          </>
        );
      case "seo":
        return (
          <>
            <li>Include primary and secondary keywords for better optimization</li>
            <li>Specify content length and structure (headings, bullet points, etc.)</li>
            <li>Mention your content's purpose (informational, commercial, etc.)</li>
          </>
        );
      case "video":
        return (
          <>
            <li>Specify video length, style, and format</li>
            <li>Include key points that must be covered</li>
            <li>Mention if you need hooks, intros, or call-to-actions</li>
          </>
        );
      default:
        return <li>Be specific with your requirements for better results</li>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowInstructions(!showInstructions)}>
                    <HelpCircle className="h-5 w-5 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">Toggle instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions Panel */}
          {showInstructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <LightbulbIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Tips for {title}</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    {getTipsForContentType()}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Type Options */}
          {getContentOptions()}
          
          {/* Content Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                What should the content be about?
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Be specific about your topic, audience, and goals for best results</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                {showSuggestions ? "Hide suggestions" : "Show suggestions"}
                <ChevronDown className={`h-3 w-3 transition-transform ${showSuggestions ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </div>
            
            <Textarea 
              placeholder={typingTexts[typingTextIndex]}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="min-h-[120px] resize-y transition-all duration-300 focus:shadow-md"
            />
            
            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            )}
            
            {/* Quick Suggestions */}
            {showSuggestions && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Quick prompts</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getQuickActions().map((action) => (
                    <Badge 
                      key={action.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleQuickAction(action)}
                    >
                      {action.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Generate Button */}
          <div className="pt-2">
            <Button 
              onClick={handleGenerate} 
              disabled={generating} 
              className="w-full h-12 text-base font-medium relative overflow-hidden transition-all duration-300 bg-primary hover:bg-primary/90"
            >
              {generating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> 
                  <span>{loadingMessage}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" /> 
                  {`Generate ${title}`}
                </div>
              )}
              
              {/* Progress Bar */}
              {generating && (
                <div className="absolute bottom-0 left-0 h-1 bg-white/30" style={{ width: `${generationProgress}%`, transition: 'width 0.5s ease-out' }}></div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentGenerator;