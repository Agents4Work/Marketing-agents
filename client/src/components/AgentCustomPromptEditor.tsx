import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Save, FileText, AlertCircle, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NodeData } from '@/lib/workflowTypes';

interface AgentCustomPromptEditorProps {
  nodeData: NodeData;
  onUpdate: (updatedData: Partial<NodeData>) => void;
}

export default function AgentCustomPromptEditor({ nodeData, onUpdate }: AgentCustomPromptEditorProps) {
  const [customPrompt, setCustomPrompt] = useState<string>(nodeData.customPrompt || '');
  const [activeTab, setActiveTab] = useState<string>('prompt');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const documents = nodeData.documents || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // In a real app, you would upload these files to a server
    // Here we'll just create a mock representation of them
    const newDocuments = Array.from(files).map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      type: file.type,
      // In a real app, this would be a URL to the uploaded file
      url: URL.createObjectURL(file)
    }));

    const updatedDocuments = [...documents, ...newDocuments];

    onUpdate({
      documents: updatedDocuments
    });

    toast({
      title: 'Documents added',
      description: `Added ${newDocuments.length} documents to the agent.`,
    });
  };

  const removeDocument = (docId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    
    onUpdate({
      documents: updatedDocuments
    });

    toast({
      title: 'Document removed',
      description: 'The document has been removed from the agent.',
    });
  };

  const saveCustomPrompt = () => {
    onUpdate({
      customPrompt
    });

    toast({
      title: 'Custom prompt saved',
      description: 'The custom prompt has been saved for this agent.',
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Custom Prompt</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            <span>Documents</span>
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt" className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Custom Instructions</h3>
            <p className="text-xs text-muted-foreground">
              Customize how this agent behaves by providing specific instructions.
            </p>
            <Textarea 
              placeholder="Enter custom instructions for this agent..."
              className="min-h-[200px] text-sm"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              <p>Tips:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Provide clear, specific instructions</li>
                <li>Include examples of expected outputs</li>
                <li>Reference uploaded documents using their filenames</li>
              </ul>
            </div>
            <Button 
              onClick={saveCustomPrompt}
              size="sm"
              className="mt-2 gap-2"
              disabled={!customPrompt.trim()}
            >
              <Save className="h-4 w-4" />
              Save Instructions
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Document Upload</h3>
            <p className="text-xs text-muted-foreground">
              Upload documents for the agent to reference during its operation.
            </p>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">
                or
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={triggerFileInput}
              >
                Browse Files
              </Button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />
              <p className="text-xs text-muted-foreground mt-3">
                Supported formats: PDF, DOCX, TXT, CSV, JSON (Max 10MB)
              </p>
            </div>
            
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Uploaded Documents</h4>
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}