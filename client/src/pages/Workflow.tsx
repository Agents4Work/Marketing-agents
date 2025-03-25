import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Node, Edge } from "reactflow";
import SidebarOptimized from "@/components/SidebarOptimized";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import AgentPanel from "@/components/AgentPanel";
import { Agent } from "@/lib/agents";
import { useAuth } from "@/hooks/useAuth";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

const Workflow = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [campaignName, setCampaignName] = useState("New Marketing Campaign");
  const [lastSaved, setLastSaved] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"autonomous" | "semiautonomous">("autonomous");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [campaignId, setCampaignId] = useState<number | null>(null);

  // Fetch agents
  const { data, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["/api/agents/dev/all"],
  });
  
  // Extract agents from the response and provide a default empty array
  const agents = (data?.agents || []) as Agent[];

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Handle campaign name change
  const handleCampaignNameChange = (name: string) => {
    setCampaignName(name);
  };

  // Create/update campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: async (data: { name: string; nodes: Node[]; edges: Edge[] }) => {
      if (campaignId) {
        // Update existing campaign
        const updateData = {
          name: data.name,
          workflowData: { nodes: data.nodes, edges: data.edges }
        };
        return await apiRequest(`/api/campaigns/${campaignId}`, "PATCH", updateData);
      } else {
        // Create new campaign
        const campaignData = {
          userId: 1, // Using default user ID for now
          name: data.name,
          status: "draft",
          workflowData: { nodes: data.nodes, edges: data.edges }
        };
        const campaign = await apiRequest("/api/campaigns", "POST", campaignData);
        setCampaignId(campaign.id);
        return campaign;
      }
    },
    onSuccess: () => {
      setLastSaved(formatLastSaved(new Date()));
    },
    onError: (error) => {
      toast({
        title: "Error saving campaign",
        description: "Could not save your campaign. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving campaign:", error);
    }
  });

  // Save workflow
  const handleSaveWorkflow = useCallback(() => {
    saveCampaignMutation.mutate({
      name: campaignName,
      nodes,
      edges
    });
  }, [campaignName, nodes, edges, saveCampaignMutation]);

  // Run campaign
  const handleRunCampaign = useCallback(() => {
    // First save the workflow
    handleSaveWorkflow();
    
    // Then update status to running
    if (campaignId) {
      apiRequest(`/api/campaigns/${campaignId}`, "PATCH", { status: "running" })
        .then(() => {
          toast({
            title: "Campaign started",
            description: "AI agents are now working on your campaign.",
          });
        })
        .catch((error) => {
          toast({
            title: "Error starting campaign",
            description: "Could not start your campaign. Please try again.",
            variant: "destructive"
          });
          console.error("Error starting campaign:", error);
        });
    } else {
      toast({
        title: "Save required",
        description: "Please save your workflow before running the campaign.",
        variant: "destructive"
      });
    }
  }, [campaignId, handleSaveWorkflow, toast]);

  // Mode change handler
  const handleModeChange = (newMode: "autonomous" | "semiautonomous") => {
    setMode(newMode);
  };

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes === 1) {
      return "1 minute ago";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
  };

  // Loading state
  if (loading || isLoadingAgents) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Custom Workflow"
          campaignName={campaignName}
          onCampaignNameChange={handleCampaignNameChange}
          onSaveWorkflow={handleSaveWorkflow}
          onRunCampaign={handleRunCampaign}
          lastSaved={lastSaved}
          mode={mode}
          onModeChange={handleModeChange}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <AgentPanel 
            agents={agents as Agent[]}
            onAgentDrag={() => {}}
          />
          <Canvas 
            agents={agents as Agent[]}
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />
        </div>
      </div>
    </div>
  );
};

export default Workflow;
