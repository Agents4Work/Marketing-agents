'use client';

import React, { useState } from 'react';
import ToneStyleWizard, { ToneStyleSettings } from '@/components/wizard/ToneStyleWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Copy,
  CheckCircle2,
  RotateCcw,
  Loader2,
  PenLine
} from 'lucide-react';

export default function ContentStyler() {
  const { toast } = useToast();
  const [contentInput, setContentInput] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [toneSettings, setToneSettings] = useState<ToneStyleSettings>({
    tone: 'professional',
    formality: 60,
    creativity: 50,
    enthusiasm: 50,
    humor: 30,
    selectedStyles: ['data-driven', 'solution-focused'],
    customInstructions: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToneSettingsApply = (settings: ToneStyleSettings) => {
    setToneSettings(settings);
    setShowWizard(false);
    toast({
      title: "Tone & Style Updated",
      description: "Your content style preferences have been applied.",
    });
  };

  const handleGenerateContent = async () => {
    if (!contentInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some content ideas or text to style.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // In a real implementation, we would send the content and tone settings to an API
    // For now, we'll simulate an API call with setTimeout
    setTimeout(() => {
      const toneLabel = toneSettings.tone.charAt(0).toUpperCase() + toneSettings.tone.slice(1);
      const formalityLevel = toneSettings.formality > 70 ? 'formal' : toneSettings.formality > 40 ? 'balanced' : 'casual';
      const creativityLevel = toneSettings.creativity > 70 ? 'highly creative' : toneSettings.creativity > 40 ? 'moderately creative' : 'conservative';
      const enthusiasmLevel = toneSettings.enthusiasm > 70 ? 'enthusiastic' : toneSettings.enthusiasm > 40 ? 'engaged' : 'reserved';
      const humorLevel = toneSettings.humor > 70 ? 'humorous' : toneSettings.humor > 40 ? 'light-hearted' : 'serious';
      
      // Generate a styled version of the input based on tone settings
      let styled = '';
      
      if (contentTitle) {
        styled += `# ${contentTitle}\n\n`;
      }
      
      if (toneSettings.tone === 'professional') {
        styled += `${contentInput}\n\nFurthermore, it's worth noting that our approach provides measurable results. We've observed significant improvements in performance metrics across multiple case studies.`;
      } else if (toneSettings.tone === 'conversational') {
        styled += `Hey there! ${contentInput}\n\nYou know what's really cool about this? It actually works! We've seen amazing results with clients just like you.`;
      } else if (toneSettings.tone === 'enthusiastic') {
        styled += `Wow! This is amazing! ${contentInput}\n\nWe're absolutely thrilled about the incredible results this can bring to your business! You won't believe the transformation!`;
      } else if (toneSettings.tone === 'informative') {
        styled += `${contentInput}\n\nStudies indicate that this approach leads to a 37% improvement in overall effectiveness. Research from industry leaders supports these findings.`;
      } else if (toneSettings.tone === 'persuasive') {
        styled += `Imagine the possibilities: ${contentInput}\n\nDon't miss this opportunity to transform your results. The benefits are clear, and the time to act is now.`;
      } else if (toneSettings.tone === 'authoritative') {
        styled += `${contentInput}\n\nExpert analysis confirms these findings. Our decade of experience in the industry validates this approach as the definitive solution for forward-thinking organizations.`;
      } else if (toneSettings.tone === 'empathetic') {
        styled += `We understand the challenges you're facing. ${contentInput}\n\nYou're not alone in this journey, and we're here to help every step of the way.`;
      } else if (toneSettings.tone === 'casual') {
        styled += `Just thinking out loud here... ${contentInput}\n\nPretty cool, right? Let's grab a coffee sometime and chat more about it!`;
      }
      
      if (toneSettings.customInstructions) {
        styled += `\n\n${toneSettings.customInstructions}`;
      }
      
      setGeneratedContent(styled);
      setIsGenerating(false);
      
      toast({
        title: "Content Generated",
        description: `Your content has been styled with a ${toneLabel.toLowerCase()} tone.`,
      });
    }, 2000);
  };

  const handleCopyContent = () => {
    if (!generatedContent) return;
    
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    
    toast({
      title: "Copied to Clipboard",
      description: "Your styled content has been copied to the clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleReset = () => {
    setContentInput('');
    setContentTitle('');
    setGeneratedContent('');
    setToneSettings({
      tone: 'professional',
      formality: 60,
      creativity: 50,
      enthusiasm: 50,
      humor: 30,
      selectedStyles: ['data-driven', 'solution-focused'],
      customInstructions: ''
    });
    
    toast({
      title: "Reset Complete",
      description: "All content and settings have been reset to default.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">AI Content Styler</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Customize the tone and style of your marketing content using AI
      </p>
      
      {!showWizard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-primary" />
                  <span>Content Input</span>
                </CardTitle>
                <CardDescription>
                  Enter content to style or a brief of what you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your content"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your content or describe what you'd like to create..."
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Current Tone & Style</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWizard(true)}
                      className="text-xs h-8"
                    >
                      Customize
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">Tone:</span>
                      <span className="capitalize">{toneSettings.tone}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Formality:</span>
                      <span>{toneSettings.formality}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Creativity:</span>
                      <span>{toneSettings.creativity}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Styles:</span>
                      <span className="text-right capitalize">
                        {toneSettings.selectedStyles.length ? 
                          toneSettings.selectedStyles.join(', ').replace(/-/g, ' ') : 
                          'None specified'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="sm:w-auto w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !contentInput.trim()}
                    className="sm:w-auto w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Styled Content</span>
                </CardTitle>
                <CardDescription>
                  AI-generated content based on your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedContent ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <div className="border rounded-md p-4 min-h-[200px] bg-card whitespace-pre-line">
                      {generatedContent}
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleCopyContent}
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-dashed rounded-md p-4 min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                    <p className="mb-1">Your styled content will appear here</p>
                    <p className="text-sm">Enter your content and click "Generate" to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ToneStyleWizard
            onApply={handleToneSettingsApply}
            initialSettings={toneSettings}
          />
          
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowWizard(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}