import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, BarChart2, Search, LineChart, ArrowRight, RefreshCcw, CheckCircle, AlertCircle, Info } from "lucide-react";
import SidebarOptimized from "@/components/SidebarOptimized";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconUpload } from "@tabler/icons-react";
import { FileUpload } from "../components/ui/FileUpload";
import Modern3DCard from "@/components/ui/modern-3d-card";
import Modern3DButton from "@/components/ui/modern-3d-button";
import { SHADOWS, BORDERS, CARD_3D_STYLES, BUTTON_3D_STYLES } from "@/styles/modern-3d-design-system";

// Import file upload component from the provided code
function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

// AI Instruction that should be applied to all analyses
const aiInstructionText = `AI should follow the structured workflow, but if it detects opportunities to enhance clarity, engagement, or user experience, it can intelligently optimize responses within the user's intent. AI must not override the core structure or introduce unnecessary complexity.`;

// Define types for our components and results
type InsightCardProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
};

type ScoreIndicatorProps = {
  score: number;
  label: string;
};

type HeadlineResult = {
  headline: string;
  score: number;
  rank: number;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
};

type HeadlineResults = {
  scores: HeadlineResult[];
  overallScore: number;
};

type AdResults = {
  overallScore: number;
  ctrScore: number;
  engagementScore: number;
  clarityScore: number;
  analysis: string;
  improvements: string[];
  improvedVersion: string;
};

type CompetitorResults = {
  overallScore: number;
  seoScore: number;
  brandingScore: number;
  contentScore: number;
  analysis: string;
  strategies: string[];
  topKeywords: string[];
};

// Card component for showing AI insights with 3D styling
function InsightCard({ title, children, variant = "default" }: InsightCardProps) {
  const getAccentColor = () => {
    switch (variant) {
      case "success": return "bg-green-500";
      case "warning": return "bg-amber-500";
      case "info": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };
  
  const getTextColor = () => {
    switch (variant) {
      case "success": return "text-green-700 dark:text-green-300";
      case "warning": return "text-amber-700 dark:text-amber-300";
      case "info": return "text-blue-700 dark:text-blue-300";
      default: return "text-gray-700 dark:text-gray-300";
    }
  };
  
  const getIcon = () => {
    switch (variant) {
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      default: return null;
    }
  };
  
  const getBorderColor = () => {
    switch (variant) {
      case "success": return "border-green-200 dark:border-green-800";
      case "warning": return "border-amber-200 dark:border-amber-800";
      case "info": return "border-blue-200 dark:border-blue-800";
      default: return "border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className={`relative mb-6 transform transition-all duration-200 hover:scale-[1.01] hover:-translate-y-0.5 ${SHADOWS.sm} group overflow-hidden`}>
      <div className={`absolute h-full w-1.5 left-0 top-0 ${getAccentColor()}`}></div>
      <div className={`p-4 rounded-lg ${BORDERS.sm} ${getBorderColor()} bg-white dark:bg-gray-800 shadow-sm`}>
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <h3 className={`font-medium ${getTextColor()}`}>{title}</h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400">{children}</div>
        
        {/* 3D effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-white/10 to-transparent transition-opacity rounded-lg"></div>
      </div>
    </div>
  );
}

// Score indicator component with 3D styling
function ScoreIndicator({ score, label }: ScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-blue-600";
    if (score >= 40) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };
  
  const getTextColor = () => {
    return "text-white";
  };
  
  const getBorderColor = () => {
    if (score >= 80) return "border-green-600";
    if (score >= 60) return "border-blue-600";
    if (score >= 40) return "border-amber-600";
    return "border-red-600";
  };

  return (
    <div className={`relative transform transition-all duration-200 hover:scale-105 hover:-translate-y-1 ${SHADOWS.md} group`}>
      <div className={`text-center p-4 rounded-lg ${BORDERS.sm} ${getBorderColor()} 
        bg-gradient-to-br ${getColor()} ${getTextColor()} group-hover:shadow-lg`}>
        <div className="text-3xl font-black">{score}</div>
        <div className="text-xs font-medium mt-1 opacity-90">{label}</div>
        
        {/* 3D effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-t from-white to-transparent transition-opacity rounded-lg"></div>
      </div>
    </div>
  );
}

export default function AIAnalyzer() {
  const [selectedAnalyzer, setSelectedAnalyzer] = useState("headline");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Headline analyzer state
  const [headlines, setHeadlines] = useState<string[]>(["", "", "", "", ""]);
  const [contentType, setContentType] = useState("landing");
  const [headlineResults, setHeadlineResults] = useState<HeadlineResults | null>(null);
  
  // Ad analyzer state
  const [adCopy, setAdCopy] = useState("");
  const [adTarget, setAdTarget] = useState("");
  const [adPlatform, setAdPlatform] = useState("facebook");
  const [adResults, setAdResults] = useState<AdResults | null>(null);
  
  // Competition analyzer state
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorResults, setCompetitorResults] = useState<CompetitorResults | null>(null);
  
  // Helper to check if any headline is filled
  const hasHeadlines = () => headlines.some(h => h.trim() !== "");
  
  // Handle headline changes
  const handleHeadlineChange = (index: number, value: string) => {
    const newHeadlines = [...headlines];
    newHeadlines[index] = value;
    setHeadlines(newHeadlines);
  };
  
  // Mock analysis - this would be replaced with real API calls
  const runAnalysis = () => {
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      switch (selectedAnalyzer) {
        case "headline":
          setHeadlineResults({
            scores: headlines.filter(h => h.trim() !== "").map((headline, i) => ({
              headline,
              score: Math.floor(Math.random() * 40) + 60,
              rank: i + 1,
              strengths: ["Clear messaging", "Good keyword usage"],
              weaknesses: ["Could be more engaging", "Lacks urgency"],
              improvement: headline + " - Now With Extra Impact & Clarity!",
            })),
            overallScore: Math.floor(Math.random() * 30) + 70,
          });
          break;
          
        case "ad":
          setAdResults({
            overallScore: Math.floor(Math.random() * 30) + 70,
            ctrScore: Math.floor(Math.random() * 30) + 60,
            engagementScore: Math.floor(Math.random() * 30) + 65,
            clarityScore: Math.floor(Math.random() * 20) + 75,
            analysis: "Your ad copy is clear and focused, but could use a stronger call-to-action. The messaging aligns well with Facebook's format, but emotional triggers could be improved.",
            improvements: [
              "Add a clearer call-to-action at the end",
              "Include more emotional triggers",
              "Consider adding social proof",
              "Optimize the first 3-5 words for higher engagement"
            ],
            improvedVersion: adCopy + " [Enhanced with social proof and emotional triggers] - Try it today! Join thousands of satisfied customers."
          });
          break;
          
        case "competition":
          setCompetitorResults({
            overallScore: Math.floor(Math.random() * 30) + 70,
            seoScore: Math.floor(Math.random() * 30) + 65,
            brandingScore: Math.floor(Math.random() * 20) + 75, 
            contentScore: Math.floor(Math.random() * 30) + 60,
            analysis: "Your competitor has a strong content strategy but their SEO approach has several weaknesses. Their ads perform well on Facebook but poorly on Google.",
            strategies: [
              "Focus on SEO keywords they're missing",
              "Create more in-depth content than theirs",
              "Highlight your unique selling points better",
              "Target their audience segments with more specific messaging"
            ],
            topKeywords: ["marketing automation", "content creation", "social media growth", "ROI tracking"]
          });
          break;
          
        default:
          break;
      }
      
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };
  
  // Reset analysis
  const resetAnalysis = () => {
    setShowResults(false);
    setHeadlineResults(null);
    setAdResults(null);
    setCompetitorResults(null);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Analyzer Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                AI-driven analytics that intelligently evaluates & optimizes marketing performance
              </p>
            </div>
            
            {/* AI Instruction Card */}
            <Modern3DCard 
              title="Optimized AI Instruction"
              className="mb-6"
              accentColor="bg-blue-500"
            >
              <div className="flex gap-3">
                <div className="mt-1 flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {aiInstructionText}
                  </p>
                </div>
              </div>
            </Modern3DCard>
            
            <div className="grid md:grid-cols-4 gap-6">
              {/* Left Column: Analysis Selection */}
              <Modern3DCard 
                title="AI Analysis Functions"
                description="Select an analysis type to begin"
                className="md:col-span-1"
                accentColor="bg-purple-500"
              >
                <div className="space-y-2">
                  <div 
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      selectedAnalyzer === "headline" ? "bg-primary/5 border-primary" : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                    onClick={() => { setSelectedAnalyzer("headline"); resetAnalysis(); }}
                  >
                    <div className="flex items-center gap-3">
                      <Lightbulb className={cn("h-5 w-5", selectedAnalyzer === "headline" ? "text-primary" : "text-gray-500")} />
                      <div>
                        <h3 className="font-medium">Headline Analyzer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Score & improve headline engagement</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      selectedAnalyzer === "ad" ? "bg-primary/5 border-primary" : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                    onClick={() => { setSelectedAnalyzer("ad"); resetAnalysis(); }}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart2 className={cn("h-5 w-5", selectedAnalyzer === "ad" ? "text-primary" : "text-gray-500")} />
                      <div>
                        <h3 className="font-medium">Ad Analyzer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Evaluate & optimize ad copy</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      selectedAnalyzer === "competition" ? "bg-primary/5 border-primary" : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                    onClick={() => { setSelectedAnalyzer("competition"); resetAnalysis(); }}
                  >
                    <div className="flex items-center gap-3">
                      <Search className={cn("h-5 w-5", selectedAnalyzer === "competition" ? "text-primary" : "text-gray-500")} />
                      <div>
                        <h3 className="font-medium">Competition Analyzer</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Study & outperform competitors</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70">
                    <div className="flex items-center gap-3">
                      <LineChart className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">Ad Data Integrations</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Available in sidebar menu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Modern3DCard>
              
              {/* Right Column: Analysis Input */}
              <div className="md:col-span-3 space-y-6">
                <AnimatePresence mode="wait">
                  {/* Headline Analyzer */}
                  {selectedAnalyzer === "headline" && (
                    <motion.div
                      key="headline"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Modern3DCard 
                        title="Headline Analyzer"
                        description="AI scores headlines for engagement potential"
                        accentColor="bg-blue-500"
                      >
                        <div className="space-y-4">
                          {!showResults ? (
                            <>
                              <div className="space-y-4">
                                <div>
                                  <Label>Content Type</Label>
                                  <Select defaultValue={contentType} onValueChange={setContentType}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select content type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="landing">Landing Page</SelectItem>
                                      <SelectItem value="facebook">Facebook Ad</SelectItem>
                                      <SelectItem value="blog">Blog Title</SelectItem>
                                      <SelectItem value="email">Email Subject Line</SelectItem>
                                      <SelectItem value="google">Google Ad</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-3">
                                  <Label>Enter up to 5 headlines to analyze</Label>
                                  {headlines.map((headline, index) => (
                                    <Input 
                                      key={index}
                                      placeholder={`Headline ${index + 1}`}
                                      value={headline}
                                      onChange={(e) => handleHeadlineChange(index, e.target.value)}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <Button 
                                  onClick={runAnalysis} 
                                  disabled={!hasHeadlines() || isProcessing}
                                  className="w-full"
                                >
                                  {isProcessing ? (
                                    <>
                                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                      Analyzing Headlines...
                                    </>
                                  ) : (
                                    <>
                                      Analyze Headlines 
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6">
                              <InsightCard title="Overall Analysis" variant="info">
                                <div className="flex gap-4 mt-3 mb-4">
                                  {headlineResults && (
                                    <>
                                      <ScoreIndicator score={headlineResults.overallScore} label="Overall Score" />
                                      <div className="flex-1">
                                        <p>Based on {headlineResults.scores.length} headlines analyzed, your headline content is <strong>{headlineResults.overallScore >= 70 ? "well-crafted" : "needs improvement"}</strong>.</p>
                                        <p className="mt-2">The highest-scoring headline scored {Math.max(...headlineResults.scores.map((s: HeadlineResult) => s.score))} points.</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </InsightCard>
                              
                              <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Headline Rankings</h3>
                                {headlineResults && headlineResults.scores.map((result: HeadlineResult, i: number) => (
                                  <div key={i} className="border rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
                                      <div className="font-medium">Rank #{result.rank}</div>
                                      <div className={`px-3 py-1 rounded-full text-sm ${
                                        result.score >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" :
                                        result.score >= 60 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" :
                                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                      }`}>
                                        Score: {result.score}
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <p className="font-medium mb-3">{result.headline}</p>
                                      
                                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                        <div>
                                          <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Strengths</h4>
                                          <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400">
                                            {result.strengths.map((strength, si) => (
                                              <li key={si}>{strength}</li>
                                            ))}
                                          </ul>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">Opportunities</h4>
                                          <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400">
                                            {result.weaknesses.map((weakness, wi) => (
                                              <li key={wi}>{weakness}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-4">
                                        <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">AI-Optimized Version</h4>
                                        <p className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-gray-800 dark:text-gray-200 border border-blue-200 dark:border-blue-800">
                                          {result.improvement}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex justify-between">
                                <Button variant="outline" onClick={resetAnalysis}>
                                  Analyze New Headlines
                                </Button>
                                <Button>
                                  Export Analysis
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Modern3DCard>
                    </motion.div>
                  )}
                  
                  {/* Ad Analyzer */}
                  {selectedAnalyzer === "ad" && (
                    <motion.div
                      key="ad"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Modern3DCard
                        title="Ad Analyzer"
                        description="AI evaluates and optimizes your ad copy"
                        accentColor="bg-blue-500"
                      >
                        <div className="space-y-4">
                          {!showResults ? (
                            <>
                              <div className="space-y-4">
                                <div>
                                  <Label>Ad Platform</Label>
                                  <Select defaultValue={adPlatform} onValueChange={setAdPlatform}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select ad platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="facebook">Facebook Ads</SelectItem>
                                      <SelectItem value="google">Google Ads</SelectItem>
                                      <SelectItem value="instagram">Instagram Ads</SelectItem>
                                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                                      <SelectItem value="twitter">Twitter Ads</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label>Target Audience</Label>
                                  <Input 
                                    placeholder="E.g., Small business owners, Tech professionals" 
                                    value={adTarget}
                                    onChange={(e) => setAdTarget(e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Ad Copy</Label>
                                  <Textarea 
                                    placeholder="Enter your ad copy here..." 
                                    className="min-h-[150px]"
                                    value={adCopy}
                                    onChange={(e) => setAdCopy(e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <Button 
                                  onClick={runAnalysis} 
                                  disabled={!adCopy.trim() || isProcessing}
                                  className="w-full"
                                >
                                  {isProcessing ? (
                                    <>
                                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                      Analyzing Ad Copy...
                                    </>
                                  ) : (
                                    <>
                                      Analyze Ad Copy
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6">
                              {adResults && (
                                <>
                                  <div className="grid grid-cols-4 gap-4">
                                    <ScoreIndicator score={adResults.overallScore} label="Overall" />
                                    <ScoreIndicator score={adResults.ctrScore} label="CTR Potential" />
                                    <ScoreIndicator score={adResults.engagementScore} label="Engagement" />
                                    <ScoreIndicator score={adResults.clarityScore} label="Clarity" />
                                  </div>
                                  
                                  <InsightCard title="Ad Analysis" variant="info">
                                    <p>{adResults.analysis}</p>
                                  </InsightCard>
                                  
                                  <div className="border rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
                                      <h3 className="font-medium">Improvement Opportunities</h3>
                                    </div>
                                    <div className="p-4">
                                      <ul className="space-y-2">
                                        {adResults.improvements.map((improvement: string, i: number) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <div className="mt-1 text-amber-500 flex-shrink-0">
                                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                              </svg>
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                  
                                  <Modern3DCard
                                    title="AI-Optimized Ad Copy"
                                    accentColor="bg-blue-400"
                                  >
                                    <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
                                      {adResults.improvedVersion}
                                    </p>
                                  </Modern3DCard>
                                </>
                              )}
                              
                              <div className="flex justify-between">
                                <Button variant="outline" onClick={resetAnalysis}>
                                  Analyze New Ad
                                </Button>
                                <Button>
                                  Export Analysis
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Modern3DCard>
                    </motion.div>
                  )}
                  
                  {/* Competition Analyzer */}
                  {selectedAnalyzer === "competition" && (
                    <motion.div
                      key="competition"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Modern3DCard
                        title="Competition Analyzer"
                        description="AI scans competitors' strategies and provides counterstrategies"
                        accentColor="bg-green-500"
                      >
                        <div className="space-y-4">
                          {!showResults ? (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Enter your competitor's website URL or paste their ad copy to analyze their strategy and find opportunities to outperform them.
                              </p>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label>Competitor Website URL</Label>
                                  <Input 
                                    placeholder="https://www.competitor.com" 
                                    value={competitorUrl}
                                    onChange={(e) => setCompetitorUrl(e.target.value)}
                                  />
                                </div>
                                
                                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">- OR -</p>
                                
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                                  <FileUpload
                                    onChange={(files) => {
                                      console.log("Files uploaded:", files);
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <Button 
                                  onClick={runAnalysis} 
                                  disabled={!competitorUrl.trim() || isProcessing}
                                  className="w-full"
                                >
                                  {isProcessing ? (
                                    <>
                                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                      Analyzing Competitor...
                                    </>
                                  ) : (
                                    <>
                                      Analyze Competitor
                                      <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6">
                              {competitorResults && (
                                <>
                                  <div className="grid grid-cols-4 gap-4">
                                    <ScoreIndicator score={competitorResults.overallScore} label="Competition" />
                                    <ScoreIndicator score={competitorResults.seoScore} label="SEO" />
                                    <ScoreIndicator score={competitorResults.brandingScore} label="Branding" />
                                    <ScoreIndicator score={competitorResults.contentScore} label="Content" />
                                  </div>
                                
                                  <InsightCard title="Competitor Analysis" variant="info">
                                    <p>{competitorResults.analysis}</p>
                                  </InsightCard>
                                
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <Modern3DCard
                                      title="Top Keywords"
                                      accentColor="bg-purple-500"
                                    >
                                      <div className="flex flex-wrap gap-2">
                                        {competitorResults.topKeywords.map((keyword: string, i: number) => (
                                          <span 
                                            key={i} 
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
                                          >
                                            {keyword}
                                          </span>
                                        ))}
                                      </div>
                                    </Modern3DCard>
                                    
                                    <Modern3DCard
                                      title="Winning Strategies"
                                      accentColor="bg-green-400"
                                    >
                                      <ul className="space-y-2">
                                        {competitorResults.strategies.map((strategy: string, i: number) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <div className="mt-1 text-green-500 flex-shrink-0">
                                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{strategy}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </Modern3DCard>
                                  </div>
                                </>
                              )}
                              
                              <div className="flex justify-between">
                                <Button variant="outline" onClick={resetAnalysis}>
                                  Analyze Another Competitor
                                </Button>
                                <Button>
                                  Export Analysis
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Modern3DCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}