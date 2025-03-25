import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Agent, 
  AgentType, 
  AgentConfig, 
  SEOAgentConfig, 
  CopywritingAgentConfig, 
  AdsAgentConfig,
  SocialMediaAgentConfig
} from '@/lib/agents';
import { useToast } from '@/hooks/use-toast';

interface AgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onConfigUpdate?: (agent: Agent) => void;
  embedded?: boolean; // Whether this component is embedded in another modal
}

// Type guard functions
const isSEOConfig = (config: AgentConfig): config is SEOAgentConfig => {
  return (config as SEOAgentConfig).keywords !== undefined;
};

const isCopywritingConfig = (config: AgentConfig): config is CopywritingAgentConfig => {
  return (config as CopywritingAgentConfig).tone !== undefined && 
         (config as CopywritingAgentConfig).length !== undefined;
};

const isAdsConfig = (config: AgentConfig): config is AdsAgentConfig => {
  return (config as AdsAgentConfig).platform !== undefined && 
         (config as AdsAgentConfig).budget !== undefined;
};

const isSocialMediaConfig = (config: AgentConfig): config is SocialMediaAgentConfig => {
  return (config as SocialMediaAgentConfig).platforms !== undefined && 
         (config as SocialMediaAgentConfig).contentMix !== undefined;
};

const AgentConfigModal = ({ isOpen, onClose, agent, onConfigUpdate, embedded = false }: AgentConfigModalProps) => {
  const [config, setConfig] = useState<AgentConfig>(agent.configuration);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setConfig(agent.configuration);
    }
  }, [isOpen, agent]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSEOConfig(config)) {
      const keywordsString = e.target.value;
      const keywordsArray = keywordsString.split(',').map(k => k.trim()).filter(k => k !== '');
      handleInputChange('keywords', keywordsArray);
    }
  };

  const getKeywordsString = () => {
    if (agent.type === 'seo' && isSEOConfig(config)) {
      return config.keywords.join(', ');
    }
    return '';
  };

  const handleSave = () => {
    if (onConfigUpdate) {
      const updatedAgent = {
        ...agent,
        configuration: config
      };
      onConfigUpdate(updatedAgent);
    }
    
    toast({
      title: "Configuration saved",
      description: `${agent.name} has been configured successfully.`
    });
    
    onClose();
  };

  const renderAgentSpecificFields = () => {
    switch (agent.type as AgentType) {
      case 'seo':
        if (!isSEOConfig(config)) return null;
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input 
                id="keywords" 
                placeholder="e.g. digital marketing, automation, AI tools" 
                value={getKeywordsString()}
                onChange={handleKeywordsChange}
              />
              <p className="text-xs text-gray-500">Separate keywords with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select 
                defaultValue={config.targetAudience} 
                onValueChange={value => handleInputChange('targetAudience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small Business Owners">Small Business Owners</SelectItem>
                  <SelectItem value="Marketing Professionals">Marketing Professionals</SelectItem>
                  <SelectItem value="Enterprise CMOs">Enterprise CMOs</SelectItem>
                  <SelectItem value="E-commerce Managers">E-commerce Managers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select 
                defaultValue={config.contentType} 
                onValueChange={value => handleInputChange('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog Post">Blog Post</SelectItem>
                  <SelectItem value="Product Page">Product Page</SelectItem>
                  <SelectItem value="Landing Page">Landing Page</SelectItem>
                  <SelectItem value="Social Media Post">Social Media Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optimizationLevel">Optimization Level</Label>
              <Slider 
                defaultValue={[config.optimizationLevel]} 
                min={1} 
                max={5} 
                step={1}
                onValueChange={value => handleInputChange('optimizationLevel', value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Aggressive</span>
              </div>
            </div>
          </>
        );
      
      case 'copywriting':
        if (!isCopywritingConfig(config)) return null;
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select 
                defaultValue={config.contentType} 
                onValueChange={value => handleInputChange('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog Post">Blog Post</SelectItem>
                  <SelectItem value="Social Media Post">Social Media Post</SelectItem>
                  <SelectItem value="Ad Copy">Ad Copy</SelectItem>
                  <SelectItem value="Product Description">Product Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select 
                defaultValue={config.tone} 
                onValueChange={value => handleInputChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select 
                defaultValue={config.length} 
                onValueChange={value => handleInputChange('length', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      
      case 'ads':
        if (!isAdsConfig(config)) return null;
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="platform">Ad Platform</Label>
              <Select 
                defaultValue={config.platform} 
                onValueChange={value => handleInputChange('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                  <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
                  <SelectItem value="Twitter Ads">Twitter Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input 
                id="budget" 
                type="number" 
                min={0}
                value={config.budget} 
                onChange={e => handleInputChange('budget', Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="objective">Campaign Objective</Label>
              <Select 
                defaultValue={config.objective} 
                onValueChange={value => handleInputChange('objective', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Awareness">Awareness</SelectItem>
                  <SelectItem value="Traffic">Traffic</SelectItem>
                  <SelectItem value="Engagement">Engagement</SelectItem>
                  <SelectItem value="Conversions">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      
      case 'social':
        if (!isSocialMediaConfig(config)) return null;
        return (
          <>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'].map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={config.platforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const currentPlatforms = config.platforms;
                      const newPlatforms = currentPlatforms.includes(platform)
                        ? currentPlatforms.filter(p => p !== platform)
                        : [...currentPlatforms, platform];
                      handleInputChange('platforms', newPlatforms);
                    }}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postingFrequency">Posting Frequency</Label>
              <Select 
                defaultValue={config.postingFrequency} 
                onValueChange={value => handleInputChange('postingFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="3x per week">3x per week</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contentMix">Content Mix</Label>
              <Select 
                defaultValue={config.contentMix} 
                onValueChange={value => handleInputChange('contentMix', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content mix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text only">Text only</SelectItem>
                  <SelectItem value="Text and Images">Text and Images</SelectItem>
                  <SelectItem value="Images and Videos">Images and Videos</SelectItem>
                  <SelectItem value="Balanced mix">Balanced mix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // If embedded, just render the form content directly
  if (embedded) {
    return (
      <div className="space-y-4">
        {renderAgentSpecificFields()}
        
        <div className="space-y-2">
          <Label>Agent Mode</Label>
          <RadioGroup 
            defaultValue={config.mode}
            onValueChange={value => handleInputChange('mode', value as "autonomous" | "semiautonomous")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="autonomous" id="autonomous" />
              <Label htmlFor="autonomous">Autonomous</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="semiautonomous" id="semiautonomous" />
              <Label htmlFor="semiautonomous">Semi-autonomous</Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={() => {
            if (onConfigUpdate) {
              const updatedAgent = {
                ...agent,
                configuration: config
              };
              onConfigUpdate(updatedAgent);
            }
          }}
          size="sm"
          className="mt-2"
        >
          Apply Changes
        </Button>
      </div>
    );
  }

  // Otherwise render the full modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure {agent.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderAgentSpecificFields()}
          
          <div className="space-y-2">
            <Label>Agent Mode</Label>
            <RadioGroup 
              defaultValue={config.mode}
              onValueChange={value => handleInputChange('mode', value as "autonomous" | "semiautonomous")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="autonomous" id="autonomous" />
                <Label htmlFor="autonomous">Autonomous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semiautonomous" id="semiautonomous" />
                <Label htmlFor="semiautonomous">Semi-autonomous</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigModal;
