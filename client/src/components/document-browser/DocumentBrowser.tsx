/**
 * Google Drive Document Browser Component
 * 
 * This component allows users to browse, search, and import their Google Drive documents.
 * It provides a responsive grid layout and supports navigation through folders.
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, File, FileText, Folder, RefreshCw, ChevronLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define Google Drive document types
interface Document {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  size?: string;
  iconLink?: string;
  starred?: boolean;
}

interface DocumentBrowserProps {
  onImport?: (docUrl: string, docId: string, docName: string) => void;
  documentTypes?: string[]; // Filter only specific document types
}

export function DocumentBrowser({ 
  onImport, 
  documentTypes = ['application/vnd.google-apps.document']
}: DocumentBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('root');
  const [folderHistory, setFolderHistory] = useState<{ id: string, name: string }[]>([]);
  const { toast } = useToast();
  
  // Query for Google Drive connection status
  const statusQuery = useQuery({
    queryKey: ['/api/google-drive/status'],
    queryFn: async () => {
      const response = await fetch('/api/google-drive/status');
      if (!response.ok) throw new Error('Error checking Google Drive status');
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Query for documents in the current folder
  const documentsQuery = useQuery({
    queryKey: ['/api/google-drive/files', currentFolder, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentFolder) params.append('folderId', currentFolder);
      if (searchQuery) params.append('query', searchQuery);
      
      const response = await fetch(`/api/google-drive/files?${params.toString()}`);
      if (!response.ok) throw new Error('Error fetching documents');
      return response.json();
    },
    enabled: statusQuery.data?.connected === true,
    refetchOnWindowFocus: false
  });
  
  // Add current folder to history when it changes
  useEffect(() => {
    if (currentFolder === 'root') return;
    
    // Find folder name from documents list
    const folderName = documentsQuery.data?.files?.find((file: Document) => file.id === currentFolder)?.name || 'Folder';
    
    // Check if this folder is already in history
    if (!folderHistory.some(folder => folder.id === currentFolder)) {
      setFolderHistory(prev => [...prev, { id: currentFolder, name: folderName }]);
    }
  }, [currentFolder, documentsQuery.data]);
  
  // Handle folder navigation
  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };
  
  // Handle going back in folder history
  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Get previous folder
      const newHistory = [...folderHistory];
      const previousFolder = newHistory[newHistory.length - 2] || { id: 'root', name: 'Root' };
      
      // Trim history to previous folder
      setFolderHistory(newHistory.slice(0, newHistory.length - 1));
      setCurrentFolder(previousFolder.id);
    } else {
      // If no history, go to root
      setCurrentFolder('root');
    }
  };
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    documentsQuery.refetch();
  };
  
  // Handle document import
  const handleImportDocument = (docId: string, docName: string) => {
    if (!onImport) return;
    
    const docUrl = `https://docs.google.com/document/d/${docId}`;
    
    toast({
      title: "Importando documento",
      description: `Importando "${docName}". Esto puede tomar unos segundos...`
    });
    
    onImport(docUrl, docId, docName);
  };
  
  // Render connection prompt if not connected
  if (statusQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-pulse mb-4">
          <Folder className="h-16 w-16 text-gray-400" />
        </div>
        <p className="text-lg">Verificando conexión con Google Drive...</p>
      </div>
    );
  }
  
  // If not connected to Google Drive
  if (!statusQuery.data?.connected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
        <Folder className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Conecta con Google Drive</h2>
        <p className="mb-6 text-gray-600">
          Para acceder a tus documentos de Google Drive, necesitas conectar tu cuenta.
        </p>
        <Button 
          onClick={() => window.location.href = "/#/integrations/google"} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Conectar Google Drive
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h2 className="text-2xl font-bold">Mis Documentos</h2>
          {statusQuery.data?.email && (
            <span className="text-sm text-gray-500 ml-2">
              ({statusQuery.data.email})
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => documentsQuery.refetch()}
          disabled={documentsQuery.isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${documentsQuery.isRefetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      {/* Folder navigation */}
      {currentFolder !== 'root' && (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFolder('root')}>
            Inicio
          </Button>
          {folderHistory.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <span className="text-gray-400 mx-1">/</span>
              {index === folderHistory.length - 1 ? (
                <span className="text-sm font-medium truncate max-w-[150px]">{folder.name}</span>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleFolderClick(folder.id)}
                  className="text-sm"
                >
                  {folder.name}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={documentsQuery.isPending}>
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </form>
      
      {/* Loading state */}
      {(documentsQuery.isPending || documentsQuery.isRefetching) && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full border-t-2 border-gray-300 border-r-2 border-gray-600 h-8 w-8 mb-4"></div>
          <p>Cargando documentos...</p>
        </div>
      )}
      
      {/* Error state */}
      {documentsQuery.isError && (
        <div className="text-center py-8 border rounded-md bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">
            Error al cargar documentos
          </p>
          <p className="text-sm text-red-500 mt-1">
            Intenta actualizar la página o reconectar tu cuenta de Google Drive
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => documentsQuery.refetch()}
            className="mt-4"
          >
            Intentar nuevamente
          </Button>
        </div>
      )}
      
      {/* No documents found */}
      {documentsQuery.isSuccess && (!documentsQuery.data.files || documentsQuery.data.files.length === 0) && (
        <div className="text-center py-12 border rounded-md">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-1">No se encontraron documentos</p>
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? `No hay resultados para "${searchQuery}"`
              : 'Esta carpeta está vacía'}
          </p>
        </div>
      )}
      
      {/* Documents grid */}
      {documentsQuery.isSuccess && documentsQuery.data.files && documentsQuery.data.files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentsQuery.data.files.map((doc: Document) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <CardTitle className="text-base truncate">{doc.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Modificado: {new Date(doc.modifiedTime).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {doc.mimeType.includes('folder') ? (
                    <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : doc.mimeType.includes('document') ? (
                    <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  {doc.mimeType.includes('folder') ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFolderClick(doc.id)}
                    >
                      Abrir
                    </Button>
                  ) : documentTypes.some(type => doc.mimeType.includes(type)) ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.webViewLink, '_blank')}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleImportDocument(doc.id, doc.name)}
                      >
                        Importar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.webViewLink, '_blank')}
                    >
                      Ver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}