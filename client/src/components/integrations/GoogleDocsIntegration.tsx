import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { TabsContent } from '../../components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { FileText, Upload, Download, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

interface GoogleDocsIntegrationProps {
  content?: string;
  onImport?: (content: string) => void;
  onExport?: (content: string) => void;
}

interface GoogleDocsStatus {
  connected: boolean;
  email?: string;
  lastSync?: string;
}

export default function GoogleDocsIntegration({
  content = '',
  onImport,
  onExport
}: GoogleDocsIntegrationProps) {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [importedContent, setImportedContent] = useState('');
  const [exportContent, setExportContent] = useState(content);
  const [exportTitle, setExportTitle] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [connected, setConnected] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [docsStatus, setDocsStatus] = useState<GoogleDocsStatus | null>(null);

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get('/api/google-docs/status');
      setDocsStatus(response.data);
      setConnected(response.data.connected);
      setStatusLoading(false);
    } catch (error) {
      console.error('Error checking Google Docs connection:', error);
      setConnected(false);
      setStatusLoading(false);
    }
  };

  // Google Docs import function using our API
  const handleImport = async () => {
    if (!docUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Google Doc URL to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Call our API endpoint to import from Google Docs
      const response = await axios.post('/api/google-docs/import', { docUrl });
      
      const importedContent = response.data.content;
      setImportedContent(importedContent);
      
      if (onImport) {
        onImport(importedContent);
      }
      
      toast({
        title: "Import Successful",
        description: "Content has been imported from Google Docs",
      });
      
      setShowImportDialog(false);
    } catch (error) {
      console.error('Error importing from Google Docs:', error);
      toast({
        title: "Import Failed",
        description: "There was an error importing from Google Docs. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Google Docs export function using our API
  const handleExport = async () => {
    if (!exportTitle) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your Google Doc",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Call our API endpoint to export to Google Docs
      const response = await axios.post('/api/google-docs/export', {
        title: exportTitle,
        content: exportContent
      });
      
      if (onExport) {
        onExport(exportContent);
      }
      
      toast({
        title: "Export Successful",
        description: `"${exportTitle}" has been exported to Google Docs`,
      });
      
      // Optional: Provide a link to the exported document
      if (response.data.document?.url) {
        toast({
          title: "Document Available",
          description: `You can now access your document in Google Docs`,
        });
      }
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Google Docs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset dialog states when closed
  const handleImportDialogOpenChange = (open: boolean) => {
    setShowImportDialog(open);
    if (!open) {
      setDocUrl('');
    }
  };

  const handleExportDialogOpenChange = (open: boolean) => {
    setShowExportDialog(open);
    if (!open) {
      setExportTitle('');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Google Docs Integration
          </CardTitle>
          <CardDescription>
            Import content from Google Docs or export your content to a new Google Doc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Import from Google Docs */}
            <Dialog open={showImportDialog} onOpenChange={handleImportDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" variant="outline">
                  <Upload className="h-4 w-4 mr-2" /> Import from Google Docs
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from Google Docs</DialogTitle>
                  <DialogDescription>
                    Enter the URL of the Google Doc you want to import.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="docUrl">Google Doc URL</Label>
                    <Input
                      id="docUrl"
                      placeholder="https://docs.google.com/document/d/..."
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-md bg-gray-50 dark:bg-gray-900 p-4 h-48 overflow-y-auto">
                      {importedContent ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {importedContent.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 dark:text-gray-600 text-center flex items-center justify-center h-full">
                          Import preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export to Google Docs */}
            <Dialog open={showExportDialog} onOpenChange={handleExportDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Export to Google Docs
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export to Google Docs</DialogTitle>
                  <DialogDescription>
                    Create a new Google Doc with your content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="docTitle">Document Title</Label>
                    <Input
                      id="docTitle"
                      placeholder="Enter a title for your document"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content to Export</Label>
                    <Textarea
                      id="content"
                      value={exportContent}
                      onChange={(e) => setExportContent(e.target.value)}
                      rows={10}
                      className="font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <LinkIcon className="h-4 w-4 inline mr-1" />
            Connected to Google Workspace
          </div>
          <Button variant="ghost" size="sm">
            Manage Connection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}