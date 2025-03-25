/**
 * Import Document Page
 * 
 * This page allows users to import documents from Google Drive,
 * paste URLs directly, or upload files.
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DocumentBrowser } from '@/components/document-browser/DocumentBrowser';
import { Loader2, FileText, Link as LinkIcon } from 'lucide-react';

export function ImportDocumentPage() {
  const [docUrl, setDocUrl] = useState('');
  const { toast } = useToast();
  
  // Mutation for importing document from Google Docs URL
  const importDocMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/google-docs/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docUrl: url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al importar documento');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documento importado exitosamente",
        description: `"${data.document.title}" ha sido importado.`,
      });
      
      // Aquí podrías redirigir al usuario a editar el documento importado
      // o hacer otras acciones como agregarlo a una campaña
      console.log('Documento importado:', data.document);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al importar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle direct URL import
  const handleImportFromUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!docUrl) {
      toast({
        title: "URL requerida",
        description: "Por favor, ingresa una URL de Google Docs válida",
        variant: "destructive",
      });
      return;
    }
    
    importDocMutation.mutate(docUrl);
  };
  
  // Handle import from document browser
  const handleImportFromBrowser = (url: string, _id: string, name: string) => {
    importDocMutation.mutate(url);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Importar Documento</h1>
      
      <Tabs defaultValue="browser" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="browser">Explorador</TabsTrigger>
          <TabsTrigger value="url">URL Directa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browser" className="space-y-4 pt-2">
          <DocumentBrowser onImport={handleImportFromBrowser} />
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Importar desde URL</CardTitle>
              <CardDescription>
                Pega la URL de un documento de Google Docs para importarlo directamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImportFromUrl} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="https://docs.google.com/document/d/..."
                    value={docUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocUrl(e.target.value)}
                    disabled={importDocMutation.isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Formato esperado: https://docs.google.com/document/d/DOCUMENT_ID/...
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={importDocMutation.isPending}
                  className="w-full"
                >
                  {importDocMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Importar Documento
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Asegúrate de tener permisos de acceso al documento que deseas importar.</p>
            <p>El documento se procesará y estará disponible en tu plataforma.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Success feedback */}
      {importDocMutation.isSuccess && (
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documento Importado Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Título:</strong> {importDocMutation.data.document.title}
            </p>
            <p className="text-sm text-green-700 mt-2">
              El documento ha sido importado y está listo para ser utilizado.
            </p>
            <div className="mt-4">
              <Button variant="outline" className="mr-2" onClick={() => window.location.href = "/#/documents"}>
                Ver Mis Documentos
              </Button>
              <Button onClick={() => window.location.href = `/#/documents/edit/${importDocMutation.data.document.id}`}>
                Editar Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}