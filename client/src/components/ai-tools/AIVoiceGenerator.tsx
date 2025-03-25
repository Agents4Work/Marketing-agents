import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic, Upload, Play, Pause, SkipBack, Download, Volume2, Music } from "lucide-react";

export function AIVoiceGenerator() {
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputType, setInputType] = useState("text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Mock function to simulate voice generation
  const generateVoice = () => {
    setGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      // In a real implementation, this would be a URL from an API response
      setAudioUrl("https://example.com/sample-audio.mp3");
      setGenerating(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue={inputType} onValueChange={setInputType} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <span>Text to Speech</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <span>Audio Enhancement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voice-text">Text to Convert</Label>
                  <textarea 
                    id="voice-text"
                    className="mt-1 w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 bg-background"
                    rows={5}
                    placeholder="Enter the text you want to convert to speech..."
                  />
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-style">Voice Style</Label>
                      <Select>
                        <SelectTrigger id="voice-style" className="mt-1">
                          <SelectValue placeholder="Select voice style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="voice-accent">Accent</Label>
                      <Select>
                        <SelectTrigger id="voice-accent" className="mt-1">
                          <SelectValue placeholder="Select accent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="american">American</SelectItem>
                          <SelectItem value="british">British</SelectItem>
                          <SelectItem value="australian">Australian</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="background-music">Background Music</Label>
                      <Select>
                        <SelectTrigger id="background-music" className="mt-1">
                          <SelectValue placeholder="Select music (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="upbeat">Upbeat</SelectItem>
                          <SelectItem value="relaxing">Relaxing</SelectItem>
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="background-volume">Background Volume</Label>
                      <Slider
                        id="background-volume"
                        defaultValue={[30]}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="audio-file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {!uploadedFile ? (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <Upload className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium mb-2">Drag audio file here or click to upload</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Supports MP3, WAV, M4A (Max 10MB)
                      </p>
                      <Button 
                        onClick={() => document.getElementById('audio-file')?.click()}
                        variant="outline"
                      >
                        Select Audio File
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-green-500 mb-4">
                        <Music className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium mb-2">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {Math.round(uploadedFile.size / 1024)} KB
                      </p>
                      <Button 
                        onClick={() => setUploadedFile(null)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Enhancement Options</Label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="noise-reduction" className="mr-2" />
                          <Label htmlFor="noise-reduction" className="cursor-pointer">Noise Reduction</Label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="vocal-enhancement" className="mr-2" />
                          <Label htmlFor="vocal-enhancement" className="cursor-pointer">Vocal Enhancement</Label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="normalization" className="mr-2" />
                          <Label htmlFor="normalization" className="cursor-pointer">Volume Normalization</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="effect-style">Effect Style</Label>
                      <Select>
                        <SelectTrigger id="effect-style" className="mt-1">
                          <SelectValue placeholder="Select effect style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="podcast">Podcast Studio</SelectItem>
                          <SelectItem value="radio">Radio Broadcast</SelectItem>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="telephone">Telephone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="output-quality">Output Quality</Label>
                      <Select defaultValue="high">
                        <SelectTrigger id="output-quality" className="mt-1">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medium">Medium (128kbps)</SelectItem>
                          <SelectItem value="high">High (256kbps)</SelectItem>
                          <SelectItem value="premium">Premium (320kbps)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="mt-6 text-center">
              <Button 
                onClick={generateVoice}
                disabled={generating || (inputType === "audio" && !uploadedFile)}
                size="lg"
                className="w-full max-w-xs mx-auto"
              >
                {generating ? "Processing..." : (inputType === "text" ? "Generate Voice" : "Enhance Audio")}
                {generating && <span className="ml-2 animate-spin">⟳</span>}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Audio Player - only shown after generation */}
      {audioUrl && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Generated Audio</h3>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={togglePlayback}
                    className="h-10 w-10"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: isPlaying ? "45%" : "0%" }} 
                    />
                  </div>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[4rem] text-right">
                    {isPlaying ? "01:23" : "00:00"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {inputType === "text" ? "AI-generated voiceover" : "Enhanced audio file"}
                <span className="mx-2">•</span>
                {inputType === "text" ? "English, Professional voice" : uploadedFile?.name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}