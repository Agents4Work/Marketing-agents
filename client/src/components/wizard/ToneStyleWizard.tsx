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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Check as CheckIcon, 
  ChevronRight as ChevronRightIcon, 
  Wand as WandIcon, 
  BookOpen as BookIcon, 
  RefreshCcw as RefreshCcwIcon, 
  Sparkles as SparklesIcon 
} from 'lucide-react';

interface ToneStyleWizardProps {
  onApply: (settings: ToneStyleSettings) => void;
  initialSettings?: Partial<ToneStyleSettings>;
}

export interface ToneStyleSettings {
  tone: string;
  formality: number;
  creativity: number;
  enthusiasm: number;
  humor: number;
  selectedStyles: string[];
  customInstructions: string;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'informative', label: 'Informative' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'casual', label: 'Casual' }
];

const STYLE_OPTIONS = [
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'data-driven', label: 'Data-driven' },
  { value: 'action-oriented', label: 'Action-oriented' },
  { value: 'educational', label: 'Educational' },
  { value: 'direct', label: 'Direct' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'comparative', label: 'Comparative' },
  { value: 'solution-focused', label: 'Solution-focused' },
  { value: 'testimonial', label: 'Testimonial-based' },
  { value: 'question-based', label: 'Question-based' }
];

const PRESETS = {
  'brand-awareness': {
    tone: 'enthusiastic',
    formality: 60,
    creativity: 80,
    enthusiasm: 90,
    humor: 30,
    selectedStyles: ['storytelling', 'inspirational'],
    customInstructions: 'Focus on brand values and unique selling points.'
  },
  'lead-generation': {
    tone: 'persuasive',
    formality: 70,
    creativity: 60,
    enthusiasm: 75,
    humor: 20,
    selectedStyles: ['action-oriented', 'direct', 'solution-focused'],
    customInstructions: 'Focus on clear CTAs and addressing pain points.'
  },
  'thought-leadership': {
    tone: 'authoritative',
    formality: 85,
    creativity: 50,
    enthusiasm: 50,
    humor: 10,
    selectedStyles: ['data-driven', 'educational'],
    customInstructions: 'Include industry insights and establish expertise.'
  },
  'social-engagement': {
    tone: 'conversational',
    formality: 30,
    creativity: 85,
    enthusiasm: 85,
    humor: 70,
    selectedStyles: ['question-based', 'storytelling'],
    customInstructions: 'Create content that encourages comments and shares.'
  },
  'seo-optimization': {
    tone: 'informative',
    formality: 65,
    creativity: 40,
    enthusiasm: 40, 
    humor: 15,
    selectedStyles: ['educational', 'comparative'],
    customInstructions: 'Incorporate relevant keywords naturally while providing value.'
  }
};

const ToneStyleWizard: React.FC<ToneStyleWizardProps> = ({ 
  onApply, 
  initialSettings 
}) => {
  const [activeTab, setActiveTab] = useState('customize');
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  const [settings, setSettings] = useState<ToneStyleSettings>({
    tone: initialSettings?.tone || 'professional',
    formality: initialSettings?.formality || 50,
    creativity: initialSettings?.creativity || 50,
    enthusiasm: initialSettings?.enthusiasm || 50,
    humor: initialSettings?.humor || 30,
    selectedStyles: initialSettings?.selectedStyles || [],
    customInstructions: initialSettings?.customInstructions || ''
  });

  const handleToneChange = (value: string) => {
    setSettings({ ...settings, tone: value });
  };

  const handleSliderChange = (name: keyof ToneStyleSettings, value: number[]) => {
    setSettings({ ...settings, [name]: value[0] });
  };

  const handleStyleToggle = (style: string) => {
    const selectedStyles = [...settings.selectedStyles];
    if (selectedStyles.includes(style)) {
      setSettings({ 
        ...settings, 
        selectedStyles: selectedStyles.filter(s => s !== style) 
      });
    } else {
      setSettings({ 
        ...settings, 
        selectedStyles: [...selectedStyles, style] 
      });
    }
  };

  const handleCustomInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings({ ...settings, customInstructions: e.target.value });
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    setSettings(PRESETS[presetKey]);
  };

  const generatePreview = async () => {
    setPreviewLoading(true);
    // Simulate API call for preview generation
    setTimeout(() => {
      const toneDescription = TONE_OPTIONS.find(t => t.value === settings.tone)?.label;
      const selectedStylesLabels = settings.selectedStyles
        .map(style => STYLE_OPTIONS.find(s => s.value === style)?.label)
        .join(', ');

      setPreviewContent(`This is a preview of content with a ${toneDescription} tone.
      
The formality level is ${settings.formality > 70 ? 'high' : settings.formality > 40 ? 'moderate' : 'low'}.
Creativity is set to ${settings.creativity > 70 ? 'high' : settings.creativity > 40 ? 'moderate' : 'low'}.
Enthusiasm level is ${settings.enthusiasm > 70 ? 'high' : settings.enthusiasm > 40 ? 'moderate' : 'low'}.
Humor level is ${settings.humor > 70 ? 'high' : settings.humor > 40 ? 'moderate' : 'low'}.

The content uses the following styles: ${selectedStylesLabels || 'none specified'}.

Custom instructions: ${settings.customInstructions || 'none provided'}`);
      
      setPreviewLoading(false);
      setShowPreview(true);
    }, 1500);
  };

  const handleApply = () => {
    onApply(settings);
  };

  const getValueLabel = (value: number) => {
    if (value < 34) return 'Low';
    if (value < 67) return 'Medium';
    return 'High';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandIcon className="h-5 w-5 text-purple-500" />
          <span>Content Tone & Style Wizard</span>
        </CardTitle>
        <CardDescription>
          Customize how your AI-generated content sounds and feels
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="customize" className="flex items-center gap-1">
              <SparklesIcon className="h-4 w-4" />
              <span>Customize</span>
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center gap-1">
              <BookIcon className="h-4 w-4" />
              <span>Use Presets</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="customize" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Voice Tone</h3>
                <Select 
                  value={settings.tone} 
                  onValueChange={handleToneChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-3">Tone Adjustments</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <Label>Formality</Label>
                      <Badge variant="outline">{getValueLabel(settings.formality)}</Badge>
                    </div>
                    <Slider 
                      value={[settings.formality]} 
                      min={0} 
                      max={100} 
                      step={5}
                      onValueChange={(value) => handleSliderChange('formality', value)} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Casual</span>
                      <span>Formal</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <Label>Creativity</Label>
                      <Badge variant="outline">{getValueLabel(settings.creativity)}</Badge>
                    </div>
                    <Slider 
                      value={[settings.creativity]} 
                      min={0} 
                      max={100} 
                      step={5}
                      onValueChange={(value) => handleSliderChange('creativity', value)} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <Label>Enthusiasm</Label>
                      <Badge variant="outline">{getValueLabel(settings.enthusiasm)}</Badge>
                    </div>
                    <Slider 
                      value={[settings.enthusiasm]} 
                      min={0} 
                      max={100} 
                      step={5}
                      onValueChange={(value) => handleSliderChange('enthusiasm', value)} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Reserved</span>
                      <span>Enthusiastic</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <Label>Humor</Label>
                      <Badge variant="outline">{getValueLabel(settings.humor)}</Badge>
                    </div>
                    <Slider 
                      value={[settings.humor]} 
                      min={0} 
                      max={100} 
                      step={5}
                      onValueChange={(value) => handleSliderChange('humor', value)} 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Serious</span>
                      <span>Humorous</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Content Style</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Select writing styles for your content (up to 3)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <div
                      key={style.value}
                      className={`
                        border rounded-md px-3 py-2 cursor-pointer flex items-center 
                        ${settings.selectedStyles.includes(style.value) 
                          ? 'bg-primary/10 border-primary' 
                          : 'border-border hover:bg-muted'}
                        ${settings.selectedStyles.length >= 3 && !settings.selectedStyles.includes(style.value) 
                          ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => {
                        if (settings.selectedStyles.includes(style.value) || settings.selectedStyles.length < 3) {
                          handleStyleToggle(style.value);
                        }
                      }}
                    >
                      {settings.selectedStyles.includes(style.value) && (
                        <CheckIcon className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      )}
                      <span className={settings.selectedStyles.includes(style.value) ? "font-medium" : ""}>
                        {style.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Custom Instructions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add specific instructions for the AI to follow when generating content
                </p>
                <Textarea 
                  placeholder="e.g., Focus on benefits rather than features, include customer pain points, etc."
                  value={settings.customInstructions}
                  onChange={handleCustomInstructionsChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-6">
            <p className="text-sm text-muted-foreground mb-3">
              Choose a preset for different marketing objectives
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5"
                  onClick={() => applyPreset(key)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium capitalize">
                      {key.split('-').join(' ')}
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyPreset(key);
                      }}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {PRESETS[key].customInstructions}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {TONE_OPTIONS.find(t => t.value === PRESETS[key].tone)?.label}
                    </Badge>
                    {PRESETS[key].selectedStyles.slice(0, 2).map((style) => (
                      <Badge key={style} variant="outline" className="text-xs">
                        {STYLE_OPTIONS.find(s => s.value === style)?.label}
                      </Badge>
                    ))}
                    {PRESETS[key].selectedStyles.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{PRESETS[key].selectedStyles.length - 2} more
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button 
            variant="outline"
            className="mr-2"
            onClick={generatePreview}
            disabled={previewLoading}
          >
            {previewLoading ? (
              <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <SparklesIcon className="h-4 w-4 mr-2" />
            )}
            Generate Preview
          </Button>
          
          <Button onClick={handleApply}>
            <CheckIcon className="h-4 w-4 mr-2" />
            Apply Settings
          </Button>
        </div>
        
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 border rounded-md bg-muted/50"
          >
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <SparklesIcon className="h-4 w-4 mr-2 text-primary" />
              Content Preview
            </h3>
            <p className="whitespace-pre-line text-sm">{previewContent}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToneStyleWizard;