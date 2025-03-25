import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  FolderOpen, 
  File, 
  Image, 
  FileText, 
  Upload, 
  Download, 
  Grid, 
  List,
  Search,
  Plus,
  MoreVertical,
  ArrowUpRight,
  Trash2,
  Star,
  Loader
} from 'lucide-react';
import MainLayout from '../components/layouts/MainLayout';
import { AnimatedSection, AnimatedList, AnimatedListItem } from '../components/ui/animated-section';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '../components/ui/card';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import GoogleDriveIntegration from '../components/integrations/GoogleDriveIntegration';

// API response interface
interface GoogleDriveAPIItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
  starred?: boolean;
  shared?: boolean;
}

// UI component interface
interface GoogleDriveItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'spreadsheet' | 'presentation' | 'pdf';
  size?: string;
  modifiedDate: string;
  starred?: boolean;
  shared?: boolean;
  url?: string;
  mimeType?: string; // Added to support API response mapping
  modifiedTime?: string; // Added to support API response mapping
}

export default function GoogleDrive() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('My Drive');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GoogleDriveItem[]>([]);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [currentFolder, searchQuery]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching files from Google Drive API...');
      // API call to get files with dev auth bypass
      const response = await axios.get('/api/google-drive/files', {
        params: {
          folderId: currentFolder !== 'My Drive' ? currentFolder : 'root',
          q: searchQuery
        },
        headers: {
          // For development, include bypass header
          'x-dev-bypass-auth': process.env.NODE_ENV !== 'production' ? 'true' : undefined
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Files response:', response.data);

      // Convert the API response to our GoogleDriveItem format
      if (response.data.files && Array.isArray(response.data.files)) {
        const formattedFiles = response.data.files.map((item: GoogleDriveAPIItem) => {
          // Determine file type based on mimeType
          let type: GoogleDriveItem['type'] = 'document';
          if (item.mimeType && item.mimeType.includes('folder')) {
            type = 'folder';
          } else if (item.mimeType && item.mimeType.includes('spreadsheet')) {
            type = 'spreadsheet';
          } else if (item.mimeType && item.mimeType.includes('presentation')) {
            type = 'presentation';
          } else if (item.mimeType && item.mimeType.includes('image')) {
            type = 'image';
          } else if (item.mimeType && item.mimeType.includes('pdf')) {
            type = 'pdf';
          }

          return {
            id: item.id,
            name: item.name,
            type,
            size: item.size,
            modifiedDate: item.modifiedTime ? new Date(item.modifiedTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            starred: item.starred,
            shared: item.shared,
            url: item.webViewLink
          };
        });

        setFiles(formattedFiles);
      } else {
        console.warn('API response does not contain expected files array:', response.data);
        
        // If in development mode, use sample data
        if (process.env.NODE_ENV !== 'production') {
          console.log('Using sample file data for development');
          const sampleFiles: GoogleDriveItem[] = [
            {
              id: 'folder-1',
              name: 'Marketing Materials',
              type: 'folder',
              modifiedDate: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            },
            {
              id: 'doc-1',
              name: 'Q1 Campaign Strategy.docx',
              type: 'document',
              size: '245 KB',
              modifiedDate: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            },
            {
              id: 'sheet-1',
              name: 'Campaign Performance.xlsx',
              type: 'spreadsheet',
              size: '1.2 MB',
              modifiedDate: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            },
            {
              id: 'image-1',
              name: 'Logo Design Final.png',
              type: 'image',
              size: '3.5 MB',
              modifiedDate: new Date().toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            }
          ];
          setFiles(sampleFiles);
        } else {
          setFiles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch files from Google Drive. Using development mode.',
        variant: 'destructive'
      });
      
      // If in development mode, use sample data
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using sample file data for development due to error');
        const sampleFiles: GoogleDriveItem[] = [
          {
            id: 'folder-1',
            name: 'Marketing Materials',
            type: 'folder',
            modifiedDate: new Date().toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          },
          {
            id: 'doc-1',
            name: 'Q1 Campaign Strategy.docx',
            type: 'document',
            size: '245 KB',
            modifiedDate: new Date().toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          },
          {
            id: 'sheet-1',
            name: 'Campaign Performance.xlsx',
            type: 'spreadsheet',
            size: '1.2 MB',
            modifiedDate: new Date().toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          },
          {
            id: 'image-1',
            name: 'Logo Design Final.png',
            type: 'image',
            size: '3.5 MB',
            modifiedDate: new Date().toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          }
        ];
        setFiles(sampleFiles);
      } else {
        setFiles([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Folder Name Required',
        description: 'Please enter a name for the new folder.',
        variant: 'destructive'
      });
      return;
    }

    setCreatingFolder(true);
    try {
      console.log('Creating folder in Google Drive:', newFolderName);
      const response = await axios.post('/api/google-drive/create-folder', {
        name: newFolderName,
        parentFolderId: currentFolder !== 'My Drive' ? currentFolder : 'root'
      }, {
        headers: {
          // For development, include bypass header
          'x-dev-bypass-auth': process.env.NODE_ENV !== 'production' ? 'true' : undefined
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Folder creation response:', response.data);

      // Add the new folder to the files list
      const newFolder: GoogleDriveItem = {
        id: response.data.id || `folder-${Date.now()}`, // Fallback ID for development
        name: response.data.name || newFolderName, // Fallback name
        type: 'folder',
        modifiedDate: response.data.modifiedTime 
          ? new Date(response.data.modifiedTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
      };

      setFiles(prev => [newFolder, ...prev]);
      setShowCreateFolderDialog(false);
      setNewFolderName('');
      
      toast({
        title: 'Folder Created',
        description: `"${newFolderName}" folder has been created successfully.`
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      
      // Handle the error gracefully
      toast({
        title: 'Error',
        description: 'Failed to create new folder. Using development mode.',
        variant: 'destructive'
      });
      
      // For development mode, simulate folder creation
      if (process.env.NODE_ENV !== 'production') {
        const newFolder: GoogleDriveItem = {
          id: `folder-${Date.now()}`,
          name: newFolderName,
          type: 'folder',
          modifiedDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };
        
        setFiles(prev => [newFolder, ...prev]);
        setShowCreateFolderDialog(false);
        setNewFolderName('');
        
        toast({
          title: 'Development Mode',
          description: `Created "${newFolderName}" folder in development mode.`
        });
      }
    } finally {
      setCreatingFolder(false);
    }
  };

  const getFileIcon = (type: GoogleDriveItem['type']) => {
    switch (type) {
      case 'folder':
        return <FolderOpen className="h-10 w-10 text-blue-500" />;
      case 'document':
        return <FileText className="h-10 w-10 text-blue-600" />;
      case 'image':
        return <Image className="h-10 w-10 text-green-500" />;
      case 'spreadsheet':
        return <File className="h-10 w-10 text-green-600" />;
      case 'presentation':
        return <File className="h-10 w-10 text-orange-500" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const handleFileClick = (file: GoogleDriveItem) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.name);
      // In a real app, this would load the contents of the folder
      toast({
        title: "Folder Navigation",
        description: `Navigated to ${file.name}`,
      });
    } else {
      // Open the file (in real implementation)
      toast({
        title: "File Open",
        description: `Opening ${file.name}`,
      });
    }
  };

  const handleFileSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload Initiated",
      description: "Google Drive upload functionality would open here.",
      variant: "default"
    });
  };

  const handleCreateNew = () => {
    setShowCreateFolderDialog(true);
  };

  // Files are already filtered by the API call with searchQuery
  const filteredFiles = files;

  const [connectionStatus, setConnectionStatus] = useState<'connected'|'not_connected'>('not_connected');
  
  // Check connection status
  useEffect(() => {
    const checkGoogleDriveStatus = async () => {
      try {
        const response = await axios.get('/api/google-drive/status');
        if (response.data && response.data.connected) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('not_connected');
        }
      } catch (error) {
        console.error('Error checking Google Drive connection status:', error);
        setConnectionStatus('not_connected');
      }
    };
    
    checkGoogleDriveStatus();
  }, []);

  return (
    <MainLayout>
      <AnimatedSection className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Google Drive</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={handleUpload} className="gap-2">
              <Upload size={16} />
              Upload
            </Button>
            <Button onClick={handleCreateNew} variant="outline" size="icon">
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {connectionStatus === 'not_connected' && (
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-4">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Connect to Google Drive</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              <p className="mb-2">You're currently viewing mock data. Connect your real Google Drive account to access your actual files and folders.</p>
              <GoogleDriveIntegration onConnect={() => {
                setConnectionStatus('connected');
                fetchFiles(); // Refresh files after connection
              }} />
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search in Drive"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="my-drive">
            <div className="px-4 border-b">
              <TabsList className="mt-2">
                <TabsTrigger value="my-drive">My Drive</TabsTrigger>
                <TabsTrigger value="shared">Shared with me</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-drive" className="p-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <HardDrive size={14} />
                  <span>My Drive</span>
                  {currentFolder !== 'My Drive' && (
                    <>
                      <span>/</span>
                      <span>{currentFolder}</span>
                    </>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <HardDrive className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No files found</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    {searchQuery ? `No files matching "${searchQuery}"` : "Your drive is empty. Upload files to get started."}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <AnimatedListItem key={file.id}>
                      <Card 
                        className={cn(
                          "cursor-pointer hover:border-blue-400 transition-colors", 
                          selectedFiles.includes(file.id) ? "border-2 border-blue-500" : ""
                        )}
                        onClick={() => handleFileClick(file)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            {getFileIcon(file.type)}
                            <div className="flex space-x-1">
                              {file.starred && <Star size={16} className="text-yellow-400" />}
                              <div
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => handleFileSelection(file.id, e)}
                              >
                                <input 
                                  type="checkbox"
                                  checked={selectedFiles.includes(file.id)}
                                  onChange={() => {}}
                                  className="h-4 w-4"
                                />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical size={16} />
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Download size={14} className="mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ArrowUpRight size={14} className="mr-2" />
                                    Open in Google Drive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 size={14} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <CardTitle className="text-base truncate">{file.name}</CardTitle>
                          {file.type !== 'folder' && (
                            <CardDescription className="text-xs">{file.size}</CardDescription>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 pb-3 text-xs text-gray-500 flex justify-between">
                          <span>
                            {file.modifiedDate}
                          </span>
                          {file.shared && (
                            <Badge variant="outline" className="h-5 text-xs">Shared</Badge>
                          )}
                        </CardFooter>
                      </Card>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 w-12">
                          <input 
                            type="checkbox"
                            onChange={() => {}}
                            className="h-4 w-4"
                          />
                        </th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Modified</th>
                        <th className="px-4 py-2">Size</th>
                        <th className="px-4 py-2 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => (
                        <tr 
                          key={file.id} 
                          className={cn(
                            "border-b hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer",
                            selectedFiles.includes(file.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          )}
                          onClick={() => handleFileClick(file)}
                        >
                          <td className="px-4 py-3 w-12">
                            <div
                              onClick={(e) => handleFileSelection(file.id, e)}
                            >
                              <input 
                                type="checkbox"
                                checked={selectedFiles.includes(file.id)}
                                onChange={() => {}}
                                className="h-4 w-4"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="mr-3">
                                {getFileIcon(file.type)}
                              </div>
                              <div>
                                <div className="font-medium">{file.name}</div>
                                <div className="flex items-center mt-1">
                                  {file.starred && <Star size={14} className="text-yellow-400 mr-1" />}
                                  {file.shared && (
                                    <Badge variant="outline" className="h-5 text-xs">Shared</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{file.modifiedDate}</td>
                          <td className="px-4 py-3">{file.size || '—'}</td>
                          <td className="px-4 py-3 w-20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical size={16} />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Download size={14} className="mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowUpRight size={14} className="mr-2" />
                                  Open in Google Drive
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="p-6">
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Shared Files</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md">
                  This tab would show files shared with you by others.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="starred" className="p-6">
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Starred Files</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md">
                  This tab would show your starred files for quick access.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="p-6">
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Files</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md">
                  This tab would show your recently accessed files.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Create Folder Dialog */}
        <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for the new folder in your Google Drive.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateFolderDialog(false);
                  setNewFolderName('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={creatingFolder}>
                {creatingFolder ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Folder'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AnimatedSection>
    </MainLayout>
  );
}