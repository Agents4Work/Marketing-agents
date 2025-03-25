/**
 * AI Tools Settings Component
 * 
 * This component provides a settings panel for AI tools configuration
 * and demonstrates how to use the LangChain integration
 */

import React, { useState } from 'react';
import { LangChainConnector } from './index';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Settings, Keyboard, Code } from 'lucide-react';

// AI settings interface
interface AISettings {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableTracing: boolean;
  enableWorkflowCache: boolean;
  developerMode: boolean;
}

// Default settings
const defaultSettings: AISettings = {
  defaultModel: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  enableTracing: false,
  enableWorkflowCache: true,
  developerMode: false,
};

// Main component
const AIToolsSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<string>('general');
  
  // Handle settings change
  const handleSettingsChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle settings save
  const handleSaveSettings = () => {
    // In a real app, we would save these to the API
    console.log('Saving settings:', settings);
    
    toast({
      title: 'Settings Saved',
      description: 'Your AI settings have been saved successfully',
    });
  };
  
  // Handle settings reset
  const handleResetSettings = () => {
    setSettings(defaultSettings);
    
    toast({
      title: 'Settings Reset',
      description: 'Your AI settings have been reset to defaults',
      variant: 'destructive',
    });
  };
  
  return (
    <div className="space-y-8">
      <LangChainConnector />
      
      <Card>
        <CardHeader>
          <CardTitle>AI Tools Settings</CardTitle>
          <CardDescription>
            Configure settings for all AI-powered tools in your dashboard
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-6">
            <TabsTrigger value="general">
              <Keyboard className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="developer">
              <Code className="h-4 w-4 mr-2" />
              Developer
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default AI Model</Label>
                <select
                  id="defaultModel"
                  className="w-full rounded-md border border-input bg-background p-2 text-sm"
                  value={settings.defaultModel}
                  onChange={(e) => handleSettingsChange('defaultModel', e.target.value)}
                >
                  <option value="gpt-4">GPT-4 (Best Quality)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economy)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  This model will be used for all AI tools unless specified otherwise
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => handleSettingsChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="w-12 text-sm">{settings.temperature}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lower values make output more predictable, higher values more creative
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Maximum Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingsChange('maxTokens', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens for AI responses. Higher values may increase costs.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableWorkflowCache">Enable Workflow Cache</Label>
                  <p className="text-xs text-muted-foreground">
                    Cache workflow results to improve performance
                  </p>
                </div>
                <Switch
                  id="enableWorkflowCache"
                  checked={settings.enableWorkflowCache}
                  onCheckedChange={(checked) => handleSettingsChange('enableWorkflowCache', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableTracing">Enable LangSmith Tracing</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable tracing to debug workflow execution (requires LangSmith API key)
                  </p>
                </div>
                <Switch
                  id="enableTracing"
                  checked={settings.enableTracing}
                  onCheckedChange={(checked) => handleSettingsChange('enableTracing', checked)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="developer" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="developerMode">Developer Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable advanced debugging features and experimental tools
                  </p>
                </div>
                <Switch
                  id="developerMode"
                  checked={settings.developerMode}
                  onCheckedChange={(checked) => handleSettingsChange('developerMode', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Export Settings</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Generate a JSON data URL
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(settings, null, 2)
                    )}`;
                    
                    // Create a download link and trigger it
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute('href', dataStr);
                    downloadAnchorNode.setAttribute('download', 'ai-settings.json');
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                    
                    toast({
                      title: 'Settings Exported',
                      description: 'Your AI settings have been exported successfully',
                    });
                  }}
                >
                  Export Settings as JSON
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIToolsSettings;