import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, MessageSquare, Activity, Info } from 'lucide-react';
import { getAgentInitials } from '@/lib/agentUtils';

// Define the interaction types
export type InteractionType = 'profile' | 'chat' | 'settings';

// Define props for the dialog component
interface AgentInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
    type: string;
    description?: string;
    roleTitle?: string;
    avatarUrl?: string;
    status?: string;
  };
  interactionType: InteractionType;
}

export function AgentInteractionDialog({
  open,
  onOpenChange,
  agent,
  interactionType,
}: AgentInteractionDialogProps) {
  // State for the active tab - initialized based on interaction type
  const [activeTab, setActiveTab] = React.useState<string>(interactionType);
  
  // Chat state
  const [chatMessages, setChatMessages] = React.useState<Array<{
    role: 'user' | 'agent' | 'system';
    content: string;
    timestamp: Date;
  }>>([
    {
      role: 'system',
      content: 'Connection established to agent.',
      timestamp: new Date(),
    },
    {
      role: 'agent',
      content: `Hello, I'm ${agent.name}. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  
  const [newMessage, setNewMessage] = React.useState('');

  // Settings state
  const [settings, setSettings] = React.useState({
    autonomyLevel: 'semi-autonomous',
    responseStyle: 'balanced',
    notifications: true,
    detailedReporting: true,
  });

  // Function to send a message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    setChatMessages([
      ...chatMessages,
      {
        role: 'user',
        content: newMessage,
        timestamp: new Date(),
      },
    ]);
    
    // Clear input
    setNewMessage('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: `I'm analyzing your request: "${newMessage}". This is a simulated response for demonstration purposes.`,
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  // Get agent color based on type
  const getAgentColor = (type: string) => {
    const colorMap: Record<string, string> = {
      seo: 'bg-blue-500',
      copywriting: 'bg-green-500',
      creative: 'bg-purple-500',
      email: 'bg-yellow-500',
      social: 'bg-pink-500',
      analytics: 'bg-gray-500',
      strategy: 'bg-indigo-500',
      content: 'bg-teal-500',
      ads: 'bg-red-500',
    };
    
    return colorMap[type.toLowerCase()] || 'bg-blue-500';
  };
  
  const agentColorClass = getAgentColor(agent.type);
  const initials = getAgentInitials(agent.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-start space-y-0 space-x-4">
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            <AvatarImage src={agent.avatarUrl} alt={agent.name} />
            <AvatarFallback className={`${agentColorClass} text-white`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 pt-1">
            <DialogTitle className="text-xl">{agent.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>{agent.roleTitle || agent.type}</span>
              {agent.status && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {agent.status}
                </Badge>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <Info size={14} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings size={14} />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-auto">
            <div className="space-y-4 p-1">
              <div>
                <h4 className="text-sm font-semibold mb-1">About</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {agent.description || 'No description available.'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Capabilities</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {agent.type === 'seo' && (
                    <>
                      <li>Keyword research and optimization</li>
                      <li>Content analysis for search intent</li>
                      <li>Competitor SEO analysis</li>
                      <li>Technical SEO recommendations</li>
                    </>
                  )}
                  {agent.type === 'copywriting' && (
                    <>
                      <li>Persuasive marketing copy</li>
                      <li>Brand voice adaptation</li>
                      <li>A/B testing variants</li>
                      <li>Multilingual content adaptation</li>
                    </>
                  )}
                  {agent.type === 'creative' && (
                    <>
                      <li>Creative concept development</li>
                      <li>Visual design direction</li>
                      <li>Brand storytelling</li>
                      <li>Innovative campaign ideas</li>
                    </>
                  )}
                  {agent.type === 'social' && (
                    <>
                      <li>Social media content creation</li>
                      <li>Engagement strategy</li>
                      <li>Trend analysis and adaptation</li>
                      <li>Community management guidance</li>
                    </>
                  )}
                  {agent.type === 'strategy' && (
                    <>
                      <li>Marketing strategy development</li>
                      <li>Campaign planning and coordination</li>
                      <li>Performance forecasting</li>
                      <li>Budget optimization</li>
                    </>
                  )}
                  {agent.type === 'content' && (
                    <>
                      <li>Content calendar planning</li>
                      <li>Long-form content creation</li>
                      <li>Content performance analysis</li>
                      <li>Content repurposing strategy</li>
                    </>
                  )}
                  {agent.type === 'email' && (
                    <>
                      <li>Email sequence automation</li>
                      <li>Subject line optimization</li>
                      <li>Segmentation strategy</li>
                      <li>Deliverability improvement</li>
                    </>
                  )}
                  {agent.type === 'analytics' && (
                    <>
                      <li>Campaign performance analysis</li>
                      <li>Data visualization</li>
                      <li>Insight generation</li>
                      <li>ROI calculation</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Collaboration Style</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This agent works best when given clear objectives and constraints. 
                  It can operate autonomously but benefits from human feedback on strategic decisions.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-1">
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${message.role === 'system' ? 'justify-center' : ''}`}
                >
                  {message.role === 'system' ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {message.content}
                    </div>
                  ) : (
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2 border-t">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${agent.name}...`}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} className="self-end">Send</Button>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-auto">
            <div className="space-y-6 p-1">
              <div className="space-y-2">
                <Label htmlFor="autonomy-level">Autonomy Level</Label>
                <select 
                  id="autonomy-level"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900"
                  value={settings.autonomyLevel}
                  onChange={(e) => setSettings({...settings, autonomyLevel: e.target.value})}
                >
                  <option value="fully-autonomous">Fully Autonomous</option>
                  <option value="semi-autonomous">Semi-Autonomous</option>
                  <option value="human-guided">Human Guided</option>
                </select>
                <p className="text-xs text-gray-500">
                  Determines how much freedom the agent has to make decisions without approval.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response-style">Response Style</Label>
                <select 
                  id="response-style"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900"
                  value={settings.responseStyle}
                  onChange={(e) => setSettings({...settings, responseStyle: e.target.value})}
                >
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
                <p className="text-xs text-gray-500">
                  Controls the level of detail in agent responses.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Notifications</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer">Enable notifications</Label>
                  <input 
                    type="checkbox" 
                    id="notifications" 
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="detailed-reporting" className="cursor-pointer">Detailed reporting</Label>
                  <input 
                    type="checkbox" 
                    id="detailed-reporting" 
                    checked={settings.detailedReporting}
                    onChange={(e) => setSettings({...settings, detailedReporting: e.target.checked})}
                    className="h-4 w-4"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Access Control</h4>
                <Button variant="outline" size="sm">Configure Permissions</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {activeTab === 'settings' && (
            <Button>Save Settings</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}