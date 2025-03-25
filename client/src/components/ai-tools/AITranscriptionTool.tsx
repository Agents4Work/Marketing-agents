import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, Mic, Check, X, Clipboard, Download, Globe } from "lucide-react";

export function AITranscriptionTool() {
  const [processing, setProcessing] = useState(false);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionMode, setTranscriptionMode] = useState("file");
  const [transcription, setTranscription] = useState<string>("");
  const [subtitles, setSubtitles] = useState<Array<{start: string, end: string, text: string}>>([]);

  // Mock function to simulate transcription processing
  const processTranscription = () => {
    setProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock transcription result
      setTranscription("This is a sample transcription of the uploaded audio or video file. The AI has automatically converted speech to text with timestamps. Multiple speakers are automatically detected and labeled.");
      
      // Mock subtitles with timestamps
      setSubtitles([
        { start: "00:00:01,000", end: "00:00:04,000", text: "This is a sample transcription of the uploaded audio" },
        { start: "00:00:04,100", end: "00:00:08,000", text: "or video file. The AI has automatically converted" },
        { start: "00:00:08,100", end: "00:00:12,000", text: "speech to text with timestamps." },
        { start: "00:00:12,100", end: "00:00:16,000", text: "Multiple speakers are automatically detected and labeled." }
      ]);
      
      setProcessing(false);
      setTranscriptionComplete(true);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording) {
      // In a real implementation, this would stop recording and process the captured audio
      setTimeout(() => {
        processTranscription();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue={transcriptionMode} onValueChange={setTranscriptionMode} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>Record Audio</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="media-file"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {!uploadedFile ? (
                    <>
                      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <Video className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium mb-2">Drag audio/video file here or click to upload</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Supports MP3, WAV, MP4, MOV (Max 500MB)
                      </p>
                      <Button 
                        onClick={() => document.getElementById('media-file')?.click()}
                        variant="outline"
                      >
                        Select Media File
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto h-12 w-12 text-green-500 mb-4">
                        <Video className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium mb-2">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {Math.round(uploadedFile.size / 1024 / 1024 * 10) / 10} MB
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
              </div>
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Mic className={`h-8 w-8 ${isRecording ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  
                  <p className="text-lg font-medium mb-2">
                    {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                  </p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isRecording ? "00:12" : "Speak clearly into your microphone"}
                  </p>
                  
                  <Button 
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="transcription-language">Source Language</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="transcription-language" className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select defaultValue="txt">
                    <SelectTrigger id="output-format" className="mt-1">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                      <SelectItem value="srt">Subtitles (.srt)</SelectItem>
                      <SelectItem value="vtt">Web Subtitles (.vtt)</SelectItem>
                      <SelectItem value="json">Timestamped JSON</SelectItem>
                      <SelectItem value="docx">Word Document (.docx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="speaker-detection" className="mr-1" />
                <Label htmlFor="speaker-detection" className="cursor-pointer">Enable speaker detection</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="auto-translate" className="mr-1" />
                <Label htmlFor="auto-translate" className="cursor-pointer">Auto-translate to:</Label>
                <div className="w-40 inline-block">
                  <Select defaultValue="none">
                    <SelectTrigger id="translate-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don't translate</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button 
                onClick={processTranscription}
                disabled={processing || (transcriptionMode === "file" && !uploadedFile)}
                size="lg"
                className="w-full max-w-xs mx-auto"
              >
                {processing ? "Processing..." : "Transcribe"}
                {processing && <span className="ml-2 animate-spin">⟳</span>}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Section - only shown after processing */}
      {transcriptionComplete && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Transcription Results</h3>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Translate
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="w-full">
                <Tabs defaultValue="text">
                  <TabsList className="w-full max-w-xs mb-4">
                    <TabsTrigger value="text">Full Text</TabsTrigger>
                    <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 whitespace-pre-line">
                      {transcription}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="subtitles">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                      {subtitles.map((subtitle, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {subtitle.start} → {subtitle.end}
                          </div>
                          <div className="mt-1">
                            {subtitle.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={() => {
                setTranscriptionComplete(false);
                setUploadedFile(null);
                setTranscription("");
                setSubtitles([]);
              }}>
                Start New Transcription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}