/**
 * Workflow Executor Component
 * 
 * This component executes Lego-style workflows via Vertex AI and renders the results
 * in real-time, showing agent-specific output and status updates.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, PauseCircle, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  LegoWorkflowExecutionParams,
  LegoWorkflowExecutionResult,
  LegoWorkflowNode,
  LegoWorkflowEdge,
  executeLegoWorkflow
} from '@/lib/langchain-sdk';
import AIConfigurationDialog from './AIConfigurationDialog';

// Types for component props and state
interface WorkflowExecutorProps {
  workflow: string;
  nodes: LegoWorkflowNode[];
  edges: LegoWorkflowEdge[];
  initialState?: Record<string, any>;
  model?: string;
  onExecutionComplete?: (result: LegoWorkflowExecutionResult) => void;
  className?: string;
}

// Execution status type
enum ExecutionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Node result display components
interface NodeResultCardProps {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  result: any;
  isError?: boolean;
}

const NodeResultCard: React.FC<NodeResultCardProps> = ({
  nodeId,
  nodeName,
  nodeType,
  result,
  isError = false
}) => {
  const renderResultContent = () => {
    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error in {nodeName}</AlertTitle>
          <AlertDescription>
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </AlertDescription>
        </Alert>
      );
    }

    // For text content
    if (typeof result === 'string') {
      return <div className="whitespace-pre-wrap">{result}</div>;
    }
    
    // For list content
    if (Array.isArray(result)) {
      return (
        <ul className="space-y-2 list-disc pl-5">
          {result.map((item, index) => (
            <li key={index}>
              {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
            </li>
          ))}
        </ul>
      );
    }
    
    // For object content
    if (typeof result === 'object' && result !== null) {
      return (
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      );
    }
    
    // Fallback for other types
    return <div>{JSON.stringify(result)}</div>;
  };

  // Select card style based on node type
  const getCardBorderClass = () => {
    if (isError) return 'border-red-300';
    
    switch(nodeType) {
      case 'agent':
        return 'border-blue-300';
      case 'trigger':
        return 'border-green-300';
      case 'output':
        return 'border-purple-300';
      case 'data':
        return 'border-amber-300';
      case 'logic':
        return 'border-cyan-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <Card className={`${getCardBorderClass()} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">{nodeName}</CardTitle>
          <Badge variant={isError ? "destructive" : "outline"}>
            {nodeType}
          </Badge>
        </div>
        <CardDescription>Node ID: {nodeId}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 max-h-80 overflow-auto">
        {renderResultContent()}
      </CardContent>
    </Card>
  );
};

// Main workflow executor component
const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  workflow,
  nodes,
  edges,
  initialState = {},
  model,
  onExecutionComplete,
  className
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ExecutionStatus>(ExecutionStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [executionResult, setExecutionResult] = useState<LegoWorkflowExecutionResult | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Function to execute the workflow
  const executeWorkflow = async () => {
    try {
      setStatus(ExecutionStatus.PREPARING);
      setProgress(10);
      setStartTime(new Date());
      
      const executionParams: LegoWorkflowExecutionParams = {
        workflow,
        nodes,
        edges,
        initialState,
        model
      };
      
      // Start execution
      setStatus(ExecutionStatus.RUNNING);
      setProgress(25);
      
      // Call the workflow execution API
      const result = await executeLegoWorkflow(executionParams);
      
      // Process result
      setExecutionResult(result);
      setExecutionTime(result.executionTime);
      
      // Update status based on result
      if (result.success) {
        setStatus(ExecutionStatus.COMPLETED);
        setProgress(100);
        toast({
          title: "Workflow Completed",
          description: `Successfully executed with ${result.nodeResults ? Object.keys(result.nodeResults).length : 0} node results`,
        });
      } else {
        setStatus(ExecutionStatus.ERROR);
        setProgress(100);
        toast({
          title: "Workflow Error",
          description: `Execution failed with ${result.errors?.length || 0} errors`,
          variant: "destructive"
        });
      }
      
      // Call the completion callback if provided
      if (onExecutionComplete) {
        onExecutionComplete(result);
      }
      
    } catch (error) {
      console.error("Error executing workflow:", error);
      setStatus(ExecutionStatus.ERROR);
      setProgress(100);
      
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Restart workflow execution
  const resetWorkflow = () => {
    setStatus(ExecutionStatus.IDLE);
    setProgress(0);
    setExecutionTime(0);
    setExecutionResult(null);
    setStartTime(null);
  };
  
  // Calculate elapsed time when workflow is running
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (status === ExecutionStatus.RUNNING && startTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setExecutionTime(elapsed);
        
        // Calculate progress for running state (from 25% to 95%)
        if (progress < 95) {
          // Gradually slow down progress as we get closer to 95%
          const increment = Math.max(0.5, (95 - progress) / 30);
          setProgress(prev => Math.min(95, prev + increment));
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, startTime, progress]);
  
  // Format execution time as MM:SS
  const formatExecutionTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    switch (status) {
      case ExecutionStatus.IDLE:
        return <Badge variant="outline">Ready</Badge>;
      case ExecutionStatus.PREPARING:
        return <Badge variant="outline" className="bg-blue-50">Preparing</Badge>;
      case ExecutionStatus.RUNNING:
        return <Badge variant="secondary" className="bg-blue-100">Running</Badge>;
      case ExecutionStatus.PAUSED:
        return <Badge variant="outline" className="bg-yellow-50">Paused</Badge>;
      case ExecutionStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case ExecutionStatus.ERROR:
        return <Badge variant="destructive">Error</Badge>;
    }
  };
  
  // Get progress color based on status
  const getProgressColor = (): string => {
    switch (status) {
      case ExecutionStatus.RUNNING:
        return 'bg-blue-500';
      case ExecutionStatus.COMPLETED:
        return 'bg-green-500';
      case ExecutionStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-blue-200';
    }
  };
  
  // Render primary action button based on current status
  const renderActionButton = () => {
    switch (status) {
      case ExecutionStatus.IDLE:
        return (
          <Button onClick={executeWorkflow} className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Execute Workflow
          </Button>
        );
      case ExecutionStatus.RUNNING:
      case ExecutionStatus.PREPARING:
        return (
          <Button disabled className="gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Running...
          </Button>
        );
      case ExecutionStatus.COMPLETED:
      case ExecutionStatus.ERROR:
        return (
          <Button onClick={resetWorkflow} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        );
      default:
        return null;
    }
  };

  // Render execution results
  const renderResults = () => {
    if (!executionResult || !executionResult.nodeResults) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
          <p>No results available yet. Execute the workflow to see results here.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {Object.entries(executionResult.nodeResults).map(([nodeId, result]) => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return null;
          
          return (
            <NodeResultCard
              key={nodeId}
              nodeId={nodeId}
              nodeName={node.data.label || nodeId}
              nodeType={node.type || node.data.type || 'unknown'}
              result={result}
            />
          );
        })}
      </div>
    );
  };
  
  // Render errors if present
  const renderErrors = () => {
    if (!executionResult || !executionResult.errors || executionResult.errors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mb-4 text-green-400" />
          <p>No errors found during execution.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 py-4">
        {executionResult.errors.map((error, index) => {
          const node = nodes.find(n => n.id === error.nodeId);
          
          return (
            <NodeResultCard
              key={`error-${index}`}
              nodeId={error.nodeId}
              nodeName={node?.data.label || error.nodeId}
              nodeType={node?.type || node?.data.type || 'unknown'}
              result={error.error}
              isError={true}
            />
          );
        })}
      </div>
    );
  };
  
  // Render execution summary
  const renderSummary = () => {
    if (!executionResult) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
          <p>Execute the workflow to see a summary of the execution.</p>
        </div>
      );
    }
    
    const nodeStats = {
      total: nodes.length,
      processed: Object.keys(executionResult.nodeResults || {}).length,
      errors: executionResult.errors?.length || 0
    };
    
    return (
      <div className="space-y-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Execution Information</CardTitle>
            <CardDescription>Details about the workflow execution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p>{executionResult.state.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Execution Time</p>
                  <p>{formatExecutionTime(executionResult.executionTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p>{new Date(executionResult.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p>{executionResult.endTime ? new Date(executionResult.endTime).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Execution ID</p>
                  <p className="font-mono text-xs">{executionResult.executionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Workflow</p>
                  <p>{executionResult.workflow}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Node Statistics</CardTitle>
            <CardDescription>Execution stats for workflow nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-md">
                <span className="text-2xl font-bold text-gray-800">{nodeStats.total}</span>
                <span className="text-sm text-gray-500">Total Nodes</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-md">
                <span className="text-2xl font-bold text-green-600">{nodeStats.processed}</span>
                <span className="text-sm text-gray-500">Processed Nodes</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-md">
                <span className="text-2xl font-bold text-red-600">{nodeStats.errors}</span>
                <span className="text-sm text-gray-500">Errors</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Raw state display (for advanced users) */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Execution State</CardTitle>
            <CardDescription>Advanced execution data</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto text-xs">
              {JSON.stringify(executionResult.state, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Workflow Executor</CardTitle>
              <CardDescription>
                Execute Lego-style workflows using Vertex AI
              </CardDescription>
            </div>
            {renderStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Execution progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>
                  {status === ExecutionStatus.IDLE ? 'Ready to execute' : 
                   status === ExecutionStatus.PREPARING ? 'Preparing workflow...' :
                   status === ExecutionStatus.RUNNING ? 'Executing workflow...' :
                   status === ExecutionStatus.COMPLETED ? 'Workflow completed' :
                   status === ExecutionStatus.ERROR ? 'Execution failed' : ''}
                </span>
                <span>Time: {formatExecutionTime(executionTime)}</span>
              </div>
              <Progress value={progress} className={getProgressColor()} />
            </div>
            
            {/* Tabs for different views */}
            <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="min-h-[300px]">
                {renderResults()}
              </TabsContent>
              
              <TabsContent value="errors" className="min-h-[300px]">
                {renderErrors()}
              </TabsContent>
              
              <TabsContent value="summary" className="min-h-[300px]">
                {renderSummary()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter className="justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setConfigDialogOpen(true)}
          >
            Configure AI
          </Button>
          
          {renderActionButton()}
        </CardFooter>
      </Card>
      
      <AIConfigurationDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onConfigSaved={() => {
          toast({
            title: "Configuration Updated",
            description: "AI configuration has been saved successfully.",
          });
        }}
      />
    </div>
  );
};

export default WorkflowExecutor;