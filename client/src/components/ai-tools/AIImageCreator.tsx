import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, Palette, Layout, Sparkles, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ImageGenerationParams {
  imageType: string;
  brandName: string;
  style: string;
  industry: string;
  colorScheme: string;
  description: string;
}

export function AIImageCreator() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [buildingPrompt, setBuildingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [imageType, setImageType] = useState("logo");
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState("");
  const [industry, setIndustry] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [description, setDescription] = useState("");

  // Function to generate image prompt based on user selections
  const generateImagePrompt = async (): Promise<string> => {
    setBuildingPrompt(true);
    
    try {
      let promptTemplate = "";
      
      // Base prompt structure by image type
      switch (imageType) {
        case "logo":
          promptTemplate = `Create a professional ${style || "modern"} logo for ${brandName || "a brand"} in the ${industry || "technology"} industry. Use ${colorScheme || "modern"} colors.`;
          break;
        case "social":
          promptTemplate = `Design a ${style || "eye-catching"} social media graphic for ${brandName || "a brand"} in the ${industry || "technology"} industry. Use ${colorScheme || "modern"} colors.`;
          break;
        case "banner":
          promptTemplate = `Create a professional ${style || "modern"} banner/header image for ${brandName || "a brand"} in the ${industry || "technology"} industry. Use ${colorScheme || "modern"} colors.`;
          break;
        case "image":
          promptTemplate = `Generate a high-quality ${style || "modern"} image related to ${brandName || "a subject"} for the ${industry || "technology"} industry. Use ${colorScheme || "modern"} colors.`;
          break;
        default:
          promptTemplate = `Create a professional visual for ${brandName || "a brand"} with ${style || "modern"} style.`;
      }
      
      // Add user description if provided
      if (description) {
        promptTemplate += ` Additional details: ${description}`;
      }
      
      // Add important note that we need an image output
      promptTemplate += " The output should be a high-quality, detailed image only.";
      
      return promptTemplate;
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate image prompt",
        variant: "destructive",
      });
      return "Failed to generate prompt";
    } finally {
      setBuildingPrompt(false);
    }
  };

  // Generate images using Gemini
  const generateImages = async () => {
    setGenerating(true);
    
    try {
      // First generate the optimized prompt
      const prompt = await generateImagePrompt();
      setGeneratedPrompt(prompt);
      
      console.log("Sending image generation request with prompt:", prompt);
      
      // Call the Gemini API for image generation (removing explicit model selection to use server's default)
      const response = await axios.post('/api/gemini/generate-image', {
        prompt
      });
      
      console.log("Image generation response:", response.data);
      
      if (response.data && response.data.images && response.data.images.length > 0) {
        // Transform image data for display
        const generatedImages = response.data.images.map((img: any) => {
          // Format: data:image/jpeg;base64,<base64data>
          return `data:${img.mimeType};base64,${img.data}`;
        });
        
        setImages(generatedImages);
        
        toast({
          title: "Images Generated Successfully",
          description: `Generated ${generatedImages.length} images using ${response.data.model} model.`,
        });
      } else {
        console.warn("No images returned from API. Server response:", JSON.stringify(response.data));
        
        // Fallback to placeholder images if no real images were generated
        const placeholderImages = [
          "/assets/placeholder-logo-1.svg",
          "/assets/placeholder-logo-2.svg",
          "/assets/placeholder-logo-3.svg", 
          "/assets/placeholder-logo-4.svg",
        ];
        
        setImages(placeholderImages);
        
        let errorMessage = "No images were generated. Please try a different prompt.";
        if (response.data && response.data.message) {
          errorMessage = response.data.message;
        }
        
        toast({
          title: "Images Not Generated",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error generating images:", error);
      
      // Extract more detailed error information if available
      let errorMessage = "Failed to generate images. Please check if Gemini API key is configured and try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      // Show a helpful error message
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to placeholder images for demo purposes
      const placeholderImages = [
        "/assets/placeholder-logo-1.svg",
        "/assets/placeholder-logo-2.svg",
        "/assets/placeholder-logo-3.svg",
        "/assets/placeholder-logo-4.svg",
      ];
      
      setImages(placeholderImages);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue={imageType} onValueChange={setImageType} className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
              <TabsTrigger value="logo" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Logo</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span>Social Media</span>
              </TabsTrigger>
              <TabsTrigger value="banner" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span>Banner</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Image</span>
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input 
                    id="brand-name" 
                    placeholder="Enter your brand name" 
                    className="mt-1" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry" className="mt-1">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style" className="mt-1">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="handdrawn">Hand-drawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="colors">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger id="colors" className="mt-1">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue tones</SelectItem>
                      <SelectItem value="green">Green tones</SelectItem>
                      <SelectItem value="red">Red tones</SelectItem>
                      <SelectItem value="purple">Purple tones</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label>Description (optional)</Label>
              <textarea 
                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-background"
                rows={3}
                placeholder="Describe any additional details for your brand or specific design elements you'd like to include..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mt-6 text-center">
              <Button 
                onClick={generateImages}
                disabled={generating}
                size="lg"
                className="w-full max-w-xs mx-auto"
              >
                {generating ? "Generating..." : "Generate Images"}
                {generating && <span className="ml-2 animate-spin">⟳</span>}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Prompt - shown when prompt is available */}
      {generatedPrompt && (
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold mb-2">Generated Prompt</h3>
              <Button variant="ghost" size="sm" 
                onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                className="text-xs"
              >
                Copy
              </Button>
            </div>
            <p className="text-sm p-3 bg-gray-100 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
              {generatedPrompt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {generating && images.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Creating Your {imageType.charAt(0).toUpperCase() + imageType.slice(1)}</h3>
              <p className="text-muted-foreground">
                Our AI is working hard to generate unique designs based on your specifications...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section - only shown when we have images */}
      {images.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Generated {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Designs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className="relative group border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center"
                >
                  <img 
                    src={image} 
                    alt={`Generated ${imageType} design ${index + 1}`}
                    className="w-full h-full object-contain p-4"
                  />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" 
                      onClick={() => {
                        // Create a temporary link to download the image
                        const link = document.createElement('a');
                        link.href = image;
                        link.download = `${imageType}-design-${index + 1}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        toast({
                          title: "Download Started",
                          description: "Your image is being downloaded.",
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Palette className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={generateImages}>
                Generate More Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}