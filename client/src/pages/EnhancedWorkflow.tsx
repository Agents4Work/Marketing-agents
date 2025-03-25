import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Node, Edge, ReactFlowInstance } from "reactflow";
import SidebarOptimized from "@/components/SidebarOptimized";
import Header from "@/components/Header";
import { Agent, AgentType } from "@/lib/agents";
import { useAuth } from "@/hooks/useAuth";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import EnhancedCanvas from "@/components/workflow/EnhancedCanvas";
import WorkflowPanel from "@/components/workflow/WorkflowPanel";
import { NodeData, WorkflowTemplate, NodeCategory } from "@/lib/workflowTypes";
import EnhancedAgentConfigModal from "@/components/EnhancedAgentConfigModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Play,
  Save,
  ArrowRight,
  Settings,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Bot,
  FileText,
} from "lucide-react";
import { workflowTemplates } from "@/lib/graph/workflow-templates";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define a result type for AI agent outputs
interface AgentResult {
  agentId: string;
  agentName: string;
  agentType: AgentType;
  outputType: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

// Workflow execution status
enum ExecutionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RUNNING = 'running', 
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Interface for workflow execution context
interface WorkflowExecutionContext {
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  currentNodeId?: string;
  progress: number;
  results: AgentResult[];
  errors: string[];
}

const EnhancedWorkflow = () => {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract template ID from URL if available
  const templateId = new URLSearchParams(location.split('?')[1]).get('template');
  
  const [campaignName, setCampaignName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [lastSaved, setLastSaved] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"autonomous" | "semiautonomous">("autonomous");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [activeNode, setActiveNode] = useState<NodeData | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [executionContext, setExecutionContext] = useState<WorkflowExecutionContext>({
    status: ExecutionStatus.IDLE,
    progress: 0,
    results: [],
    errors: []
  });
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Fetch agents
  const { data: agentsData, isLoading: isLoadingAgents } = useQuery<{ agents: Agent[] }>({
    queryKey: ["/api/agents/dev/all"],
  });
  
  // Extract agents from the response
  const agents = agentsData?.agents || [];

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Set up template if provided in URL
  useEffect(() => {
    if (templateId && workflowTemplates) {
      const template = workflowTemplates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setCampaignName(template.name);
        setWorkflowDescription(template.description);
        
        // If we have a ReactFlow instance, we'll set up the template nodes and edges
        if (reactFlowInstanceRef.current) {
          const flowInstance = reactFlowInstanceRef.current;
          
          // Position template nodes in the center of the viewport
          const viewport = flowInstance.getViewport();
          const viewportCenter = {
            x: viewport.x + window.innerWidth / 2,
            y: viewport.y + window.innerHeight / 2
          };
          
          // Create nodes from template with adjusted positions
          const templateNodes = template.nodes.map((node, index) => ({
            ...node,
            id: node.id || `node-${nanoid(6)}`,
            position: {
              x: viewportCenter.x - 200 + (index % 3) * 250,
              y: viewportCenter.y - 100 + Math.floor(index / 3) * 200
            },
            data: {
              ...node.data,
              label: node.data?.label || `Node ${index + 1}`,
            }
          }));
          
          // Create edges from template
          const templateEdges = template.edges.map(edge => {
            // Ensure we're properly extracting properties that might not exist in GraphEdge
            const edgeObj: Edge = {
              ...edge,
              id: edge.id || `edge-${nanoid(6)}`,
              source: edge.source,
              target: edge.target,
              animated: true
            };
            
            // Only add these properties if they exist
            if ('sourceHandle' in edge) edgeObj.sourceHandle = edge.sourceHandle as string;
            if ('targetHandle' in edge) edgeObj.targetHandle = edge.targetHandle as string;
            
            return edgeObj;
          });
          
          setNodes(templateNodes as Node[]);
          setEdges(templateEdges as Edge[]);
          
          // Fit the view to show all nodes
          setTimeout(() => {
            flowInstance.fitView({ padding: 0.2 });
          }, 200);
        }
      }
    } else {
      // Set default name for a new workflow
      setCampaignName("Nuevo AI Workflow");
      setWorkflowDescription("Workflow personalizado para automatizar tareas de marketing");
    }
  }, [templateId, reactFlowInstanceRef.current]);

  // Handle campaign name change
  const handleCampaignNameChange = (name: string) => {
    setCampaignName(name);
  };

  // Create/update campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      description: string;
      nodes: Node[]; 
      edges: Edge[];
      template?: string;
    }) => {
      if (campaignId) {
        // Update existing campaign
        const updateData = {
          name: data.name,
          description: data.description,
          workflowData: { nodes: data.nodes, edges: data.edges },
          templateId: data.template
        };
        return await apiRequest(`/api/campaigns/${campaignId}`, "PATCH", updateData);
      } else {
        // Create new campaign
        const campaignData = {
          userId: 1, // Using default user ID for now
          name: data.name,
          description: data.description,
          status: "draft",
          workflowData: { nodes: data.nodes, edges: data.edges },
          templateId: data.template
        };
        const campaign = await apiRequest("/api/campaigns", "POST", campaignData);
        setCampaignId(campaign.id);
        return campaign;
      }
    },
    onSuccess: () => {
      setLastSaved(formatLastSaved(new Date()));
      toast({
        title: "Workflow guardado",
        description: "Tu workflow ha sido guardado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar tu workflow. Inténtalo de nuevo.",
        variant: "destructive"
      });
      console.error("Error saving workflow:", error);
    }
  });

  // Save workflow
  const handleSaveWorkflow = useCallback(() => {
    saveCampaignMutation.mutate({
      name: campaignName,
      description: workflowDescription,
      nodes,
      edges,
      template: selectedTemplate?.id
    });
  }, [campaignName, workflowDescription, nodes, edges, selectedTemplate, saveCampaignMutation]);

  // Validate workflow
  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];
    
    // Check if workflow has nodes
    if (nodes.length === 0) {
      errors.push("El workflow está vacío. Agrega al menos un nodo para comenzar.");
      setValidationErrors(errors);
      return false;
    }
    
    // Check if there's at least one trigger node
    const triggerNodes = nodes.filter(node => 
      node.type === 'triggerNode' || 
      (node.data?.category === 'trigger')
    );
    
    if (triggerNodes.length === 0) {
      errors.push("El workflow debe tener al menos un nodo inicial de tipo 'Trigger'.");
    }
    
    // Check for output nodes
    const outputNodes = nodes.filter(node => 
      node.type === 'outputNode' || 
      (node.data?.category === 'output')
    );
    
    if (outputNodes.length === 0) {
      errors.push("El workflow debe tener al menos un nodo de salida para producir resultados.");
    }
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    const disconnectedNodes = nodes.filter(node => 
      !connectedNodeIds.has(node.id) &&
      node.data?.category !== 'trigger'
    );
    
    if (disconnectedNodes.length > 0) {
      errors.push(`Hay ${disconnectedNodes.length} nodo(s) desconectados en el workflow.`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [nodes, edges]);

  // Run campaign with simulated results
  const handleRunCampaign = useCallback(() => {
    // First validate the workflow
    if (!validateWorkflow()) {
      toast({
        title: "Workflow inválido",
        description: "Por favor corrige los errores antes de ejecutar el workflow.",
        variant: "destructive"
      });
      return;
    }
    
    // First save the workflow
    handleSaveWorkflow();
    
    // Simulate workflow execution
    setExecutionContext({
      status: ExecutionStatus.PREPARING,
      progress: 0,
      startTime: new Date(),
      results: [],
      errors: []
    });
    
    // Open results panel
    setIsResultsPanelOpen(true);
    
    // Simulate workflow execution with progress updates
    setTimeout(() => {
      setExecutionContext(prev => ({
        ...prev,
        status: ExecutionStatus.RUNNING,
        progress: 10
      }));
      
      // Simulate processing of each node
      const nodeCount = nodes.length;
      let processedCount = 0;
      
      // Process each node sequentially (in a real app, this would follow the workflow graph)
      const processNode = (index: number) => {
        if (index >= nodeCount) {
          // All nodes processed
          setTimeout(() => {
            setExecutionContext(prev => ({
              ...prev,
              status: ExecutionStatus.COMPLETED,
              progress: 100,
              endTime: new Date()
            }));
            
            toast({
              title: "Workflow completado",
              description: "Todos los agentes han finalizado su trabajo exitosamente.",
            });
          }, 1000);
          return;
        }
        
        const node = nodes[index];
        const nodeData = node.data;
        
        // Update execution context to show current node
        setExecutionContext(prev => ({
          ...prev,
          currentNodeId: node.id,
          progress: Math.min(90, Math.round((processedCount / nodeCount) * 90))
        }));
        
        // If node is an agent node, generate a result
        if (nodeData?.category === 'agent' && nodeData.nodeType.type === 'agent') {
          const agentType = nodeData.nodeType.agentType as AgentType;
          
          // Simulate processing time based on agent type
          const processingTime = 
            agentType === 'creative' ? 3000 : 
            agentType === 'analytics' ? 2500 : 
            agentType === 'seo' ? 2000 : 1500;
          
          setTimeout(() => {
            // Generate result for this agent
            const result: AgentResult = {
              agentId: node.id,
              agentName: nodeData.label || `Agent ${index}`,
              agentType: agentType,
              outputType: getOutputTypeForAgent(agentType),
              data: generateSimulatedResultForAgent(agentType),
              timestamp: new Date(),
              status: 'completed'
            };
            
            // Add result to execution context
            setExecutionContext(prev => ({
              ...prev,
              results: [...prev.results, result],
              progress: Math.min(90, Math.round(((processedCount + 1) / nodeCount) * 90))
            }));
            
            // Process next node
            processedCount++;
            processNode(index + 1);
          }, processingTime);
        } else {
          // For non-agent nodes, just move to the next one quickly
          setTimeout(() => {
            processedCount++;
            processNode(index + 1);
          }, 500);
        }
      };
      
      // Start processing nodes
      processNode(0);
      
    }, 1000);
  }, [nodes, validateWorkflow, handleSaveWorkflow, toast]);

  // Helper to get output type for an agent
  const getOutputTypeForAgent = (agentType: AgentType): string => {
    switch (agentType) {
      case 'copywriting': return 'text/content';
      case 'seo': return 'keywords/analysis';
      case 'creative': return 'image/design';
      case 'ads': return 'ad_copy/campaign';
      case 'email': return 'email_template';
      case 'analytics': return 'data_analysis';
      case 'social': return 'social_posts';
      default: return 'generic_output';
    }
  };
  
  // Helper to generate simulated results for different agent types
  const generateSimulatedResultForAgent = (agentType: AgentType): any => {
    switch (agentType) {
      case 'copywriting':
        return {
          title: "Marketing en la Era Digital: Estrategias para Destacar",
          content: "En la era digital actual, las estrategias de marketing han evolucionado significativamente. Las empresas deben adaptarse a nuevas tecnologías y comportamientos del consumidor para destacar en un mercado saturado...",
          variations: 3,
          wordCount: 750
        };
      case 'seo':
        return {
          keywords: ["marketing digital", "estrategias online", "posicionamiento web", "SEO avanzado"],
          density: 2.4,
          competitionScore: 68,
          recommendations: [
            "Optimizar meta descripciones",
            "Mejorar estructura de encabezados",
            "Aumentar backlinks de calidad"
          ]
        };
      case 'creative':
        return {
          imageUrl: "https://example.com/images/marketing-concept.png",
          dimensions: "1200x630px",
          style: "Minimalista con colores corporativos",
          format: "PNG transparente",
          variations: 2
        };
      case 'ads':
        return {
          headlines: [
            "Transforma tu Marketing con IA Avanzada",
            "Automatiza tu Marketing y Duplica Resultados",
            "La Revolución del Marketing está Aquí"
          ],
          descriptions: [
            "Nuestra plataforma utiliza IA para optimizar tus campañas y maximizar ROI.",
            "Ahorra tiempo y recursos mientras aumentas la eficacia de tu marketing."
          ],
          targetAudience: "Profesionales de marketing, 28-45 años",
          platforms: ["Google Ads", "Meta Ads"]
        };
      case 'email':
        return {
          subject: "Descubre el Poder de la IA en tu Estrategia de Marketing",
          openRate: "42% (proyectado)",
          body: "Hola [Nombre],\n\nEn el competitivo mundo del marketing actual, mantenerse al frente requiere herramientas avanzadas y estrategias innovadoras...",
          cta: "Programa una Demo",
          segmentation: "Leads calificados - Interés en tecnología"
        };
      case 'analytics':
        return {
          metrics: {
            engagement: 78,
            conversion: 4.2,
            roi: 312,
            ctr: 3.8
          },
          trends: ["Aumento del 23% en engagement", "Reducción del 12% en tasa de rebote"],
          recommendations: [
            "Optimizar horarios de publicación según análisis de engagement",
            "Reforzar contenido en formato video para aumentar tiempo de permanencia"
          ]
        };
      case 'social':
        return {
          posts: [
            {
              platform: "LinkedIn",
              content: "La automatización del marketing no se trata solo de tecnología, sino de liberarte para centrarte en lo que realmente importa: la estrategia. #MarketingAutomation #AIMarketing",
              hashtags: ["#MarketingAutomation", "#AIMarketing"],
              bestTime: "Martes 10:30 AM"
            },
            {
              platform: "Twitter",
              content: "¿Sabías que las empresas que automatizan su marketing ven un aumento promedio del 14.5% en productividad? Descubre cómo puedes superar ese número 👇 #MarketingTips",
              hashtags: ["#MarketingTips", "#Automation"],
              bestTime: "Miércoles 12:15 PM"
            }
          ],
          schedule: "Optimal posting times programmed",
          engagement: "Projected 32% increase in engagement"
        };
      default:
        return {
          message: "Generic output for this agent type",
          status: "Generated successfully"
        };
    }
  };

  // Mode change handler
  const handleModeChange = (newMode: "autonomous" | "semiautonomous") => {
    setMode(newMode);
  };

  // Handle node click for configuration
  const handleNodeClick = (nodeData: NodeData) => {
    // Add event handlers to the node data before opening the configuration
    const enhancedNodeData = {
      ...nodeData,
      onConfigure: (data: NodeData) => {
        console.log('Configure node:', data);
        setActiveNode(data);
        setIsConfigOpen(true);
      },
      onExecute: (data: NodeData) => {
        console.log('Execute node:', data);
        toast({
          title: "Ejecutando nodo",
          description: `Ejecutando ${data.label}...`
        });
      },
      onDelete: (data: NodeData) => {
        console.log('Delete node:', data);
        // Find and remove the node from the workflow
        setNodes(nodes.filter(node => node.id !== data.id));
        // Remove all connected edges
        setEdges(edges.filter(edge => 
          edge.source !== data.id && edge.target !== data.id
        ));
        toast({
          title: "Nodo eliminado",
          description: `${data.label} ha sido eliminado del workflow.`
        });
      }
    };
    
    setActiveNode(enhancedNodeData);
    setIsConfigOpen(true);
  };

  // Handle node drag from panel
  const handleNodeDrag = (node: NodeData) => {
    console.log('Node dragged from panel:', node);
  };

  // Store ReactFlow instance reference
  const handleReactFlowInit = (instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  };

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "hace un momento";
    } else if (diffInMinutes === 1) {
      return "hace 1 minuto";
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} minutos`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
  };

  // Get status badge for execution status
  const getStatusBadge = () => {
    switch (executionContext.status) {
      case ExecutionStatus.IDLE:
        return <Badge variant="outline">Listo para ejecutar</Badge>;
      case ExecutionStatus.PREPARING:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Preparando...</Badge>;
      case ExecutionStatus.RUNNING:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Ejecutando</Badge>;
      case ExecutionStatus.PAUSED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pausado</Badge>;
      case ExecutionStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completado</Badge>;
      case ExecutionStatus.ERROR:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Estado desconocido</Badge>;
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
          title="Diseñador de AI Workflows"
          campaignName={campaignName}
          onCampaignNameChange={handleCampaignNameChange}
          onSaveWorkflow={handleSaveWorkflow}
          onRunCampaign={handleRunCampaign}
          lastSaved={lastSaved}
          mode={mode}
          onModeChange={handleModeChange}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <WorkflowPanel 
            agents={agents}
            onNodeDrag={handleNodeDrag}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="mx-4 mt-2 mb-0">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errores en el workflow</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Canvas Area */}
            <EnhancedCanvas 
              agents={agents}
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onSave={handleSaveWorkflow}
              onRun={handleRunCampaign}
              onNodeClick={handleNodeClick}
              onInit={handleReactFlowInit}
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced Agent Configuration Modal */}
      {activeNode && activeNode.category === 'agent' && (
        <EnhancedAgentConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          nodeData={activeNode}
          onUpdate={(updatedData) => {
            // Update the node with the new data
            const updatedNode = { ...activeNode, ...updatedData };
            setActiveNode(updatedNode);
            
            // Update the node in the workflow
            setNodes(nodes.map(node => 
              node.id === activeNode.id 
                ? { 
                    ...node, 
                    data: { 
                      ...node.data, 
                      ...updatedData,
                      label: updatedData.label || node.data.label,
                      agent: updatedData.agent || node.data.agent,
                      description: updatedData.description || node.data.description,
                      customPrompt: updatedData.customPrompt || node.data.customPrompt,
                      documents: updatedData.documents || node.data.documents,
                    } 
                  } 
                : node
            ));
            
            toast({
              title: "Configuración actualizada",
              description: "Los cambios han sido aplicados al nodo."
            });
          }}
        />
      )}
      
      {/* Basic Configuration Sheet for non-agent nodes */}
      {activeNode && activeNode.category !== 'agent' && (
        <Sheet open={isConfigOpen} onOpenChange={(value) => setIsConfigOpen(value)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Configurar Nodo</SheetTitle>
              <SheetDescription>
                {activeNode.label}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="nodeName">Nombre del nodo</Label>
                <Input 
                  id="nodeName" 
                  value={activeNode.label} 
                  onChange={(e) => {
                    setActiveNode({...activeNode, label: e.target.value});
                    // Update node in the workflow
                    setNodes(nodes.map(node => 
                      node.id === activeNode.id 
                        ? {...node, data: {...node.data, label: e.target.value}} 
                        : node
                    ));
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="nodeDescription">Descripción</Label>
                <Textarea 
                  id="nodeDescription" 
                  value={activeNode.description || ''} 
                  onChange={(e) => {
                    setActiveNode({...activeNode, description: e.target.value});
                    // Update node in the workflow
                    setNodes(nodes.map(node => 
                      node.id === activeNode.id 
                        ? {...node, data: {...node.data, description: e.target.value}} 
                        : node
                    ));
                  }}
                  placeholder="Descripción opcional del nodo"
                />
              </div>
            </div>
            
            <SheetFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsConfigOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Configuración actualizada",
                    description: "Los cambios han sido aplicados al nodo."
                  });
                  setIsConfigOpen(false);
                }}
              >
                Guardar cambios
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Results Panel */}
      <Sheet 
        open={isResultsPanelOpen} 
        onOpenChange={(value) => setIsResultsPanelOpen(value)}
      >
        <SheetContent className="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
          <SheetHeader>
            <div className="flex justify-between items-center">
              <SheetTitle>Resultados del Workflow</SheetTitle>
              {getStatusBadge()}
            </div>
            <SheetDescription>
              {executionContext.status === ExecutionStatus.IDLE && (
                "El workflow aún no ha sido ejecutado"
              )}
              {executionContext.status === ExecutionStatus.PREPARING && (
                "Preparando la ejecución del workflow..."
              )}
              {executionContext.status === ExecutionStatus.RUNNING && (
                "Ejecutando agentes de IA en secuencia"
              )}
              {executionContext.status === ExecutionStatus.COMPLETED && (
                `Workflow completado en ${
                  executionContext.startTime && executionContext.endTime
                    ? ((executionContext.endTime.getTime() - executionContext.startTime.getTime()) / 1000).toFixed(1)
                    : "?"
                } segundos`
              )}
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            {/* Progress Bar */}
            {(executionContext.status === ExecutionStatus.PREPARING || 
              executionContext.status === ExecutionStatus.RUNNING) && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso</span>
                  <span>{executionContext.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${executionContext.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Results */}
            {executionContext.status !== ExecutionStatus.IDLE && (
              <div className="space-y-6">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-4 mt-4">
                    {/* Running Status */}
                    {executionContext.status === ExecutionStatus.RUNNING && (
                      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                          {executionContext.currentNodeId ? 
                            `Procesando: ${nodes.find(n => n.id === executionContext.currentNodeId)?.data?.label || 'Nodo actual'}` : 
                            'Procesando workflow...'
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Completed Status */}
                    {executionContext.status === ExecutionStatus.COMPLETED && (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Workflow completado exitosamente
                        </span>
                      </div>
                    )}
                    
                    {/* Results Count */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold">{executionContext.results.length}</p>
                          <p className="text-sm text-gray-500">Resultados generados</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold">
                            {executionContext.status === ExecutionStatus.COMPLETED ? '100%' : 
                             `${executionContext.progress}%`}
                          </p>
                          <p className="text-sm text-gray-500">Completado</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Latest Results */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Últimos resultados</h3>
                      <ScrollArea className="h-[240px]">
                        <div className="space-y-3">
                          {executionContext.results.slice().reverse().map((result, index) => (
                            <Card key={index} className="overflow-hidden">
                              <CardHeader className="p-3 pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-sm">{result.agentName}</CardTitle>
                                  <Badge variant="outline" className="text-xs">
                                    {result.agentType}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="text-xs text-gray-500">
                                  {result.agentType === 'copywriting' && (
                                    <div className="space-y-1">
                                      <p className="font-medium">{result.data.title}</p>
                                      <p className="line-clamp-2">{result.data.content}</p>
                                    </div>
                                  )}
                                  
                                  {result.agentType === 'seo' && (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap gap-1 mb-1">
                                        {result.data.keywords.map((kw: string, i: number) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {kw}
                                          </Badge>
                                        ))}
                                      </div>
                                      <p>Densidad: {result.data.density}%</p>
                                    </div>
                                  )}
                                  
                                  {result.agentType === 'social' && (
                                    <div className="space-y-1">
                                      {result.data.posts.slice(0, 1).map((post: any, i: number) => (
                                        <div key={i}>
                                          <span className="font-medium">{post.platform}:</span>
                                          <p className="line-clamp-2">{post.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* General case for other agent types */}
                                  {!['copywriting', 'seo', 'social'].includes(result.agentType) && (
                                    <p>Resultado generado ({typeof result.data === 'object' ? 
                                      Object.keys(result.data).length : 1} elementos)</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          {executionContext.results.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                              <p>No hay resultados aún</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium">Detalles de ejecución</h3>
                        
                        {executionContext.status === ExecutionStatus.COMPLETED && (
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Download className="h-3.5 w-3.5" />
                            <span>Exportar</span>
                          </Button>
                        )}
                      </div>
                      
                      <ScrollArea className="h-[360px]">
                        <div className="space-y-6">
                          {/* Agent Results In Detail */}
                          {executionContext.results.map((result, index) => (
                            <Card key={index}>
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <Bot className="h-4 w-4" />
                                      {result.agentName}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {new Date(result.timestamp).toLocaleTimeString()} · {result.outputType}
                                    </CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {result.agentType}
                                  </Badge>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-4 pt-2">
                                {/* Different UI based on agent type */}
                                {result.agentType === 'copywriting' && (
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-sm font-medium">Título</h4>
                                      <p className="text-sm">{result.data.title}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Contenido</h4>
                                      <p className="text-sm text-gray-600">{result.data.content}</p>
                                    </div>
                                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                      <div>Variaciones: {result.data.variations}</div>
                                      <div>Palabras: {result.data.wordCount}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {result.agentType === 'seo' && (
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-sm font-medium">Palabras clave</h4>
                                      <div className="flex flex-wrap gap-1 my-1">
                                        {result.data.keywords.map((kw: string, i: number) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {kw}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Recomendaciones</h4>
                                      <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                        {result.data.recommendations.map((rec: string, i: number) => (
                                          <li key={i}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                      <div>Densidad: {result.data.density}%</div>
                                      <div>Competencia: {result.data.competitionScore}/100</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Generic display for other agent types */}
                                {!['copywriting', 'seo'].includes(result.agentType) && (
                                  <div className="text-sm">
                                    <pre className="bg-gray-50 p-3 rounded-md overflow-auto text-xs">
                                      {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </CardContent>
                              
                              <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                                <span className="text-xs text-gray-500">
                                  ID: {result.agentId.slice(0, 8)}
                                </span>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  Ver detalles
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                          
                          {executionContext.results.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                              <p>No hay resultados detallados disponibles</p>
                              {executionContext.status === ExecutionStatus.RUNNING && (
                                <p className="text-sm mt-2">El workflow está en ejecución...</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {/* Empty State */}
            {executionContext.status === ExecutionStatus.IDLE && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Play className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-center mb-2">El workflow aún no ha sido ejecutado</p>
                <p className="text-sm text-center max-w-xs">
                  Haz clic en el botón "Ejecutar" para iniciar el workflow y ver los resultados en tiempo real.
                </p>
                
                <Button 
                  className="mt-6"
                  onClick={() => {
                    setIsResultsPanelOpen(false);
                    setTimeout(() => {
                      handleRunCampaign();
                    }, 500);
                  }}
                >
                  Ejecutar Workflow
                </Button>
              </div>
            )}
          </div>
          
          {/* Footer actions */}
          {executionContext.status === ExecutionStatus.COMPLETED && (
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset execution context
                  setExecutionContext({
                    status: ExecutionStatus.IDLE,
                    progress: 0,
                    results: [],
                    errors: []
                  });
                }}
              >
                Reiniciar
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Resultados guardados",
                    description: "Los resultados han sido guardados exitosamente."
                  });
                }}
              >
                Guardar resultados
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EnhancedWorkflow;