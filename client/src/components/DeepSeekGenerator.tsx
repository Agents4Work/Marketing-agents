import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, BarChart, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateContent, analyzeContent, isDeepSeekConfigured } from "@/lib/deepseek";
import ApiKeyRequestDialog from "@/components/ApiKeyRequestDialog";

export default function DeepSeekGenerator() {
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const [analysisType, setAnalysisType] = useState<"sentiment" | "keywords" | "seo">("sentiment");
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  
  const { toast } = useToast();
  
  // Check if DeepSeek API key is configured
  useEffect(() => {
    const checkApiKey = async () => {
      setIsCheckingApiKey(true);
      try {
        const configured = await isDeepSeekConfigured();
        setApiKeyConfigured(configured);
      } catch (error) {
        console.error("Error checking DeepSeek API key:", error);
        setApiKeyConfigured(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };
    
    checkApiKey();
  }, []);
  
  // Handle API key dialog close
  const handleApiKeyDialogClose = (apiKey?: string) => {
    setShowApiKeyDialog(false);
    if (apiKey) {
      // If an API key was provided, update the API key status
      setApiKeyConfigured(true);
      toast({
        title: "API Key Configured",
        description: "DeepSeek API key has been set successfully."
      });
    }
  };
  
  // Check API key before performing operations
  const checkAndRequestApiKey = (): boolean => {
    if (!apiKeyConfigured) {
      setShowApiKeyDialog(true);
      return false;
    }
    return true;
  };

  // Handle content generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate content.",
        variant: "destructive"
      });
      return;
    }

    // Check API key before proceeding
    if (!checkAndRequestApiKey()) {
      return;
    }

    setGenerating(true);
    try {
      const result = await generateContent(prompt, {
        temperature,
        max_tokens: maxTokens
      });
      
      if (result.success) {
        setGeneratedContent(result.content);
        toast({
          title: "Content generated",
          description: "DeepSeek AI has generated content based on your prompt."
        });
      } else {
        // If the error indicates that the API key is not configured
        if (result.error?.includes("not configured") || result.error?.includes("API key")) {
          setApiKeyConfigured(false);
          setShowApiKeyDialog(true);
        } else {
          toast({
            title: "Generation failed",
            description: result.error || "Failed to generate content. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handle content analysis
  const handleAnalyze = async () => {
    if (!contentToAnalyze.trim()) {
      toast({
        title: "Empty content",
        description: "Please enter content to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    // Check API key before proceeding
    if (!checkAndRequestApiKey()) {
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeContent(contentToAnalyze, analysisType);
      
      if (result.success) {
        setAnalysisResult(result.analysis);
        toast({
          title: "Analysis complete",
          description: `DeepSeek AI has analyzed your content (${analysisType}).`
        });
      } else {
        // If the error indicates that the API key is not configured
        if (result.error?.includes("not configured") || result.error?.includes("API key")) {
          setApiKeyConfigured(false);
          setShowApiKeyDialog(true);
        } else {
          toast({
            title: "Analysis failed",
            description: result.error || "Failed to analyze content. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Render analysis result based on type
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    switch (analysisType) {
      case "sentiment":
        return (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sentiment Score</h3>
              <div className="flex items-center gap-2">
                {analysisResult.score < 0 ? <ThumbsDown className="h-5 w-5 text-red-500" /> : 
                 analysisResult.score > 0 ? <ThumbsUp className="h-5 w-5 text-green-500" /> : 
                 <BarChart className="h-5 w-5 text-yellow-500" />}
                <span className="font-medium">{analysisResult.score}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Explanation</h3>
              <p className="text-gray-700 dark:text-gray-300">{analysisResult.explanation}</p>
            </div>
          </div>
        );
      
      case "keywords":
        return (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{analysisResult.summary}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Keywords</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysisResult.keywords?.map((keyword: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "seo":
        return (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Strengths</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {analysisResult.strengths?.map((strength: string, index: number) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Weaknesses</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {analysisResult.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Improvements</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {analysisResult.improvements?.map((improvement: string, index: number) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      
      default:
        // For raw/custom analysis output
        return (
          <div className="mt-4">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      {/* API Key Request Dialog */}
      {showApiKeyDialog && (
        <ApiKeyRequestDialog
          apiName="DeepSeek"
          apiKeyName="DEEPSEEK_API_KEY"
          onClose={handleApiKeyDialogClose}
          description="To use DeepSeek AI features, please provide your DeepSeek API key. This key will be stored securely and used only for making requests to the DeepSeek API."
        />
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          DeepSeek AI
          {apiKeyConfigured === false && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 text-xs" 
              onClick={() => setShowApiKeyDialog(true)}
            >
              <Key className="mr-1 h-3 w-3" />
              Set API Key
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Generate high-quality content and analyze text with DeepSeek's advanced AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCheckingApiKey ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <p>Checking API configuration...</p>
          </div>
        ) : apiKeyConfigured === false ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex justify-center">
              <Key className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold">DeepSeek API Key Required</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              To use the DeepSeek AI features, you need to provide a valid API key.
              This key will be stored securely and used only for making requests to DeepSeek.
            </p>
            <Button onClick={() => setShowApiKeyDialog(true)}>
              <Key className="mr-2 h-4 w-4" />
              Configure API Key
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Content</TabsTrigger>
              <TabsTrigger value="analyze">Analyze Content</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter a detailed prompt for content generation..."
                  className="min-h-[100px] resize-y"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(values) => setTemperature(values[0])}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lower values produce more focused, deterministic outputs. Higher values produce more creative, varied outputs.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min={1}
                    max={4096}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum number of tokens to generate. Higher values may produce longer outputs.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={generating || !prompt.trim()} 
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Content</>
                )}
              </Button>

              {generatedContent && (
                <div className="mt-4">
                  <Label htmlFor="generated-content">Generated Content</Label>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="whitespace-pre-wrap">{generatedContent}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-to-analyze">Content to Analyze</Label>
                <Textarea
                  id="content-to-analyze"
                  placeholder="Enter or paste content to analyze..."
                  className="min-h-[150px] resize-y"
                  value={contentToAnalyze}
                  onChange={(e) => setContentToAnalyze(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={analysisType === "sentiment" ? "default" : "outline"}
                    onClick={() => setAnalysisType("sentiment")}
                    className="w-full"
                  >
                    Sentiment
                  </Button>
                  <Button
                    variant={analysisType === "keywords" ? "default" : "outline"}
                    onClick={() => setAnalysisType("keywords")}
                    className="w-full"
                  >
                    Keywords
                  </Button>
                  <Button
                    variant={analysisType === "seo" ? "default" : "outline"}
                    onClick={() => setAnalysisType("seo")}
                    className="w-full"
                  >
                    SEO
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing || !contentToAnalyze.trim()} 
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>Analyze Content</>
                )}
              </Button>

              {analysisResult && (
                <div className="mt-4">
                  <Label>Analysis Results</Label>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    {renderAnalysisResult()}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Powered by DeepSeek's AI models. Results may vary based on the input and model parameters.
        </p>
      </CardFooter>
    </Card>
  );
}