import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Upload, Play, Pause, SkipBack, Download, 
  Scissors, Wand2, Type, Palette, Sliders,
  Image, Sparkles, Moon, Sun, Expand, 
  PictureInPicture, ChevronsUpDown
} from "lucide-react";

export function AIVideoEditor() {
  const [processing, setProcessing] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [editingComplete, setEditingComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("enhance");

  // Mock function to simulate video processing
  const processVideo = () => {
    setProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      setProcessing(false);
      setEditingComplete(true);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedVideo(e.target.files[0]);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Video Upload Section - shown only before upload */}
      {!uploadedVideo && !editingComplete && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                id="video-file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Upload className="h-16 w-16" />
              </div>
              <p className="text-xl font-medium mb-2">Drag video file here or click to upload</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Upload a video file to start editing. Our AI will analyze your video and suggest enhancements.
                <br />Supports MP4, MOV, AVI, WEBM (Max 1GB)
              </p>
              <Button 
                onClick={() => document.getElementById('video-file')?.click()}
                size="lg"
              >
                Select Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Editor Interface - shown after upload */}
      {(uploadedVideo || editingComplete) && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Video Preview */}
          <Card className="border-0 shadow-md md:col-span-8">
            <CardContent className="p-6">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {/* Video placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!editingComplete ? (
                    <div className="text-white text-center">
                      <p className="mb-2">Preview will appear here</p>
                      <Button 
                        onClick={processVideo}
                        disabled={processing}
                      >
                        {processing ? "Processing..." : "Process Video"}
                        {processing && <span className="ml-2 animate-spin">⟳</span>}
                      </Button>
                    </div>
                  ) : (
                    // Enhanced video preview (mock)
                    <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">AI Enhanced Video</p>
                        {isPlaying ? (
                          <p className="text-sm opacity-60 mt-2">Playing...</p>
                        ) : (
                          <Button 
                            onClick={togglePlayback}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video controls (shows only after editing complete) */}
                {editingComplete && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3 flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlayback}
                      className="text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <div className="w-full mx-4 bg-white/20 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full" 
                        style={{ width: isPlaying ? "35%" : "0%" }} 
                      />
                    </div>
                    
                    <span className="text-sm min-w-[4rem] text-right">
                      {isPlaying ? "00:42" : "00:00"} / 02:15
                    </span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {editingComplete && (
                <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="h-16 relative w-full">
                    {/* This would be a more complex timeline component in a real implementation */}
                    <div className="absolute top-0 left-0 right-0 h-2 flex items-center">
                      <div className="w-full h-1 bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                    
                    <div className="absolute top-4 left-0 right-0 h-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded opacity-50"></div>
                    
                    <div className="absolute top-2 left-[35%] h-12 w-px bg-primary"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>00:00</span>
                    <span>01:07</span>
                    <span>02:15</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editing Controls */}
          <Card className="border-0 shadow-md md:col-span-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Video Tools</h3>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-4">
                  <TabsTrigger value="enhance" className="flex items-center justify-center">
                    <Wand2 className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:text-xs">Enhance</span>
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center justify-center">
                    <Scissors className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:text-xs">Edit</span>
                  </TabsTrigger>
                  <TabsTrigger value="captions" className="flex items-center justify-center">
                    <Type className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only sm:text-xs">Captions</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="enhance" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="brightness">Brightness</Label>
                      <span className="text-xs text-gray-500">Auto</span>
                    </div>
                    <Slider
                      id="brightness"
                      defaultValue={[50]}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="contrast">Contrast</Label>
                      <span className="text-xs text-gray-500">Auto</span>
                    </div>
                    <Slider
                      id="contrast"
                      defaultValue={[60]}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="saturation">Saturation</Label>
                      <span className="text-xs text-gray-500">Auto</span>
                    </div>
                    <Slider
                      id="saturation"
                      defaultValue={[55]}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Label className="mb-2 block">AI Enhancements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="noise-reduction" className="mr-2" defaultChecked />
                        <Label htmlFor="noise-reduction" className="cursor-pointer text-sm">Noise Reduction</Label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="sharpen" className="mr-2" defaultChecked />
                        <Label htmlFor="sharpen" className="cursor-pointer text-sm">Auto Sharpen</Label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="stabilize" className="mr-2" defaultChecked />
                        <Label htmlFor="stabilize" className="cursor-pointer text-sm">Stabilization</Label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="color-correction" className="mr-2" defaultChecked />
                        <Label htmlFor="color-correction" className="cursor-pointer text-sm">Color Correction</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit" className="space-y-4">
                  <div>
                    <Label htmlFor="trim-video" className="mb-2 block">Trim Video</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Scissors className="h-4 w-4 mr-1" />
                        Split at Current Position
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Label htmlFor="speed" className="mb-2 block">Playback Speed</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="speed">
                        <SelectValue placeholder="Select speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">1x (Normal)</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Label htmlFor="transitions" className="mb-2 block">Transitions</Label>
                    <Select defaultValue="fade">
                      <SelectTrigger id="transitions">
                        <SelectValue placeholder="Select transition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="dissolve">Dissolve</SelectItem>
                        <SelectItem value="wipe">Wipe</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="ai-smart">AI Smart Transition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="captions" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Auto-Generated Captions</Label>
                      <Button variant="outline" size="sm">
                        <Type className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Let AI automatically transcribe and add captions to your video.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="caption-style" className="mb-2 block">Caption Style</Label>
                    <Select defaultValue="modern">
                      <SelectTrigger id="caption-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="caption-position" className="mb-2 block">Caption Position</Label>
                    <Select defaultValue="bottom">
                      <SelectTrigger id="caption-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" id="burn-captions" className="mr-2" />
                    <Label htmlFor="burn-captions" className="cursor-pointer text-sm">Burn captions into video</Label>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Export section */}
              {editingComplete && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="export-format" className="mb-2 block">Export Format</Label>
                    <Select defaultValue="mp4">
                      <SelectTrigger id="export-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                        <SelectItem value="mov">MOV (QuickTime)</SelectItem>
                        <SelectItem value="webm">WEBM (Web Optimized)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="export-quality" className="mb-2 block">Quality</Label>
                    <Select defaultValue="high">
                      <SelectTrigger id="export-quality">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medium">Medium (720p)</SelectItem>
                        <SelectItem value="high">High (1080p)</SelectItem>
                        <SelectItem value="ultra">Ultra (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}