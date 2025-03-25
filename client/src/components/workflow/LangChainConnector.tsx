/**
 * LangChain Connector Component
 * 
 * This component displays the connection status for all LangChain ecosystem services
 * and provides a way to configure API keys and other settings.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertOctagon, CheckCircle, RefreshCw, Settings, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AIConfigurationDialog from './AIConfigurationDialog';
import { 
  checkAllLangChainServices,
  checkLangChainHealth,
  checkLangSmithHealth,
  checkLangFlowHealth,
  checkWorkflowHealth,
} from '@/lib/langchain-sdk';

// Type definitions
interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'loading';
  message?: string;
  details?: any;
}

// Initial status values
const initialStatus: ServiceStatus[] = [
  { name: 'OpenAI', status: 'loading' },
  { name: 'LangChain', status: 'loading' },
  { name: 'LangSmith', status: 'loading' },
  { name: 'LangFlow', status: 'loading' },
  { name: 'Workflow Engine', status: 'loading' },
];

const LangChainConnector: React.FC = () => {
  const { toast } = useToast();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>(initialStatus);
  
  // Load service status on component mount
  useEffect(() => {
    refreshStatus();
  }, []);
  
  // Function to refresh service status
  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Set all services to loading state
      setServiceStatus(prev => prev.map(service => ({ ...service, status: 'loading' as const })));
      
      // Fetch status for all services
      const results = await checkAllLangChainServices();
      
      // Update service status based on results
      const newStatus: ServiceStatus[] = [
        {
          name: 'OpenAI',
          status: results.openai === 'connected' ? 'online' : 'offline',
          message: results.openai === 'connected' 
            ? 'API key is valid and connected' 
            : 'API key missing or invalid',
        },
        {
          name: 'LangChain',
          status: results.langchain?.status === 'ok' ? 'online' : 'offline',
          message: results.langchain?.message || 'Service unavailable',
        },
        {
          name: 'LangSmith',
          status: results.langsmith?.status === 'ok' ? 'online' : 'offline',
          message: results.langsmith?.message || 'Service unavailable',
          details: results.langsmith?.details,
        },
        {
          name: 'LangFlow',
          status: results.langflow?.status === 'ok' ? 'online' : 'offline',
          message: results.langflow?.message || 'Service unavailable',
        },
        {
          name: 'Workflow Engine',
          status: results.workflow?.status === 'ok' ? 'online' : 'offline',
          message: results.workflow?.message || 'Service unavailable',
        },
      ];
      
      setServiceStatus(newStatus);
      
      // Show toast with status
      const allOnline = newStatus.every(service => service.status === 'online');
      if (allOnline) {
        toast({
          title: 'All Services Connected',
          description: 'All LangChain ecosystem services are online and available.',
        });
      } else {
        const offlineCount = newStatus.filter(service => service.status === 'offline').length;
        toast({
          title: `${offlineCount} Service${offlineCount !== 1 ? 's' : ''} Offline`,
          description: 'Some services require configuration. Click "Configure" to set up.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error refreshing service status:', error);
      toast({
        title: 'Error Checking Services',
        description: 'Failed to check service status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Get overall status
  const getOverallStatus = () => {
    if (serviceStatus.some(service => service.status === 'loading')) {
      return 'loading';
    }
    if (serviceStatus.every(service => service.status === 'online')) {
      return 'online';
    }
    if (serviceStatus.every(service => service.status === 'offline')) {
      return 'offline';
    }
    return 'degraded';
  };
  
  // Render status badge
  const renderStatusBadge = (status: 'online' | 'offline' | 'degraded' | 'loading') => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Degraded</Badge>;
      case 'loading':
      default:
        return <Badge variant="outline" className="animate-pulse">Checking...</Badge>;
    }
  };
  
  // Render status icon
  const renderStatusIcon = (status: 'online' | 'offline' | 'degraded' | 'loading') => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertOctagon className="h-5 w-5 text-yellow-500" />;
      case 'loading':
      default:
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };
  
  // Overall system status
  const overallStatus = getOverallStatus();
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>LangChain Ecosystem Status</CardTitle>
              <CardDescription>
                Connection status for all AI services and tools
              </CardDescription>
            </div>
            {renderStatusBadge(overallStatus)}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {serviceStatus.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderStatusIcon(service.status)}
                  <div>
                    <h3 className="text-sm font-medium">{service.name}</h3>
                    {service.status === 'loading' ? (
                      <Skeleton className="h-3 w-32" />
                    ) : (
                      <p className="text-xs text-muted-foreground">{service.message}</p>
                    )}
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        {service.status === 'online' && (
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        )}
                        {service.status === 'offline' && (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                        {service.status === 'degraded' && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        )}
                        {service.status === 'loading' && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last checked: {new Date().toLocaleTimeString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setConfigDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </CardFooter>
      </Card>
      
      <AIConfigurationDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onConfigSaved={refreshStatus}
      />
    </>
  );
};

export default LangChainConnector;