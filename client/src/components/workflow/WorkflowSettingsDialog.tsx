import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Layout, 
  Monitor, 
  Users, 
  Grid, 
  EyeIcon, 
  Zap, 
  CogIcon,
  Workflow,
  Bot,
  Sliders
} from 'lucide-react';

interface WorkflowSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (settings: WorkflowSettings) => void;
  initialSettings?: Partial<WorkflowSettings>;
}

export interface WorkflowSettings {
  // Display settings
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  zoomLevel: number;
  
  // Execution settings
  executionMode: 'parallel' | 'sequential';
  autoSave: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  
  // Agent settings
  agentCollaboration: 'direct' | 'managed' | 'autonomous';
  allowAgentToAgentCommunication: boolean;
  defaultAgentMode: 'autonomous' | 'semiautonomous';
  
  // Advanced settings
  maxHistoryLength: number;
  persistWorkflow: boolean;
  enableRealTimeUpdates: boolean;
}

// Default settings
const defaultSettings: WorkflowSettings = {
  showGrid: true,
  gridSize: 16,
  snapToGrid: true,
  zoomLevel: 1,
  executionMode: 'parallel',
  autoSave: true,
  logLevel: 'info',
  agentCollaboration: 'managed',
  allowAgentToAgentCommunication: true,
  defaultAgentMode: 'autonomous',
  maxHistoryLength: 50,
  persistWorkflow: true,
  enableRealTimeUpdates: true,
};

export default function WorkflowSettingsDialog({
  open,
  onOpenChange,
  onApply,
  initialSettings = {}
}: WorkflowSettingsDialogProps) {
  // Combine initial settings with defaults
  const [settings, setSettings] = React.useState<WorkflowSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  // Handle applying settings
  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  // Update a specific setting
  const updateSetting = <K extends keyof WorkflowSettings>(
    key: K,
    value: WorkflowSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Workflow Settings
          </DialogTitle>
          <DialogDescription>
            Configure how your workflow canvas and AI agents behave
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="display" className="flex items-center gap-1">
              <Layout className="w-4 h-4" />
              <span>Display</span>
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Execution</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Agents</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1">
              <Sliders className="w-4 h-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid" className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Show Grid
                  </Label>
                  <Switch
                    id="show-grid"
                    checked={settings.showGrid}
                    onCheckedChange={(checked) => updateSetting('showGrid', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-to-grid" className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    Snap to Grid
                  </Label>
                  <Switch
                    id="snap-to-grid"
                    checked={settings.snapToGrid}
                    onCheckedChange={(checked) => updateSetting('snapToGrid', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grid-size" className="text-sm">
                    Grid Size
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="grid-size"
                      min={8}
                      max={32}
                      step={4}
                      value={[settings.gridSize]}
                      onValueChange={(value) => updateSetting('gridSize', value[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-sm">{settings.gridSize}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zoom-level" className="text-sm">
                    Default Zoom
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="zoom-level"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[settings.zoomLevel]}
                      onValueChange={(value) => updateSetting('zoomLevel', value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">{settings.zoomLevel.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Execution Settings */}
          <TabsContent value="execution" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Execution Mode</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="execution-parallel"
                        checked={settings.executionMode === 'parallel'}
                        onCheckedChange={() => updateSetting('executionMode', 'parallel')}
                      />
                      <Label htmlFor="execution-parallel" className="text-sm">
                        Parallel (Agents work simultaneously)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="execution-sequential"
                        checked={settings.executionMode === 'sequential'}
                        onCheckedChange={() => updateSetting('executionMode', 'sequential')}
                      />
                      <Label htmlFor="execution-sequential" className="text-sm">
                        Sequential (Agents work in order)
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save" className="flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Auto-save Workflow
                  </Label>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Log Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['debug', 'info', 'warning', 'error'] as const).map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`log-${level}`}
                          checked={settings.logLevel === level}
                          onCheckedChange={() => updateSetting('logLevel', level)}
                        />
                        <Label htmlFor={`log-${level}`} className="text-sm capitalize">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Agent Settings */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Agent Collaboration Mode</Label>
                  <div className="flex flex-col space-y-2">
                    {(['direct', 'managed', 'autonomous'] as const).map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`collab-${mode}`}
                          checked={settings.agentCollaboration === mode}
                          onCheckedChange={() => updateSetting('agentCollaboration', mode)}
                        />
                        <Label htmlFor={`collab-${mode}`} className="text-sm capitalize">
                          {mode}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="agent-communication" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Agent-to-Agent Communication
                  </Label>
                  <Switch
                    id="agent-communication"
                    checked={settings.allowAgentToAgentCommunication}
                    onCheckedChange={(checked) => updateSetting('allowAgentToAgentCommunication', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Default Agent Mode</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mode-autonomous"
                        checked={settings.defaultAgentMode === 'autonomous'}
                        onCheckedChange={() => updateSetting('defaultAgentMode', 'autonomous')}
                      />
                      <Label htmlFor="mode-autonomous" className="text-sm">
                        Autonomous
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="mode-semiautonomous"
                        checked={settings.defaultAgentMode === 'semiautonomous'}
                        onCheckedChange={() => updateSetting('defaultAgentMode', 'semiautonomous')}
                      />
                      <Label htmlFor="mode-semiautonomous" className="text-sm">
                        Semi-autonomous
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-history" className="text-sm">
                    Max History Length
                  </Label>
                  <Input
                    id="max-history"
                    type="number"
                    value={settings.maxHistoryLength}
                    onChange={(e) => updateSetting('maxHistoryLength', parseInt(e.target.value, 10))}
                    min={10}
                    max={200}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum number of conversation history items to store per agent
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="persist-workflow" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Persist Workflow
                  </Label>
                  <Switch
                    id="persist-workflow"
                    checked={settings.persistWorkflow}
                    onCheckedChange={(checked) => updateSetting('persistWorkflow', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time-updates" className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Real-time Updates
                  </Label>
                  <Switch
                    id="real-time-updates"
                    checked={settings.enableRealTimeUpdates}
                    onCheckedChange={(checked) => updateSetting('enableRealTimeUpdates', checked)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enable real-time updates to see agents' progress as they work
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}