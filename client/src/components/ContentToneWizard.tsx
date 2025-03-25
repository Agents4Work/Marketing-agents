'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ContentToneWizardProps {
  onApplySettings?: (settings: ContentToneSettings) => void;
  initialSettings?: ContentToneSettings;
}

export interface ContentToneSettings {
  toneType: string;
  formality: number;
  creativity: number;
  emotionIntensity: number;
  industry: string;
  contentType: string;
  targetAudience: string;
  customPrompt: string;
}

const defaultSettings: ContentToneSettings = {
  toneType: 'professional',
  formality: 70,
  creativity: 50,
  emotionIntensity: 40,
  industry: 'technology',
  contentType: 'blog',
  targetAudience: 'professionals',
  customPrompt: '',
};

const toneTypes = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'humorous', label: 'Humorous' },
];

const industries = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'marketing', label: 'Marketing' },
];

const contentTypes = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'ad', label: 'Advertisement' },
  { value: 'product', label: 'Product Description' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'newsletter', label: 'Newsletter' },
];

const audiences = [
  { value: 'professionals', label: 'Professionals' },
  { value: 'consumers', label: 'General Consumers' },
  { value: 'executives', label: 'Executives' },
  { value: 'technical', label: 'Technical Audience' },
  { value: 'students', label: 'Students' },
  { value: 'parents', label: 'Parents' },
  { value: 'seniors', label: 'Seniors' },
  { value: 'millennials', label: 'Millennials' },
  { value: 'gen-z', label: 'Gen Z' },
];

export default function ContentToneWizard({ onApplySettings, initialSettings }: ContentToneWizardProps) {
  const [settings, setSettings] = useState<ContentToneSettings>(initialSettings || defaultSettings);
  const [previewText, setPreviewText] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const updateSetting = <K extends keyof ContentToneSettings>(
    key: K, 
    value: ContentToneSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    
    try {
      // In a real implementation, this would call an API to generate text with the specified settings
      // Simulating an API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample preview text based on tone settings
      const preview = generateSamplePreview(settings);
      setPreviewText(preview);
    } catch (error) {
      toast({
        title: "Preview Generation Failed",
        description: "Unable to generate content preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleApplySettings = () => {
    if (onApplySettings) {
      onApplySettings(settings);
    }
    toast({
      title: "Tone Settings Applied",
      description: "Your content tone settings have been saved and applied.",
    });
  };

  const generateSamplePreview = (settings: ContentToneSettings): string => {
    // This is a simplified version - in production, this would come from an AI model
    const { toneType, industry, contentType, targetAudience } = settings;
    
    const toneMap: Record<string, string> = {
      professional: "Using clear, concise language with industry terminology",
      friendly: "In a warm, approachable manner with conversational phrases",
      casual: "With a relaxed, informal tone and everyday language",
      authoritative: "Presenting factual information with confidence and expertise",
      humorous: "With a light-hearted approach and occasional jokes",
    };
    
    return `[Sample AI-generated content preview written ${toneMap[toneType]}]

This ${contentType} is crafted specifically for the ${industry} industry, targeting ${targetAudience}.

The content would demonstrate the selected formality level, creativity, and emotional intensity based on your custom settings. In a real implementation, this would be generated using your AI content service's API.`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Content Tone & Style Wizard</CardTitle>
        <CardDescription>
          Customize how your AI-generated content sounds and feels to match your brand voice
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-4">Select Your Base Tone</h3>
              <RadioGroup 
                value={settings.toneType} 
                onValueChange={value => updateSetting('toneType', value)}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
              >
                {toneTypes.map(tone => (
                  <div key={tone.value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={tone.value} 
                      id={`tone-${tone.value}`} 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor={`tone-${tone.value}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="mb-1">{tone.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fine-tune Your Tone</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="formality">Formality</Label>
                    <span className="text-sm text-muted-foreground">{settings.formality}%</span>
                  </div>
                  <Slider
                    id="formality"
                    min={0}
                    max={100}
                    step={5}
                    value={[settings.formality]}
                    onValueChange={value => updateSetting('formality', value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="creativity">Creativity</Label>
                    <span className="text-sm text-muted-foreground">{settings.creativity}%</span>
                  </div>
                  <Slider
                    id="creativity"
                    min={0}
                    max={100}
                    step={5}
                    value={[settings.creativity]}
                    onValueChange={value => updateSetting('creativity', value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emotion">Emotional Intensity</Label>
                    <span className="text-sm text-muted-foreground">{settings.emotionIntensity}%</span>
                  </div>
                  <Slider
                    id="emotion"
                    min={0}
                    max={100}
                    step={5}
                    value={[settings.emotionIntensity]}
                    onValueChange={value => updateSetting('emotionIntensity', value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Neutral</span>
                    <span>Emotional</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next: Content Context</Button>
            </div>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={settings.industry}
                  onValueChange={value => updateSetting('industry', value)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={settings.contentType}
                  onValueChange={value => updateSetting('contentType', value)}
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  value={settings.targetAudience}
                  onValueChange={value => updateSetting('targetAudience', value)}
                >
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map(audience => (
                      <SelectItem key={audience.value} value={audience.value}>
                        {audience.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="customPrompt"
                placeholder="Add any specific tone, style, or brand voice instructions here..."
                value={settings.customPrompt}
                onChange={e => updateSetting('customPrompt', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Example: "Use Oxford comma, avoid passive voice, maintain a conversational but professional tone"
              </p>
            </div>
            
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back: Tone Settings
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleGeneratePreview}
                  disabled={isGeneratingPreview}
                >
                  {isGeneratingPreview ? "Generating..." : "Generate Preview"}
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Review & Apply
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium mb-3">Your Content Tone Settings</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium mb-2">Base Tone</h4>
                    <p className="capitalize">{settings.toneType}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium mb-2">Fine-tuning</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Formality</span>
                        <p>{settings.formality}%</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Creativity</span>
                        <p>{settings.creativity}%</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Emotion</span>
                        <p>{settings.emotionIntensity}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium mb-2">Content Context</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Industry</span>
                        <p className="capitalize">{settings.industry.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Content Type</span>
                        <p className="capitalize">{settings.contentType.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Audience</span>
                        <p className="capitalize">{settings.targetAudience.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {settings.customPrompt && (
                    <div className="border rounded-lg p-4 bg-card">
                      <h4 className="font-medium mb-2">Custom Instructions</h4>
                      <p className="text-sm">{settings.customPrompt}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Content Preview</h4>
              {previewText ? (
                <p className="whitespace-pre-line">{previewText}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-muted-foreground mb-2">No preview generated yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGeneratePreview}
                    disabled={isGeneratingPreview}
                  >
                    {isGeneratingPreview ? "Generating..." : "Generate Preview"}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-between gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back: Content Context
              </Button>
              <Button onClick={handleApplySettings}>
                Apply Tone Settings
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Step {step} of 3
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3].map((stepNumber) => (
            <div 
              key={stepNumber}
              className={`w-2 h-2 rounded-full ${
                step >= stepNumber ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}