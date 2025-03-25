import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Headphones, Video, Subtitles } from "lucide-react";
import SidebarOptimized from "@/components/SidebarOptimized";

// Import our AI tool components
import { AIImageCreator } from "@/components/ai-tools/AIImageCreator";
import { AIVoiceGenerator } from "@/components/ai-tools/AIVoiceGenerator";
import { AITranscriptionTool } from "@/components/ai-tools/AITranscriptionTool";
import { AIVideoEditor } from "@/components/ai-tools/AIVideoEditor";

export default function AITools() {
  const params = useParams<{ tool?: string }>();
  const [location, setLocation] = useLocation();
  
  // Default to image tool if no specific tool is selected
  const activeTool = params.tool || "image";
  
  // Debugging log
  useEffect(() => {
    console.log("AITools component rendered, current path:", location);
    console.log("Active tool param:", params.tool);
  }, [location, params.tool]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Marketing Tools</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Advanced AI-powered tools for visuals, voice, and automation
              </p>
            </div>
            
            <Tabs 
              defaultValue={activeTool} 
              className="space-y-6"
              onValueChange={(value) => {
                // Update the URL when tab changes
                setLocation(`/ai-tools/${value}`);
              }}
            >
              <TabsList className="grid grid-cols-4 w-full max-w-4xl mb-6">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Image Creator</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  <span>Voice & Audio</span>
                </TabsTrigger>
                <TabsTrigger value="transcription" className="flex items-center gap-2">
                  <Subtitles className="h-4 w-4" />
                  <span>Transcription</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video Editor</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Image & Logo Creator</CardTitle>
                    <CardDescription>Generate brand visuals, logos, and marketing images with AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIImageCreator />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="audio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Voice & Audio</CardTitle>
                    <CardDescription>Generate voiceovers and audio content with AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIVoiceGenerator />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transcription" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transcription & Subtitles</CardTitle>
                    <CardDescription>Automatically transcribe and caption your videos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AITranscriptionTool />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="video" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Video Editor</CardTitle>
                    <CardDescription>Edit and enhance videos with AI assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIVideoEditor />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}