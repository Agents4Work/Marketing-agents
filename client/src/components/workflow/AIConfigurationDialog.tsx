/**
 * AI Configuration Dialog
 * 
 * This component provides a dialog for configuring AI service API keys
 * and other settings for the LangChain ecosystem.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Form schema for API keys and configuration
const configFormSchema = z.object({
  openaiApiKey: z
    .string()
    .trim()
    .min(1, { message: 'OpenAI API key is required' }),
  langsmithApiKey: z
    .string()
    .optional(),
  langsmithProjectName: z
    .string()
    .optional(),
  useLocalLangFlow: z
    .boolean()
    .default(true),
  localLangFlowUrl: z
    .string()
    .optional(),
  useCustomWorkflowEngine: z
    .boolean()
    .default(true),
  googleAccessToken: z
    .string()
    .optional(),
  googleCloudProjectId: z
    .string()
    .optional(),
  googleCloudLocation: z
    .string()
    .default('us-central1'),
  useVertexAI: z
    .boolean()
    .default(false),
  preferGeminiModels: z
    .boolean()
    .default(false),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

// Default values for the form
const defaultValues: Partial<ConfigFormValues> = {
  openaiApiKey: '',
  langsmithApiKey: '',
  langsmithProjectName: 'marketing-automation',
  useLocalLangFlow: true,
  localLangFlowUrl: 'http://localhost:3000',
  useCustomWorkflowEngine: true,
  googleAccessToken: '',
  googleCloudProjectId: '',
  googleCloudLocation: 'us-central1',
  useVertexAI: false,
  preferGeminiModels: true,
};

// Props interface for the component
interface AIConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: () => void;
}

const AIConfigurationDialog: React.FC<AIConfigurationDialogProps> = ({
  open,
  onOpenChange,
  onConfigSaved,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues,
  });
  
  // Handle form submission
  const onSubmit = async (data: ConfigFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform the data as needed for the API
      const apiKeys = {
        OPENAI_API_KEY: data.openaiApiKey,
        ...(data.langsmithApiKey ? { LANGSMITH_API_KEY: data.langsmithApiKey } : {}),
        ...(data.langsmithProjectName ? { LANGSMITH_PROJECT: data.langsmithProjectName } : {}),
        
        // Add Vertex AI configuration if enabled
        ...(data.useVertexAI ? {
          VERTEX_AI_ENABLED: 'true',
          PREFER_GEMINI_MODELS: data.preferGeminiModels ? 'true' : 'false',
          ...(data.googleAccessToken ? { GOOGLE_ACCESS_TOKEN: data.googleAccessToken } : {}),
          ...(data.googleCloudProjectId ? { GOOGLE_CLOUD_PROJECT_ID: data.googleCloudProjectId } : {}),
          ...(data.googleCloudLocation ? { GOOGLE_CLOUD_LOCATION: data.googleCloudLocation } : {}),
        } : { VERTEX_AI_ENABLED: 'false' }),
      };
      
      // Send API keys to the server
      await apiRequest('/api/config/apikeys', {
        method: 'POST',
        body: JSON.stringify({ apiKeys })
      });
      
      // Show success toast
      toast({
        title: 'Configuration Saved',
        description: 'Your API keys and configuration have been saved.',
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Call the callback if provided
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error Saving Configuration',
        description: 'There was a problem saving your configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Service Configuration</DialogTitle>
          <DialogDescription>
            Configure your AI service API keys and settings for the LangChain ecosystem.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required API Keys</h3>
              
              <FormField
                control={form.control}
                name="openaiApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OpenAI API Key
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="sk-..."
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Required for all AI functionality. Get your API key from{' '}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        OpenAI Dashboard
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <h3 className="text-lg font-medium">Optional Services</h3>
              
              <FormField
                control={form.control}
                name="langsmithApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LangSmith API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="ls-..."
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional for advanced tracing and debugging. Get your API key from{' '}
                      <a
                        href="https://smith.langchain.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        LangSmith
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="langsmithProjectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LangSmith Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="your-project-name" />
                    </FormControl>
                    <FormDescription>
                      Custom project name for organizing your traces in LangSmith.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <h3 className="text-lg font-medium">Advanced Configuration</h3>
              
              <FormField
                control={form.control}
                name="useLocalLangFlow"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Use Local LangFlow</FormLabel>
                      <FormDescription>
                        Enable local LangFlow server for workflow visualization.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('useLocalLangFlow') && (
                <FormField
                  control={form.control}
                  name="localLangFlowUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local LangFlow URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="http://localhost:3000" />
                      </FormControl>
                      <FormDescription>
                        URL of your local LangFlow server.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="useCustomWorkflowEngine"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Use Custom Workflow Engine</FormLabel>
                      <FormDescription>
                        Use our built-in workflow engine instead of LangGraph.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <h3 className="text-lg font-medium">Vertex AI Configuration</h3>
              
              <FormField
                control={form.control}
                name="useVertexAI"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Use Google Vertex AI</FormLabel>
                      <FormDescription>
                        Enable Google Vertex AI for enterprise-grade AI capabilities.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('useVertexAI') && (
                <>
                  <FormField
                    control={form.control}
                    name="googleAccessToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Cloud Access Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="ya29..."
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormDescription>
                          Access token for Google Cloud API authentication.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="googleCloudProjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Cloud Project ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="my-project-123" />
                        </FormControl>
                        <FormDescription>
                          Your Google Cloud project ID for Vertex AI.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="googleCloudLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Cloud Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="us-central1" />
                        </FormControl>
                        <FormDescription>
                          Region for Vertex AI services (default: us-central1).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferGeminiModels"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Prefer Gemini Models</FormLabel>
                          <FormDescription>
                            Use Google's Gemini models instead of other providers.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigurationDialog;