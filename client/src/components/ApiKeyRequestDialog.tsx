import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Loader2, CloudCog } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Single API field type
export interface ApiKeyField {
  name: string;
  label: string;
  description: string;
  defaultValue?: string;
  optional?: boolean;
}

// Props for legacy single key mode
export interface LegacySingleKeyProps {
  apiName: string;
  apiKeyName: string;
  description: string;
  onClose: (apiKey?: string) => void;
}

// Props for multi-field mode
export interface MultiFieldKeyProps {
  title: string;
  description: string;
  fields: ApiKeyField[];
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

// Combined props type with discriminated union
export type ApiKeyRequestDialogProps = LegacySingleKeyProps | MultiFieldKeyProps;

// Type guard to differentiate between prop types
function isMultiFieldProps(props: ApiKeyRequestDialogProps): props is MultiFieldKeyProps {
  return 'fields' in props && Array.isArray(props.fields);
}

export default function ApiKeyRequestDialog(props: ApiKeyRequestDialogProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize field values for multi-field mode
  useEffect(() => {
    if (isMultiFieldProps(props)) {
      const initialValues: Record<string, string> = {};
      props.fields.forEach(field => {
        initialValues[field.name] = field.defaultValue || '';
      });
      setFieldValues(initialValues);
    } else {
      // For legacy single key mode
      setFieldValues({ [props.apiKeyName]: '' });
    }
  }, [props]);

  const validateFields = (): boolean => {
    if (isMultiFieldProps(props)) {
      for (const field of props.fields) {
        if (!field.optional && !fieldValues[field.name]?.trim()) {
          toast({
            title: `${field.label} Required`,
            description: `Please enter a valid value for ${field.label}.`,
            variant: "destructive"
          });
          return false;
        }
      }
      return true;
    } else {
      // For legacy single key mode
      if (!fieldValues[props.apiKeyName]?.trim()) {
        toast({
          title: "API Key Required",
          description: "Please enter a valid API key.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
  };

  const handleMultiFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFields()) return;
    
    setIsSubmitting(true);
    
    try {
      // Update API keys in the configuration
      await apiRequest("/api/config/apikeys", {
        method: "POST"
      }, {
        apiKeys: fieldValues
      });
      
      toast({
        title: "Configuration Saved",
        description: "Your API credentials have been saved successfully."
      });
      
      if (isMultiFieldProps(props)) {
        await props.onSubmit();
      } else {
        props.onClose(fieldValues[props.apiKeyName]);
      }
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast({
        title: "Error Saving Configuration",
        description: "There was a problem saving your credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues({
      ...fieldValues,
      [name]: value
    });
  };

  const isDisabled = (): boolean => {
    if (isMultiFieldProps(props)) {
      return props.fields.some(field => !field.optional && !fieldValues[field.name]?.trim());
    } else {
      return !fieldValues[props.apiKeyName]?.trim();
    }
  };

  const getIcon = () => {
    if (isMultiFieldProps(props)) {
      return <CloudCog className="h-5 w-5 text-blue-500" />;
    } else {
      return <Key className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTitle = () => {
    if (isMultiFieldProps(props)) {
      return props.title;
    } else {
      return `${props.apiName} API Key Required`;
    }
  };

  const handleClose = () => {
    if (isMultiFieldProps(props)) {
      props.onClose();
    } else {
      props.onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {props.description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleMultiFieldSubmit} className="space-y-4 py-4">
          {isMultiFieldProps(props) ? (
            // Multi-field mode
            props.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`field-${field.name}`} className="flex justify-between">
                  <span>{field.label}</span>
                  {field.optional && <span className="text-xs text-gray-500">(Optional)</span>}
                </Label>
                <Input
                  id={`field-${field.name}`}
                  placeholder={`Enter ${field.label}`}
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full"
                  type="password"
                  autoComplete="off"
                />
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))
          ) : (
            // Legacy single key mode
            <div className="space-y-2">
              <Label htmlFor="api-key">{props.apiName} API Key</Label>
              <Input
                id="api-key"
                placeholder={`Enter your ${props.apiName} API key`}
                value={fieldValues[props.apiKeyName] || ''}
                onChange={(e) => handleFieldChange(props.apiKeyName, e.target.value)}
                className="w-full"
                type="password"
                autoComplete="off"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>You can find or create your API key in your {props.apiName} account settings.</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDisabled()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Credentials</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}