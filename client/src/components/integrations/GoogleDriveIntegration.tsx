import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { useToast } from '../../hooks/use-toast';
import { HardDrive, Upload, Download, Link as LinkIcon, Check, Loader2, Folder } from 'lucide-react';
import axios from 'axios';

interface GoogleDriveIntegrationProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
}

interface DriveStatus {
  connected: boolean;
  storage?: {
    limit: number;
    usage: number;
  };
  email?: string;
}

export default function GoogleDriveIntegration({
  onConnect,
  onDisconnect,
  isConnected = false
}: GoogleDriveIntegrationProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [connected, setConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);
  
  const checkConnectionStatus = async () => {
    setStatusLoading(true);
    try {
      console.log('Checking Google Drive connection status...');
      const response = await axios.get('/api/google-drive/status', {
        headers: {
          // For development, include bypass header
          'x-dev-bypass-auth': process.env.NODE_ENV !== 'production' ? 'true' : undefined
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Google Drive status response:', response.data);
      setDriveStatus(response.data);
      setConnected(response.data.connected);
      setStatusLoading(false);
      
      toast({
        title: "Google Drive Status",
        description: `Connected as ${response.data.email}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error checking Google Drive connection:', error);
      setConnected(false);
      setStatusLoading(false);
      
      toast({
        title: "Connection Issue",
        description: "Could not check Google Drive status. Development mode enabled.",
        variant: "destructive"
      });
      
      // For development, set connected anyway
      if (process.env.NODE_ENV !== 'production') {
        setConnected(true);
        setDriveStatus({
          connected: true,
          storage: {
            limit: 15 * 1024 * 1024 * 1024,
            usage: 5.2 * 1024 * 1024 * 1024
          },
          email: 'dev@example.com'
        });
      }
    }
  };
  
  const handleConnect = async () => {
    setConnecting(true);
    try {
      // First fetch a CSRF token
      let csrfToken;
      try {
        const tokenResponse = await axios.get('/api/csrf-token');
        csrfToken = tokenResponse.data.token;
        console.log('Retrieved CSRF token for Google Drive connection');
      } catch (tokenError) {
        console.warn('Could not retrieve CSRF token, continuing without it:', tokenError);
      }
      
      // Request OAuth URL from our backend
      const response = await axios.post('/api/google-drive/connect', 
        {}, // Empty body
        {
          headers: csrfToken ? {
            'X-CSRF-Token': csrfToken
          } : {}
        }
      );
      
      // Check for authUrl in the response
      if (response.data && response.data.authUrl) {
        // Redirect to Google's OAuth consent screen
        console.log('Redirecting to Google OAuth URL:', response.data.authUrl);
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No authorization URL returned from server');
      }
    } catch (error: any) {
      console.error('Error connecting to Google Drive:', error);
      
      // Log more detailed error information to help diagnose
      if (error.response) {
        console.error('Google Drive error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Failed to connect to Google Drive. Please try again.";
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setConnecting(false);
    }
  };
  
  // Check URL for OAuth callback success/error parameters
  useEffect(() => {
    // Check if we're returning from OAuth flow
    const urlParams = new URLSearchParams(window.location.hash.replace('#/', ''));
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'true') {
      toast({
        title: "Connected to Google Drive",
        description: "Your account has been successfully connected to Google Drive",
      });
      
      // Clean up URL
      const cleanUrl = window.location.href.split('?')[0].split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl + '#/google-drive');
      
      // Check connection status
      checkConnectionStatus();
      setConnecting(false);
      setShowAuthDialog(false);
      if (onConnect) onConnect();
    } else if (error) {
      let errorMessage = "Failed to connect to Google Drive.";
      
      // Provide more specific error messages based on error code
      switch (error) {
        case 'access_denied':
          errorMessage = "Permission denied for Google Drive access.";
          break;
        case 'expired_state':
          errorMessage = "Connection request expired. Please try again.";
          break;
        case 'invalid_state':
          errorMessage = "Invalid request state. Please try again.";
          break;
        case 'no_code':
          errorMessage = "No authorization code received from Google.";
          break;
        case 'server_error':
          errorMessage = "Server error while processing connection.";
          break;
        default:
          errorMessage = `Error connecting to Google Drive: ${error}`;
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clean up URL
      const cleanUrl = window.location.href.split('?')[0].split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl + '#/google-drive');
      
      setConnecting(false);
    }
  }, []);
  
  const handleDisconnect = async () => {
    try {
      // First fetch a CSRF token
      let csrfToken;
      try {
        const tokenResponse = await axios.get('/api/csrf-token');
        csrfToken = tokenResponse.data.token;
        console.log('Retrieved CSRF token for Google Drive disconnection');
      } catch (tokenError) {
        console.warn('Could not retrieve CSRF token, continuing without it:', tokenError);
      }
      
      await axios.post('/api/google-drive/disconnect', 
        {}, // Empty body
        {
          headers: csrfToken ? {
            'X-CSRF-Token': csrfToken
          } : {}
        }
      );
      
      setConnected(false);
      setDriveStatus(null);
      if (onDisconnect) onDisconnect();
      toast({
        title: "Disconnected from Google Drive",
        description: "Your account has been disconnected from Google Drive",
      });
    } catch (error: any) {
      console.error('Error disconnecting from Google Drive:', error);
      
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           "Failed to disconnect from Google Drive. Please try again.";
                           
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // First fetch a CSRF token
      let csrfToken;
      try {
        const tokenResponse = await axios.get('/api/csrf-token');
        csrfToken = tokenResponse.data.token;
        console.log('Retrieved CSRF token for Google Drive upload');
      } catch (tokenError) {
        console.warn('Could not retrieve CSRF token, continuing without it:', tokenError);
      }
      
      // For demo purposes, we'll simulate file upload with progress
      // In a real app, we would use FormData with axios to upload the file
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Hold at 90% until completion
          }
          return prev + 10;
        });
      }, 500);
      
      // Simulate API call to upload a file
      const response = await axios.post('/api/google-drive/upload', 
        {
          name: 'Sample Document.pdf',
          folderId: 'root'
        },
        {
          headers: csrfToken ? {
            'X-CSRF-Token': csrfToken
          } : {}
        }
      );
      
      // Set progress to 100% when complete
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        toast({
          title: "Upload Complete",
          description: "Your file has been uploaded to Google Drive",
        });
      }, 500);
    } catch (error: any) {
      console.error('Error uploading to Google Drive:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Failed to upload file to Google Drive. Please try again.";
                          
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" /> Google Drive Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Drive account to sync files between the platform and your drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Connected to Google Drive</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="w-full sm:w-auto">
                  <Folder className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Download Files
                </Button>
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500">
                Connect your Google Drive account to access your files directly from this platform.
              </p>
              
              <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect to Google Drive
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect to Google Drive</DialogTitle>
                    <DialogDescription>
                      Authorize access to your Google Drive to enable file synchronization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Connecting to Google Drive will allow this application to:
                      </p>
                      <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                        <li>View and manage files in your Google Drive</li>
                        <li>Upload new files to your Drive</li>
                        <li>Create new folders in your Drive</li>
                        <li>Download files from your Drive</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConnect}>
                      Authorize Access
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
        {connected && (
          <CardFooter className="border-t pt-6">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {driveStatus?.storage ? (
                  <>
                    <span className="font-medium">Storage:</span>{' '}
                    {Math.round(driveStatus.storage.usage / (1024 * 1024 * 1024) * 10) / 10} GB used of{' '}
                    {Math.round(driveStatus.storage.limit / (1024 * 1024 * 1024) * 10) / 10} GB
                  </>
                ) : (
                  <span className="font-medium">Storage information unavailable</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}