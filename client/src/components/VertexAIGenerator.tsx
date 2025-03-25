import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, AlertCircle, CheckCircle2, ServerCog, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { 
  generateContent, 
  generateContentBatch,
  analyzeContent,
  analyzeContentBatch,
  checkVertexAIHealth, 
  isVertexAIConfigured,
  getSupportedModels,
  type VertexAIModel
} from "@/lib/vertexai";

import ApiKeyRequestDialog, { type ApiKeyField } from './ApiKeyRequestDialog';

export default function VertexAIGenerator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [batchPrompts, setBatchPrompts] = useState("");
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("single");
  const [selectedModel, setSelectedModel] = useState<string>("text-bison");
  const [availableModels, setAvailableModels] = useState<VertexAIModel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'sentiment' | 'keywords' | 'seo' | 'market' | 'brand'>('sentiment');
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 1024,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isMissingKeys, setIsMissingKeys] = useState(false);
  const [isCheckingKeys, setIsCheckingKeys] = useState(true);
  const [configuredKeys, setConfiguredKeys] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  // Check if the API keys are configured and load available models
  useEffect(() => {
    const checkApiKeys = async () => {
      setIsCheckingKeys(true);
      try {
        const isConfigured = await isVertexAIConfigured();
        setConfiguredKeys(isConfigured);
        setIsMissingKeys(!isConfigured);
        
        // If configured, fetch the available models
        if (isConfigured) {
          try {
            const modelsResponse = await getSupportedModels();
            if (modelsResponse.success && modelsResponse.models) {
              setAvailableModels(modelsResponse.models);
              // Set the default model to the first one if available
              if (modelsResponse.models.length > 0) {
                setSelectedModel(modelsResponse.models[0].id);
              }
            }
          } catch (modelError) {
            console.error("Error fetching models:", modelError);
          }
        }
      } catch (error) {
        console.error("Error checking API configuration:", error);
        setIsMissingKeys(true);
      } finally {
        setIsCheckingKeys(false);
      }
    };

    checkApiKeys();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateContent({
        prompt: prompt,
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens,
      });

      if (response.success && response.content) {
        setResult(response.content);
      } else {
        toast({
          title: "Generation Failed",
          description: response.error || "Failed to generate content.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analyzeContent({
        content: prompt,
        type: analysisType,
      });

      if (response.success && response.analysis) {
        // Format the analysis result based on its type
        let formattedResult = '';
        
        if (response.analysis.raw) {
          // Fallback for raw text response
          formattedResult = response.analysis.raw;
        } else {
          switch (analysisType) {
            case 'sentiment':
              formattedResult = `Sentiment Score: ${response.analysis.score}\n\n${response.analysis.explanation}`;
              break;
            case 'keywords':
              formattedResult = `Summary: ${response.analysis.summary}\n\nKeywords:\n${response.analysis.keywords?.join('\n') || 'No keywords found'}`;
              break;
            case 'seo':
              formattedResult = `SEO Analysis\n\nStrengths:\n${response.analysis.strengths?.join('\n') || 'No strengths found'}\n\nWeaknesses:\n${response.analysis.weaknesses?.join('\n') || 'No weaknesses found'}\n\nImprovements:\n${response.analysis.improvements?.join('\n') || 'No improvements found'}`;
              break;
            default:
              formattedResult = JSON.stringify(response.analysis, null, 2);
          }
        }
        
        setResult(formattedResult);
      } else {
        toast({
          title: "Analysis Failed",
          description: response.error || "Failed to analyze content.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error analyzing content:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeySubmit = async () => {
    // Close the dialog
    setShowKeyDialog(false);
    
    // Check if keys are configured now
    setIsCheckingKeys(true);
    try {
      const isConfigured = await isVertexAIConfigured();
      setConfiguredKeys(isConfigured);
      setIsMissingKeys(!isConfigured);
      
      if (isConfigured) {
        toast({
          title: "Success",
          description: "Google Vertex AI is now configured and ready to use.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking API configuration:", error);
    } finally {
      setIsCheckingKeys(false);
    }
  };

  // Function to handle batch generation
  const handleBatchGenerate = async () => {
    if (!batchPrompts.trim()) {
      toast({
        title: "Empty Prompts",
        description: "Please enter prompts for batch generation.",
        variant: "destructive",
      });
      return;
    }

    // Split by newline to get separate prompts
    const promptArray = batchPrompts.split('\n').filter(p => p.trim().length > 0);
    
    if (promptArray.length === 0) {
      toast({
        title: "No Valid Prompts",
        description: "Please enter at least one valid prompt.",
        variant: "destructive",
      });
      return;
    }
    
    if (promptArray.length > 50) {
      toast({
        title: "Too Many Prompts",
        description: "For performance reasons, please limit batch processing to 50 prompts at a time.",
        variant: "destructive",
      });
      return;
    }

    setIsBatchProcessing(true);
    setBatchResults([]);
    
    try {
      const response = await generateContentBatch({
        prompts: promptArray,
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens,
        model: selectedModel
      });

      if (response.success) {
        // Format the results - check both results and contents fields for backward compatibility
        const resultsArray = response.results || response.contents || [];
        setBatchResults(resultsArray);
        toast({
          title: "Batch Processing Complete",
          description: `Successfully processed ${resultsArray.length} out of ${promptArray.length} prompts.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Batch Processing Failed",
          description: response.errors?.[0]?.error || response.error || "Failed to process batch content.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error processing batch:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during batch processing.",
        variant: "destructive",
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Function to handle batch analysis
  const handleBatchAnalyze = async () => {
    if (!batchPrompts.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter content items for batch analysis.",
        variant: "destructive",
      });
      return;
    }

    // Split by double newline to get separate content items
    const contentArray = batchPrompts.split('\n\n').filter(c => c.trim().length > 0);
    
    if (contentArray.length === 0) {
      toast({
        title: "No Valid Content",
        description: "Please enter at least one valid content item. Separate items with double newlines.",
        variant: "destructive",
      });
      return;
    }
    
    if (contentArray.length > 20) {
      toast({
        title: "Too Many Items",
        description: "For performance reasons, please limit batch analysis to 20 items at a time.",
        variant: "destructive",
      });
      return;
    }

    setIsBatchProcessing(true);
    setBatchResults([]);
    
    try {
      const response = await analyzeContentBatch({
        contents: contentArray,
        type: analysisType,
        model: selectedModel
      });

      if (response.success && response.results) {
        // Format the results
        const formattedResults = response.results.map((result, index) => {
          let formattedResult = `ITEM ${index + 1}:\n`;
          
          if (typeof result === 'string') {
            formattedResult += result;
          } else {
            // Check if there are direct properties on the result
            if (result.raw) {
              formattedResult += result.raw;
            } else if (result.score !== undefined && result.explanation) {
              // For sentiment directly on result
              formattedResult += `Sentiment Score: ${result.score}\n\n${result.explanation}`;
            } else if (result.keywords && result.summary) {
              // For keywords directly on result
              formattedResult += `Summary: ${result.summary}\n\nKeywords:\n${result.keywords.join('\n') || 'No keywords found'}`;
            } else if (result.strengths && result.weaknesses) {
              // For SEO directly on result
              formattedResult += `SEO Analysis\n\nStrengths:\n${result.strengths.join('\n') || 'No strengths found'}\n\nWeaknesses:\n${result.weaknesses.join('\n') || 'No weaknesses found'}\n\nImprovements:\n${result.improvements?.join('\n') || 'No improvements found'}`;
            } else if (result.analysis) {
              // If the properties are nested under analysis
              const analysis = result.analysis;
              switch (analysisType) {
                case 'sentiment':
                  formattedResult += `Sentiment Score: ${analysis.score}\n\n${analysis.explanation}`;
                  break;
                case 'keywords':
                  formattedResult += `Summary: ${analysis.summary}\n\nKeywords:\n${analysis.keywords?.join('\n') || 'No keywords found'}`;
                  break;
                case 'seo':
                  formattedResult += `SEO Analysis\n\nStrengths:\n${analysis.strengths?.join('\n') || 'No strengths found'}\n\nWeaknesses:\n${analysis.weaknesses?.join('\n') || 'No weaknesses found'}\n\nImprovements:\n${analysis.improvements?.join('\n') || 'No improvements found'}`;
                  break;
                default:
                  formattedResult += JSON.stringify(analysis, null, 2);
              }
            } else {
              // Fallback to stringifying the entire result
              formattedResult += JSON.stringify(result, null, 2);
            }
          }
          
          return formattedResult;
        });
        
        setBatchResults(formattedResults);
        toast({
          title: "Batch Analysis Complete",
          description: `Successfully analyzed ${response.results.length} out of ${contentArray.length} content items.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Batch Analysis Failed",
          description: response.errors?.[0]?.error || response.error || "Failed to analyze batch content.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error analyzing batch:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during batch analysis.",
        variant: "destructive",
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {isCheckingKeys ? (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <AlertTitle>Checking API configuration...</AlertTitle>
          <AlertDescription>
            Verifying Google Vertex AI credentials.
          </AlertDescription>
        </Alert>
      ) : isMissingKeys ? (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>API Keys Missing</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Google Vertex AI credentials are not configured. You need to configure your API keys to use this feature.</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowKeyDialog(true)}
              className="ml-2"
            >
              Configure API Keys
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Google Vertex AI Connected</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Generate content and analyze text using Google's Vertex AI API.</span>
            {availableModels.length > 0 && (
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center">
            <span>Single Request</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center">
            <Layers className="mr-2 h-4 w-4" />
            <span>Batch Processing</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="prompt">Enter text prompt or content for analysis</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowSettings(!showSettings)}
                        className={showSettings ? "bg-gray-100" : ""}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configure generation settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                className="h-48 mb-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              
              {showSettings && (
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
                        </div>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[settings.temperature]}
                          onValueChange={(value) => setSettings({...settings, temperature: value[0]})}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Precise (0.0)</span>
                          <span>Creative (1.0)</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="maxTokens">Max Output Length: {settings.maxTokens}</Label>
                        </div>
                        <Slider
                          id="maxTokens"
                          min={128}
                          max={2048}
                          step={128}
                          value={[settings.maxTokens]}
                          onValueChange={(value) => setSettings({...settings, maxTokens: value[0]})}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Short (128)</span>
                          <span>Long (2048)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex items-center space-x-4">
                <Select 
                  value={analysisType} 
                  onValueChange={(value) => setAnalysisType(value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Analysis Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="seo">SEO Analysis</SelectItem>
                    <SelectItem value="market">Market Analysis</SelectItem>
                    <SelectItem value="brand">Brand Impact</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  disabled={isAnalyzing || isMissingKeys || isCheckingKeys}
                  onClick={handleAnalyze}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : "Analyze Text"}
                </Button>
                
                <Button 
                  variant="default"
                  disabled={isGenerating || isMissingKeys || isCheckingKeys}
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Content"}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="result">Result</Label>
              <Textarea
                id="result"
                placeholder="Generated content or analysis will appear here..."
                className="h-96 resize-none font-mono"
                value={result}
                readOnly
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="batch" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="batchPrompts">
                  {activeTab === "batch" ? (
                    <div className="flex items-center">
                      <Layers className="mr-2 h-4 w-4" />
                      <span>Enter multiple prompts/content (one per line)</span>
                    </div>
                  ) : (
                    "Enter multiple prompts/content (one per line)"
                  )}
                </Label>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowSettings(!showSettings)}
                        className={showSettings ? "bg-gray-100" : ""}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configure generation settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Textarea
                id="batchPrompts"
                placeholder="Enter multiple prompts, one per line. For analysis, separate content items with double newlines (press Enter twice)."
                className="h-64 mb-2"
                value={batchPrompts}
                onChange={(e) => setBatchPrompts(e.target.value)}
              />
              
              {showSettings && (
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
                        </div>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[settings.temperature]}
                          onValueChange={(value) => setSettings({...settings, temperature: value[0]})}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Precise (0.0)</span>
                          <span>Creative (1.0)</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="maxTokens">Max Output Length: {settings.maxTokens}</Label>
                        </div>
                        <Slider
                          id="maxTokens"
                          min={128}
                          max={2048}
                          step={128}
                          value={[settings.maxTokens]}
                          onValueChange={(value) => setSettings({...settings, maxTokens: value[0]})}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Short (128)</span>
                          <span>Long (2048)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex items-center space-x-4">
                <Select 
                  value={analysisType} 
                  onValueChange={(value) => setAnalysisType(value as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Analysis Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="seo">SEO Analysis</SelectItem>
                    <SelectItem value="market">Market Analysis</SelectItem>
                    <SelectItem value="brand">Brand Impact</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  disabled={isBatchProcessing || isMissingKeys || isCheckingKeys}
                  onClick={handleBatchAnalyze}
                  className="flex-1"
                >
                  {isBatchProcessing && isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Batch...
                    </>
                  ) : "Batch Analyze"}
                </Button>
                
                <Button 
                  variant="default"
                  disabled={isBatchProcessing || isMissingKeys || isCheckingKeys}
                  onClick={handleBatchGenerate}
                  className="flex-1"
                >
                  {isBatchProcessing && !isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Batch...
                    </>
                  ) : "Batch Generate"}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="batchResults">Batch Results</Label>
              <div className="border rounded-md p-4 h-96 overflow-auto font-mono text-sm bg-gray-50">
                {batchResults.length === 0 ? (
                  <div className="text-gray-400 italic">
                    Processed batch results will appear here...
                  </div>
                ) : (
                  batchResults.map((result, index) => (
                    <div key={index} className="mb-4 pb-4 border-b last:border-0">
                      <div className="font-bold text-blue-600 mb-1">Result {index + 1}:</div>
                      <div className="whitespace-pre-wrap">{result}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-start">
              <ServerCog className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Enterprise-Grade Batch Processing</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This feature leverages Google's Vertex AI for high-performance batch operations, enabling 
                  processing of large volumes of content with automatic parallelization, retries, and caching. 
                  Ideal for enterprise-scale data processing requirements.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {showKeyDialog && (
        <ApiKeyRequestDialog 
          title="Configure Google Vertex AI"
          description="To use Google Vertex AI, you need to provide the following credentials from your Google Cloud account."
          fields={[
            {
              name: "GOOGLE_ACCESS_TOKEN",
              label: "Google Access Token",
              description: "Authentication token for Google Cloud API access"
            },
            {
              name: "GOOGLE_CLOUD_PROJECT_ID",
              label: "Google Cloud Project ID",
              description: "Your Google Cloud project identifier"
            },
            {
              name: "GOOGLE_CLOUD_LOCATION",
              label: "Google Cloud Location",
              description: "Default: us-central1",
              defaultValue: "us-central1",
              optional: true
            }
          ]}
          onClose={() => setShowKeyDialog(false)}
          onSubmit={handleKeySubmit}
        />
      )}
    </div>
  );
}