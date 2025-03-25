/**
 * Google Integrations Page
 * 
 * This page provides a central location for users to manage
 * all their Google account integrations (Drive, Docs, Sheets, etc).
 */

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/components/integrations/GoogleAuthButton';
import { CheckCircle, XCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export function GoogleIntegrationsPage() {
  // Query for Google Drive connection status
  const driveStatusQuery = useQuery({
    queryKey: ['/api/google-drive/status'],
    queryFn: async () => {
      const response = await fetch('/api/google-drive/status');
      if (!response.ok) throw new Error('Error checking Google Drive status');
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Query for Google Docs connection status
  const docsStatusQuery = useQuery({
    queryKey: ['/api/google-docs/status'],
    queryFn: async () => {
      const response = await fetch('/api/google-docs/status');
      if (!response.ok) throw new Error('Error checking Google Docs status');
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Handle refresh of status
  const refreshStatus = () => {
    driveStatusQuery.refetch();
    docsStatusQuery.refetch();
  };
  
  // Handle successful authentication
  const handleAuthSuccess = () => {
    refreshStatus();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Integraciones con Google</h1>
        <p className="text-gray-600 mb-8">
          Conecta tu cuenta de Google para utilizar Google Drive, Google Docs y otras herramientas de Google Workspace.
        </p>
        
        <div className="flex justify-end mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStatus}
            disabled={driveStatusQuery.isRefetching || docsStatusQuery.isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${driveStatusQuery.isRefetching || docsStatusQuery.isRefetching ? 'animate-spin' : ''}`} />
            Actualizar Estado
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Google Drive Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <img 
                  src="https://www.gstatic.com/images/branding/product/1x/drive_48dp.png" 
                  alt="Google Drive" 
                  className="w-6 h-6 mr-2"
                />
                Google Drive
              </CardTitle>
              <CardDescription>
                Accede y gestiona archivos almacenados en Google Drive.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {driveStatusQuery.isLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full border-t-2 border-gray-300 border-r-2 border-gray-600 h-5 w-5 mb-2"></div>
                  <p className="text-sm">Verificando conexión...</p>
                </div>
              ) : driveStatusQuery.isError ? (
                <Alert variant="destructive" className="my-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription>
                    No se pudo verificar el estado de la conexión con Google Drive.
                  </AlertDescription>
                </Alert>
              ) : driveStatusQuery.data?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Conectado</span>
                  </div>
                  
                  {driveStatusQuery.data.email && (
                    <div className="text-sm">
                      <span className="text-gray-500">Cuenta:</span> {driveStatusQuery.data.email}
                    </div>
                  )}
                  
                  {driveStatusQuery.data.storage && (
                    <div className="text-sm">
                      <span className="text-gray-500">Almacenamiento:</span> {Math.round(driveStatusQuery.data.storage.usage / (1024 * 1024 * 1024) * 10) / 10}GB de {Math.round(driveStatusQuery.data.storage.limit / (1024 * 1024 * 1024) * 10) / 10}GB
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">No conectado</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Para usar Google Drive en la aplicación, conecta tu cuenta.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-2">
              {!driveStatusQuery.isLoading && (
                driveStatusQuery.data?.connected ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Conectado
                  </Button>
                ) : (
                  <GoogleAuthButton 
                    service="drive" 
                    onAuthenticated={handleAuthSuccess}
                    className="w-full"
                  />
                )
              )}
            </CardFooter>
          </Card>
          
          {/* Google Docs Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <img 
                  src="https://www.gstatic.com/images/branding/product/1x/docs_48dp.png" 
                  alt="Google Docs" 
                  className="w-6 h-6 mr-2"
                />
                Google Docs
              </CardTitle>
              <CardDescription>
                Crea, edita e importa documentos desde Google Docs.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {docsStatusQuery.isLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full border-t-2 border-gray-300 border-r-2 border-gray-600 h-5 w-5 mb-2"></div>
                  <p className="text-sm">Verificando conexión...</p>
                </div>
              ) : docsStatusQuery.isError ? (
                <Alert variant="destructive" className="my-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de conexión</AlertTitle>
                  <AlertDescription>
                    No se pudo verificar el estado de la conexión con Google Docs.
                  </AlertDescription>
                </Alert>
              ) : docsStatusQuery.data?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Conectado</span>
                  </div>
                  
                  {docsStatusQuery.data.email && (
                    <div className="text-sm">
                      <span className="text-gray-500">Cuenta:</span> {docsStatusQuery.data.email}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="text-gray-500">Acceso:</span> Lectura y escritura
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">No conectado</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Para importar y exportar documentos, conecta tu cuenta de Google Docs.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-2">
              {!docsStatusQuery.isLoading && (
                docsStatusQuery.data?.connected ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Conectado
                  </Button>
                ) : (
                  <GoogleAuthButton 
                    service="docs" 
                    onAuthenticated={handleAuthSuccess}
                    className="w-full"
                  />
                )
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Acerca de las integraciones con Google</h3>
              <p className="text-sm text-blue-700 mt-1">
                Al conectar tu cuenta de Google, otorgas permisos a la aplicación para acceder a tus documentos 
                y archivos de Google Workspace. La aplicación solo accederá a los documentos a los que tú le des acceso.
                Puedes revocar estos permisos en cualquier momento desde la configuración de tu cuenta de Google.
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Características de la integración</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Importa documentos de Google Docs directamente a la plataforma</li>
              <li>Navega por tus archivos de Google Drive</li>
              <li>Exporta contenido generado a Google Docs</li>
              <li>Sincroniza automáticamente cambios entre la plataforma y Google Docs</li>
              <li>Comparte y colabora en documentos utilizando las funciones de Google Workspace</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Permisos requeridos</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Google Drive: Ver y descargar tu contenido de Google Drive</p>
                  <p className="text-sm text-gray-600">Permite a la aplicación listar y acceder a tus archivos.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Google Docs: Ver y administrar tus documentos</p>
                  <p className="text-sm text-gray-600">Permite a la aplicación leer, crear y modificar documentos.</p>
                </div>
              </li>
            </ul>
          </TabsContent>
          
          <TabsContent value="faq" className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Preguntas frecuentes</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">¿Qué sucede si desconecto mi cuenta de Google?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Si desconectas tu cuenta, la aplicación ya no podrá acceder a tus archivos de Google.
                  El contenido que ya hayas importado permanecerá en la plataforma.
                </p>
              </div>
              <div>
                <p className="font-medium">¿La aplicación puede ver todos mis archivos de Google Drive?</p>
                <p className="text-sm text-gray-600 mt-1">
                  La aplicación solo puede ver y acceder a los archivos que tú selecciones explícitamente
                  o que hayas creado utilizando la aplicación.
                </p>
              </div>
              <div>
                <p className="font-medium">¿Cómo revocar el acceso?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Puedes revocar el acceso en cualquier momento visitando la 
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> página de permisos de tu cuenta de Google</a> 
                  y eliminando el acceso de esta aplicación.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}