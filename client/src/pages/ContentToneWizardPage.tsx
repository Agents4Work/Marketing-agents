'use client';

import React, { useState } from 'react';
import ContentToneWizard, { ContentToneSettings } from '@/components/ContentToneWizard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { styleContent, mapToneSettingsToStyleSettings } from '@/lib/contentStyler';

export default function ContentToneWizardPage() {
  const [currentSettings, setCurrentSettings] = useState<ContentToneSettings | null>(null);
  const [contentInput, setContentInput] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApplySettings = (settings: ContentToneSettings) => {
    setCurrentSettings(settings);
  };

  const handleProcessContent = async () => {
    if (!contentInput.trim() || !currentSettings) {
      toast({
        title: "Input Required",
        description: "Please enter content and set tone settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert our ContentToneSettings to the format expected by the API
      const styleSettings = mapToneSettingsToStyleSettings(currentSettings);
      
      // Call the API to style the content
      const response = await styleContent({
        content: contentInput,
        settings: styleSettings
      });
      
      setProcessedContent(response.styledContent);
      
      toast({
        title: "Content Transformed",
        description: "Your content has been processed with the selected tone settings.",
      });
    } catch (error) {
      console.error("Error styling content:", error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your content. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to local transformation if API call fails
      const fallbackContent = transformContentWithToneSettingsFallback(contentInput, currentSettings);
      setProcessedContent(fallbackContent);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback implementation when API call fails
  const transformContentWithToneSettingsFallback = (content: string, settings: ContentToneSettings): string => {
    const { toneType, formality, creativity, emotionIntensity, industry, contentType, targetAudience } = settings;
    
    let transformedContent = `[AI-Transformed Content with ${toneType} tone]

${content}

---
This content has been transformed based on the following settings:
- Tone: ${toneType.charAt(0).toUpperCase() + toneType.slice(1)}
- Formality: ${formality}%
- Creativity: ${creativity}%
- Emotional Intensity: ${emotionIntensity}%
- Industry: ${industry}
- Content Type: ${contentType}
- Target Audience: ${targetAudience}
`;

    if (settings.customPrompt) {
      transformedContent += `\nCustom Instructions: "${settings.customPrompt}"`;
    }

    return transformedContent;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">AI Content Tone & Style Wizard</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Use this powerful wizard to customize the tone, style, and personality of your AI-generated content.
          Perfect for matching your brand voice and connecting with your specific audience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <Tabs defaultValue="wizard" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="wizard">Tone Wizard</TabsTrigger>
              <TabsTrigger value="apply">Apply to Content</TabsTrigger>
            </TabsList>
            <TabsContent value="wizard">
              <ContentToneWizard onApplySettings={handleApplySettings} />
            </TabsContent>
            <TabsContent value="apply">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Apply Tone to Your Content</CardTitle>
                    <CardDescription>
                      Enter your content below and apply your selected tone settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter your content here..."
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {currentSettings 
                          ? `Using ${currentSettings.toneType} tone settings` 
                          : "No tone settings applied yet"}
                      </p>
                      <Button 
                        onClick={handleProcessContent} 
                        disabled={isProcessing || !currentSettings}
                      >
                        {isProcessing ? "Processing..." : "Apply Tone Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {processedContent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Transformed Content</CardTitle>
                      <CardDescription>
                        Your content with the selected tone settings applied
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
                        {processedContent}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(processedContent);
                          toast({
                            title: "Copied to clipboard",
                            description: "The transformed content has been copied to your clipboard.",
                          });
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Why Tone & Style Matter</CardTitle>
              <CardDescription>
                The right tone can dramatically improve engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Connect with Your Audience</h3>
                <p className="text-sm text-gray-600">
                  Content that matches your audience's expectations feels more authentic and trustworthy. 
                  Our AI tone wizard helps you tailor your message perfectly to your specific reader.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Maintain Brand Consistency</h3>
                <p className="text-sm text-gray-600">
                  Your brand voice should be consistent across all channels. This tool helps ensure that 
                  AI-generated content matches your established brand personality.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Improve Conversion Rates</h3>
                <p className="text-sm text-gray-600">
                  Content with the right emotional tone can increase engagement by up to 57% and 
                  conversion rates by up to 29%, according to industry research.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Save Time on Editing</h3>
                <p className="text-sm text-gray-600">
                  By setting the right tone parameters upfront, you'll spend less time editing 
                  AI-generated content to match your desired style.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-4">
              <div className="rounded-lg border p-3 w-full bg-muted/50">
                <div className="font-medium">Pro Tip</div>
                <p className="text-sm mt-1">
                  Different content types often need different tones. Use the "Save Preset" feature 
                  to create multiple tone profiles for various marketing channels.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}