import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  Check,
  HelpCircle,
  Target,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Globe,
  Bookmark
} from 'lucide-react';

// Define interfaces for form data
export interface PersonalizationFormData {
  contentType: string;
  primaryGoal: string;
  targetAudience: string;
  toneAndStyle: string;
  brandGuidelines: string;
  keyPoints: string[];
  references: string[];
  competitors: string[];
  keywords: string[];
  callToAction: string;
  additionalNotes: string;
  // Content type specific fields
  [key: string]: any;
}

// Content type specific form fields interfaces
interface SocialPostFormData extends PersonalizationFormData {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  postType: 'text' | 'image' | 'carousel' | 'video';
  includeHashtags: boolean;
  includeEmojis: boolean;
  postLength: 'short' | 'medium' | 'long';
}

interface BlogPostFormData extends PersonalizationFormData {
  wordCount: number;
  targetKeyword: string;
  seoOptimized: boolean;
  includeSubheadings: boolean;
  includeFAQs: boolean;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  contentStructure: 'how-to' | 'listicle' | 'thought-leadership' | 'case-study';
}

interface EmailFormData extends PersonalizationFormData {
  emailType: 'newsletter' | 'promotional' | 'transactional' | 'welcome';
  subjectLine: string;
  includeButtons: boolean;
  personalizationLevel: 'low' | 'medium' | 'high';
  urgencyLevel: 'low' | 'medium' | 'high';
}

interface AdCopyFormData extends PersonalizationFormData {
  adPlatform: 'google' | 'facebook' | 'instagram' | 'linkedin';
  adType: 'search' | 'display' | 'social';
  headlines: string[];
  primaryBenefit: string;
  includePrice: boolean;
  includePromoCode: boolean;
  characterLimit: number;
}

// Default values for each content type
const defaultFormValues: Record<string, PersonalizationFormData> = {
  social: {
    contentType: 'social',
    primaryGoal: '',
    targetAudience: '',
    toneAndStyle: 'conversational',
    brandGuidelines: '',
    keyPoints: [''],
    references: [''],
    competitors: [''],
    keywords: [''],
    callToAction: '',
    additionalNotes: '',
    platform: 'facebook',
    postType: 'text',
    includeHashtags: true,
    includeEmojis: true,
    postLength: 'medium'
  },
  blog: {
    contentType: 'blog',
    primaryGoal: '',
    targetAudience: '',
    toneAndStyle: 'informative',
    brandGuidelines: '',
    keyPoints: [''],
    references: [''],
    competitors: [''],
    keywords: [''],
    callToAction: '',
    additionalNotes: '',
    wordCount: 1200,
    targetKeyword: '',
    seoOptimized: true,
    includeSubheadings: true,
    includeFAQs: false,
    readingLevel: 'intermediate',
    contentStructure: 'how-to'
  },
  email: {
    contentType: 'email',
    primaryGoal: '',
    targetAudience: '',
    toneAndStyle: 'professional',
    brandGuidelines: '',
    keyPoints: [''],
    references: [''],
    competitors: [''],
    keywords: [''],
    callToAction: '',
    additionalNotes: '',
    emailType: 'newsletter',
    subjectLine: '',
    includeButtons: true,
    personalizationLevel: 'medium',
    urgencyLevel: 'medium'
  },
  ad: {
    contentType: 'ad',
    primaryGoal: '',
    targetAudience: '',
    toneAndStyle: 'persuasive',
    brandGuidelines: '',
    keyPoints: [''],
    references: [''],
    competitors: [''],
    keywords: [''],
    callToAction: '',
    additionalNotes: '',
    adPlatform: 'facebook',
    adType: 'social',
    headlines: [''],
    primaryBenefit: '',
    includePrice: false,
    includePromoCode: false,
    characterLimit: 125
  },
  website: {
    contentType: 'website',
    primaryGoal: '',
    targetAudience: '',
    toneAndStyle: 'professional',
    brandGuidelines: '',
    keyPoints: [''],
    references: [''],
    competitors: [''],
    keywords: [''],
    callToAction: '',
    additionalNotes: '',
    pageType: 'landing',
    includeSEOTitle: true,
    includeSEODescription: true,
    includeStructuredData: false,
    wordCount: 500
  }
};

// Form configuration: Steps, fields, and questions for each content type
interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'array';
  placeholder?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
  isRequired?: boolean;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
}

interface FormStep {
  title: string;
  description: string;
  fields: FormField[];
}

// Form configuration by content type
const formConfigurations: Record<string, FormStep[]> = {
  social: [
    {
      title: "Campaign Goals & Audience",
      description: "Define what you want to achieve with this social post and who it's for",
      fields: [
        {
          id: "primaryGoal",
          label: "What's the primary goal of this social media post?",
          type: "select",
          options: [
            { value: "awareness", label: "Raise brand awareness" },
            { value: "engagement", label: "Increase engagement (likes, comments, shares)" },
            { value: "traffic", label: "Drive traffic to website" },
            { value: "leads", label: "Generate leads" },
            { value: "sales", label: "Drive sales or conversions" },
            { value: "retention", label: "Increase customer loyalty or retention" },
            { value: "community", label: "Build community" }
          ],
          isRequired: true,
          icon: <Target className="h-4 w-4" />
        },
        {
          id: "platform",
          label: "Which platform is this post for?",
          type: "select",
          options: [
            { value: "facebook", label: "Facebook" },
            { value: "instagram", label: "Instagram" },
            { value: "twitter", label: "Twitter/X" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "tiktok", label: "TikTok" },
            { value: "pinterest", label: "Pinterest" }
          ],
          isRequired: true,
          icon: <Globe className="h-4 w-4" />
        },
        {
          id: "targetAudience",
          label: "Describe your target audience in detail",
          type: "textarea",
          placeholder: "Age range, interests, pain points, needs, behaviors, demographics...",
          helperText: "The more specific you are, the better we can tailor the content",
          isRequired: true,
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Content Details",
      description: "Specify the details of your social media post",
      fields: [
        {
          id: "postType",
          label: "What type of post are you creating?",
          type: "select",
          options: [
            { value: "text", label: "Text only" },
            { value: "image", label: "Image with caption" },
            { value: "carousel", label: "Carousel/Multiple images" },
            { value: "video", label: "Video post" },
            { value: "story", label: "Story" },
            { value: "reel", label: "Reel/Short video" },
            { value: "poll", label: "Poll or Question" }
          ],
          isRequired: true
        },
        {
          id: "toneAndStyle",
          label: "What tone and style should this post have?",
          type: "select",
          options: [
            { value: "conversational", label: "Conversational and friendly" },
            { value: "professional", label: "Professional and formal" },
            { value: "humorous", label: "Humorous and entertaining" },
            { value: "inspirational", label: "Inspirational and motivational" },
            { value: "educational", label: "Educational and informative" },
            { value: "urgent", label: "Urgent and compelling" },
            { value: "minimalist", label: "Minimalist and straightforward" }
          ],
          isRequired: true
        },
        {
          id: "postLength",
          label: "Preferred length of post",
          type: "select",
          options: [
            { value: "short", label: "Short (Under 50 words)" },
            { value: "medium", label: "Medium (50-100 words)" },
            { value: "long", label: "Long (100+ words)" }
          ],
          isRequired: true
        },
        {
          id: "keyPoints",
          label: "Key points to include in the post",
          type: "array",
          placeholder: "Enter key message, benefit, or information point",
          helperText: "Add the specific points you want to communicate"
        }
      ]
    },
    {
      title: "Customization & Brand Guidelines",
      description: "Make your post unique and aligned with your brand",
      fields: [
        {
          id: "includeHashtags",
          label: "Include relevant hashtags",
          type: "checkbox",
          helperText: "We'll research and add appropriate hashtags to increase reach"
        },
        {
          id: "includeEmojis",
          label: "Include emojis in the post",
          type: "checkbox",
          helperText: "Emojis can increase engagement but may not be suitable for all brands"
        },
        {
          id: "brandGuidelines",
          label: "Brand guidelines or voice considerations",
          type: "textarea",
          placeholder: "Describe your brand's voice, dos and don'ts, terminology preferences...",
          helperText: "Help us match your brand identity and style"
        },
        {
          id: "competitors",
          label: "Competitor posts to reference (or avoid replicating)",
          type: "array",
          placeholder: "Competitor name or link to example post",
          helperText: "This helps us understand the competitive landscape"
        },
        {
          id: "callToAction",
          label: "Specific call-to-action (CTA)",
          type: "text",
          placeholder: "e.g., 'Sign up today' or 'Learn more at link in bio'",
          helperText: "Clear CTAs improve conversion rates"
        }
      ]
    }
  ],
  blog: [
    {
      title: "Blog Purpose & Audience",
      description: "Define the strategic purpose of this blog post",
      fields: [
        {
          id: "primaryGoal",
          label: "What's the primary goal of this blog post?",
          type: "select",
          options: [
            { value: "traffic", label: "Drive organic search traffic (SEO)" },
            { value: "thought-leadership", label: "Establish thought leadership" },
            { value: "leads", label: "Generate leads or conversions" },
            { value: "education", label: "Educate customers on solutions" },
            { value: "product-awareness", label: "Create product/service awareness" },
            { value: "engagement", label: "Increase website engagement" },
            { value: "community", label: "Build community and loyalty" }
          ],
          isRequired: true,
          icon: <Target className="h-4 w-4" />
        },
        {
          id: "targetAudience",
          label: "Describe your target audience in detail",
          type: "textarea",
          placeholder: "Job titles, industry, knowledge level, needs, pain points, goals...",
          helperText: "The more specific, the more tailored your content will be",
          isRequired: true,
          icon: <Users className="h-4 w-4" />
        },
        {
          id: "contentStructure",
          label: "What type of blog post structure do you need?",
          type: "select",
          options: [
            { value: "how-to", label: "How-to guide or tutorial" },
            { value: "listicle", label: "List-based article" },
            { value: "thought-leadership", label: "Thought leadership/Opinion piece" },
            { value: "case-study", label: "Case study or success story" },
            { value: "comparison", label: "Comparison or versus post" },
            { value: "interview", label: "Interview or expert Q&A" },
            { value: "news", label: "Industry news or trend analysis" }
          ],
          isRequired: true,
          icon: <Lightbulb className="h-4 w-4" />
        }
      ]
    },
    {
      title: "SEO & Content Details",
      description: "Optimize your blog for search engines and readability",
      fields: [
        {
          id: "targetKeyword",
          label: "Primary target keyword or phrase",
          type: "text",
          placeholder: "e.g., 'social media marketing strategies'",
          helperText: "This will be the main keyword to optimize for",
          isRequired: true
        },
        {
          id: "keywords",
          label: "Additional secondary keywords",
          type: "array",
          placeholder: "Enter related keywords",
          helperText: "These support your primary keyword and provide additional ranking opportunities"
        },
        {
          id: "wordCount",
          label: "Approximate word count",
          type: "number",
          placeholder: "e.g., 1200",
          helperText: "Longer content often ranks better for competitive terms (1000+ words recommended)",
          min: 300,
          max: 5000,
          isRequired: true
        },
        {
          id: "readingLevel",
          label: "Target reading level",
          type: "select",
          options: [
            { value: "beginner", label: "Beginner (Simple, accessible to general audience)" },
            { value: "intermediate", label: "Intermediate (Industry terminology acceptable)" },
            { value: "advanced", label: "Advanced (Expert-level, technical terminology)" }
          ],
          isRequired: true
        }
      ]
    },
    {
      title: "Content Customization & Requirements",
      description: "Provide specific content requirements and customization",
      fields: [
        {
          id: "keyPoints",
          label: "Key points to cover in the blog",
          type: "array",
          placeholder: "Enter key points, arguments, or sections to include",
          helperText: "These will form the main sections of your article",
          isRequired: true
        },
        {
          id: "toneAndStyle",
          label: "What tone and style should this blog post have?",
          type: "select",
          options: [
            { value: "informative", label: "Informative and educational" },
            { value: "conversational", label: "Conversational and friendly" },
            { value: "professional", label: "Professional and formal" },
            { value: "authoritative", label: "Authoritative and expert" },
            { value: "inspirational", label: "Inspirational and motivational" },
            { value: "humorous", label: "Humorous and entertaining" }
          ],
          isRequired: true
        },
        {
          id: "includeSubheadings",
          label: "Include multiple H2 and H3 subheadings",
          type: "checkbox",
          helperText: "Improves readability and SEO",
          isRequired: false
        },
        {
          id: "includeFAQs",
          label: "Include FAQs section",
          type: "checkbox",
          helperText: "FAQ sections can help with featured snippets in search results",
          isRequired: false
        },
        {
          id: "brandGuidelines",
          label: "Brand guidelines and voice considerations",
          type: "textarea",
          placeholder: "Describe your brand's voice, dos and don'ts, terminology preferences...",
          helperText: "Help us match your brand identity and style"
        },
        {
          id: "references",
          label: "Sources, research, or data to include",
          type: "array",
          placeholder: "Links to sources, statistics, or studies to reference",
          helperText: "Citing quality sources improves credibility"
        },
        {
          id: "callToAction",
          label: "Desired call-to-action (CTA)",
          type: "text",
          placeholder: "e.g., 'Schedule a consultation' or 'Download our guide'",
          helperText: "What action should readers take after reading?"
        }
      ]
    }
  ],
  email: [
    {
      title: "Email Campaign Goals",
      description: "Define what you want to achieve with this email",
      fields: [
        {
          id: "emailType",
          label: "What type of email are you creating?",
          type: "select",
          options: [
            { value: "newsletter", label: "Newsletter" },
            { value: "promotional", label: "Promotional/Sales email" },
            { value: "welcome", label: "Welcome/Onboarding email" },
            { value: "follow-up", label: "Follow-up email" },
            { value: "announcement", label: "Announcement or update" },
            { value: "event", label: "Event invitation" },
            { value: "abandoned-cart", label: "Abandoned cart recovery" }
          ],
          isRequired: true,
          icon: <Bookmark className="h-4 w-4" />
        },
        {
          id: "primaryGoal",
          label: "What's the primary goal of this email?",
          type: "select",
          options: [
            { value: "clicks", label: "Drive clicks to website" },
            { value: "engagement", label: "Increase engagement with content" },
            { value: "sales", label: "Drive sales or conversions" },
            { value: "information", label: "Provide information or educate" },
            { value: "feedback", label: "Collect feedback or responses" },
            { value: "retention", label: "Increase customer retention" },
            { value: "reactivation", label: "Reactivate dormant subscribers" }
          ],
          isRequired: true,
          icon: <Target className="h-4 w-4" />
        },
        {
          id: "targetAudience",
          label: "Describe your audience for this email",
          type: "textarea",
          placeholder: "Segment characteristics, relationship with your brand, behavior triggers...",
          helperText: "For best results, be specific about which audience segment this email targets",
          isRequired: true,
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Email Content Details",
      description: "Specify the content structure and elements of your email",
      fields: [
        {
          id: "subjectLine",
          label: "Subject line preference or goal",
          type: "text",
          placeholder: "e.g., 'Attention-grabbing with urgency' or 'Professional and straightforward'",
          helperText: "What should your subject line accomplish?",
          isRequired: true
        },
        {
          id: "personalizationLevel",
          label: "Level of personalization needed",
          type: "select",
          options: [
            { value: "low", label: "Low (Basic personalization like first name)" },
            { value: "medium", label: "Medium (Segment-based personalization)" },
            { value: "high", label: "High (Dynamic content based on user behavior)" }
          ],
          isRequired: true
        },
        {
          id: "keyPoints",
          label: "Key points to include in the email",
          type: "array",
          placeholder: "Enter key messages, benefits, or information",
          helperText: "These will be the main points of your email",
          isRequired: true
        },
        {
          id: "includeButtons",
          label: "Include CTA buttons",
          type: "checkbox",
          helperText: "Buttons often increase click-through rates vs. text links"
        }
      ]
    },
    {
      title: "Tone & Customization",
      description: "Define the style and special considerations for your email",
      fields: [
        {
          id: "toneAndStyle",
          label: "What tone and style should this email have?",
          type: "select",
          options: [
            { value: "conversational", label: "Conversational and friendly" },
            { value: "professional", label: "Professional and formal" },
            { value: "urgent", label: "Urgent and compelling" },
            { value: "promotional", label: "Promotional and enthusiastic" },
            { value: "informative", label: "Informative and educational" },
            { value: "appreciative", label: "Appreciative and grateful" },
            { value: "minimalist", label: "Minimalist and direct" }
          ],
          isRequired: true
        },
        {
          id: "urgencyLevel",
          label: "Level of urgency in the messaging",
          type: "select",
          options: [
            { value: "low", label: "Low (No urgency)" },
            { value: "medium", label: "Medium (Subtle urgency)" },
            { value: "high", label: "High (Strong urgency/FOMO)" }
          ],
          isRequired: true
        },
        {
          id: "brandGuidelines",
          label: "Brand guidelines or voice considerations",
          type: "textarea",
          placeholder: "Describe your brand's voice, dos and don'ts, terminology preferences...",
          helperText: "Help us match your brand identity and style"
        },
        {
          id: "callToAction",
          label: "Primary call-to-action (CTA)",
          type: "text",
          placeholder: "e.g., 'Shop Now' or 'Read the Full Guide'",
          helperText: "Clear and compelling CTAs improve conversion rates",
          isRequired: true
        },
        {
          id: "additionalNotes",
          label: "Any additional notes or requirements",
          type: "textarea",
          placeholder: "Any other specifications, requirements, or context we should know about...",
          helperText: "Include anything else you'd like the AI team to consider"
        }
      ]
    }
  ],
  ad: [
    {
      title: "Ad Campaign Goals",
      description: "Define what you want to achieve with this ad",
      fields: [
        {
          id: "adPlatform",
          label: "Which platform is this ad for?",
          type: "select",
          options: [
            { value: "google", label: "Google Ads" },
            { value: "facebook", label: "Facebook/Instagram Ads" },
            { value: "linkedin", label: "LinkedIn Ads" },
            { value: "twitter", label: "Twitter/X Ads" },
            { value: "tiktok", label: "TikTok Ads" },
            { value: "amazon", label: "Amazon Ads" },
            { value: "youtube", label: "YouTube Ads" }
          ],
          isRequired: true,
          icon: <Globe className="h-4 w-4" />
        },
        {
          id: "adType",
          label: "What type of ad are you creating?",
          type: "select",
          options: [
            { value: "search", label: "Search ad" },
            { value: "display", label: "Display/Banner ad" },
            { value: "social", label: "Social media ad" },
            { value: "video", label: "Video ad" },
            { value: "shopping", label: "Shopping/Product ad" },
            { value: "remarketing", label: "Remarketing ad" }
          ],
          isRequired: true
        },
        {
          id: "primaryGoal",
          label: "What's the primary goal of this ad?",
          type: "select",
          options: [
            { value: "awareness", label: "Brand awareness" },
            { value: "traffic", label: "Website traffic" },
            { value: "leads", label: "Lead generation" },
            { value: "conversions", label: "Sales/Conversions" },
            { value: "app-installs", label: "App installs" },
            { value: "engagement", label: "Engagement/Followers" }
          ],
          isRequired: true,
          icon: <Target className="h-4 w-4" />
        },
        {
          id: "targetAudience",
          label: "Describe your target audience in detail",
          type: "textarea",
          placeholder: "Demographics, interests, behaviors, intent signals...",
          helperText: "Detailed audience information helps create more targeted ad copy",
          isRequired: true,
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      title: "Ad Content Specifications",
      description: "Specify the details and requirements for your ad content",
      fields: [
        {
          id: "headlines",
          label: "Headline ideas or themes (multiple headlines will be generated)",
          type: "array",
          placeholder: "Enter headline themes, USPs, or specific messages",
          helperText: "For platforms like Google Ads that require multiple headlines",
          isRequired: true
        },
        {
          id: "primaryBenefit",
          label: "Primary benefit or unique selling proposition",
          type: "text",
          placeholder: "What's the main value proposition for the customer?",
          helperText: "This will be emphasized in the ad copy",
          isRequired: true
        },
        {
          id: "characterLimit",
          label: "Character limit for ad text (if applicable)",
          type: "number",
          placeholder: "e.g., 90 for Google Ads descriptions",
          helperText: "Different platforms have different limits, leave blank if unsure"
        }
      ]
    },
    {
      title: "Ad Customization & Requirements",
      description: "Provide additional details to customize your ad content",
      fields: [
        {
          id: "toneAndStyle",
          label: "What tone and style should this ad have?",
          type: "select",
          options: [
            { value: "persuasive", label: "Persuasive and compelling" },
            { value: "professional", label: "Professional and trustworthy" },
            { value: "urgent", label: "Urgent and action-oriented" },
            { value: "friendly", label: "Friendly and conversational" },
            { value: "informative", label: "Informative and educational" },
            { value: "minimalist", label: "Minimalist and direct" },
            { value: "promotional", label: "Promotional with offer focus" }
          ],
          isRequired: true
        },
        {
          id: "includePrice",
          label: "Include pricing information",
          type: "checkbox",
          helperText: "Whether to include specific price points in the ad"
        },
        {
          id: "includePromoCode",
          label: "Include promotion code or special offer",
          type: "checkbox",
          helperText: "Whether to include a specific promotion in the ad"
        },
        {
          id: "keywords",
          label: "Target keywords (for search ads)",
          type: "array",
          placeholder: "Enter keywords to target",
          helperText: "For search ads, include keywords to incorporate in the copy"
        },
        {
          id: "competitors",
          label: "Competitor ads to reference (or differentiate from)",
          type: "array",
          placeholder: "Enter competitor or example ad",
          helperText: "This helps us understand the competitive landscape"
        },
        {
          id: "callToAction",
          label: "Specific call-to-action (CTA)",
          type: "text",
          placeholder: "e.g., 'Shop Now' or 'Learn More'",
          helperText: "Clear CTAs improve conversion rates",
          isRequired: true
        },
        {
          id: "brandGuidelines",
          label: "Brand guidelines or voice considerations",
          type: "textarea",
          placeholder: "Describe your brand's voice, dos and don'ts, terminology preferences...",
          helperText: "Help us match your brand identity and style"
        }
      ]
    }
  ]
};

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
};

interface ContentPersonalizationFormProps {
  contentType: string;
  contentName: string;
  description?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit: (formData: PersonalizationFormData) => void;
}

const ContentPersonalizationForm: React.FC<ContentPersonalizationFormProps> = ({
  contentType,
  contentName,
  description = "Customize your content creation process",
  onBack,
  onCancel,
  onSubmit
}) => {
  // Initialize state with default values based on content type
  const [formData, setFormData] = useState<PersonalizationFormData>(
    defaultFormValues[contentType] || defaultFormValues.social
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  // Get form configuration based on content type
  const formSteps = formConfigurations[contentType] || formConfigurations.social;
  
  // Calculate progress percentage
  useEffect(() => {
    const newProgress = ((currentStep + 1) / formSteps.length) * 100;
    setProgress(newProgress);
  }, [currentStep, formSteps.length]);
  
  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle array field changes (adding/removing/updating items)
  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
      currentArray[index] = value;
      return {
        ...prev,
        [field]: currentArray
      };
    });
  };
  
  // Add a new item to an array field
  const handleAddArrayItem = (field: string) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
      return {
        ...prev,
        [field]: [...currentArray, '']
      };
    });
  };
  
  // Remove an item from an array field
  const handleRemoveArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[field]) ? [...prev[field]] : [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };
  
  // Validate current step fields
  const validateCurrentStep = (): boolean => {
    const currentFields = formSteps[currentStep].fields;
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    currentFields.forEach(field => {
      if (field.isRequired) {
        const value = formData[field.id];
        
        if (field.type === 'array') {
          // For array fields, check if at least one non-empty item exists
          const arrayValue = Array.isArray(value) ? value : [];
          if (arrayValue.length === 0 || arrayValue.every(item => !item.trim())) {
            newErrors[field.id] = `Please add at least one ${field.label.toLowerCase()}`;
            isValid = false;
          }
        } else if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.id] = `${field.label} is required`;
          isValid = false;
        }
      }
    });
    
    setFieldErrors(newErrors);
    return isValid;
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      // Handle navigation away from form
      if (typeof onBack === 'function') {
        onBack(); // Go back to content type selection
      } else if (typeof onCancel === 'function') {
        onCancel(); // Alternative way to exit the form
      }
    }
  };
  
  // Submit the completed form
  const handleFormSubmit = () => {
    if (validateCurrentStep()) {
      setIsSubmitting(true);
      
      // Process form data if needed (remove empty array items, etc.)
      const processedFormData = { ...formData };
      
      // Clean up array fields (remove empty items)
      Object.keys(processedFormData).forEach(key => {
        if (Array.isArray(processedFormData[key])) {
          processedFormData[key] = processedFormData[key].filter((item: string) => item.trim() !== '');
        }
      });
      
      try {
        onSubmit(processedFormData);
        toast({
          title: "Form submitted successfully",
          description: "Preparing your personalized AI team workspace",
          duration: 3000
        });
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: "Submission failed",
          description: "There was an error submitting your data. Please try again.",
          variant: "destructive",
          duration: 5000
        });
        setIsSubmitting(false);
      }
    }
  };
  
  // Render form fields based on their type
  const renderField = (field: FormField) => {
    const error = fieldErrors[field.id];
    
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="flex items-center gap-2">
                {field.icon && field.icon}
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
              {field.helperText && (
                <div className="text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {field.helperText}
                </div>
              )}
            </div>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="flex items-center gap-2">
                {field.icon && field.icon}
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
              {field.helperText && (
                <div className="text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {field.helperText}
                </div>
              )}
            </div>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`min-h-[100px] ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="flex items-center gap-2">
                {field.icon && field.icon}
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
              {field.helperText && (
                <div className="text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {field.helperText}
                </div>
              )}
            </div>
            <Select 
              value={formData[field.id] || ''} 
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={field.id} 
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => handleInputChange(field.id, checked)}
              />
              <Label htmlFor={field.id} className="cursor-pointer">
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {field.helperText && (
              <div className="text-xs text-gray-500 ml-6">
                {field.helperText}
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="flex items-center gap-2">
                {field.icon && field.icon}
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
              {field.helperText && (
                <div className="text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {field.helperText}
                </div>
              )}
            </div>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'array':
        const arrayValues = Array.isArray(formData[field.id]) 
          ? formData[field.id] 
          : ['']; // Ensure at least one empty item
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                {field.icon && field.icon}
                {field.label}
                {field.isRequired && <span className="text-red-500">*</span>}
              </Label>
              {field.helperText && (
                <div className="text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {field.helperText}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {arrayValues.map((value: string, index: number) => (
                <div key={`${field.id}-${index}`} className="flex items-center gap-2">
                  <Input
                    id={`${field.id}-${index}`}
                    placeholder={field.placeholder}
                    value={value || ''}
                    onChange={(e) => handleArrayChange(field.id, index, e.target.value)}
                    className={error ? "border-red-500" : ""}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    className="px-2"
                    onClick={() => handleRemoveArrayItem(field.id, index)}
                    disabled={arrayValues.length === 1 && !arrayValues[0]}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleAddArrayItem(field.id)}
              >
                + Add another
              </Button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2" 
                onClick={handlePrevStep}
              >
                ← Back
              </Button>
              <CardTitle className="text-2xl font-bold">
                {contentName}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {formSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 pb-2">
          <motion.div
            key={`step-${currentStep}`}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-1">
                {formSteps[currentStep].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {formSteps[currentStep].description}
              </p>
            </div>
            
            <div className="space-y-6">
              {formSteps[currentStep].fields.map((field) => (
                <div key={field.id} className="pb-2">
                  {renderField(field)}
                  {field !== formSteps[currentStep].fields[formSteps[currentStep].fields.length - 1] && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 pb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
            
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
          
          {currentStep < formSteps.length - 1 ? (
            <Button 
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="gap-1"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? 'Submitting...' : 'Create with AI Team'}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ContentPersonalizationForm;