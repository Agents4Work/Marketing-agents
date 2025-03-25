import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, FileText, PlayCircle } from 'lucide-react';
import { Agent } from '@/lib/agents';
import { NodeData } from '@/lib/workflowTypes';
import AgentConfigModal from './AgentConfigModal';
import AgentCustomPromptEditor from './AgentCustomPromptEditor';

interface EnhancedAgentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: NodeData;
  onUpdate: (updatedData: Partial<NodeData>) => void;
}

export default function EnhancedAgentConfigModal({ 
  isOpen, 
  onClose, 
  nodeData, 
  onUpdate 
}: EnhancedAgentConfigModalProps) {
  const [activeTab, setActiveTab] = useState<string>('config');
  const [agent, setAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && nodeData.agent) {
      setAgent(nodeData.agent);
    }
  }, [isOpen, nodeData]);

  const handleAgentConfigUpdate = (updatedAgent: Agent) => {
    setAgent(updatedAgent);
    onUpdate({ agent: updatedAgent });
  };

  const handleCustomPromptUpdate = (data: Partial<NodeData>) => {
    onUpdate(data);
  };

  const handleSave = () => {
    toast({
      title: "Agent configuration saved",
      description: `${nodeData.label} has been updated with your configuration.`
    });
    onClose();
  };

  if (!agent && nodeData.agent) {
    return null; // Loading state
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="inline-block h-6 w-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
              {nodeData.icon && <span className="text-blue-700">{nodeData.icon}</span>}
            </span>
            Configure {nodeData.label}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="pt-4 min-h-[300px]">
            {agent && (
              <div className="mb-4">
                <AgentConfigModal 
                  isOpen={true} 
                  onClose={() => {}} 
                  agent={agent} 
                  onConfigUpdate={handleAgentConfigUpdate}
                  embedded={true}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="pt-4 min-h-[300px]">
            <AgentCustomPromptEditor 
              nodeData={nodeData} 
              onUpdate={handleCustomPromptUpdate} 
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={handleSave}
          >
            <PlayCircle className="h-4 w-4" />
            Save & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}