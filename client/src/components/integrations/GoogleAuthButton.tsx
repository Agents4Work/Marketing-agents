/**
 * Google Authentication Button Component
 * 
 * This component handles the authentication flow with Google services,
 * including Google Drive and Google Docs.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  service: 'docs' | 'drive';
  onAuthenticated?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function GoogleAuthButton({ 
  service, 
  onAuthenticated,
  variant = 'default',
  size = 'default',
  className = '',
}: GoogleAuthButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Obtener URL de autenticación del servidor
      const response = await fetch(`/api/google-${service}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error iniciando conexión con Google ${service === 'docs' ? 'Docs' : 'Drive'}`);
      }
      
      const data = await response.json();
      
      // Abrir ventana de autenticación
      if (data.authUrl) {
        console.log(`Redirecting to Google OAuth URL:`, data.authUrl);
        
        const authWindow = window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        // Revisar periódicamente si la ventana se ha cerrado
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            
            // Verificar si la conexión fue exitosa
            fetch(`/api/google-${service}/status`)
              .then(res => res.json())
              .then(statusData => {
                if (statusData.connected) {
                  toast({
                    title: "Conexión exitosa",
                    description: `Tu cuenta de Google ${service === 'docs' ? 'Docs' : 'Drive'} ha sido conectada correctamente.`,
                  });
                  if (onAuthenticated) onAuthenticated();
                } else {
                  toast({
                    title: "Conexión no completada",
                    description: "El proceso de autenticación fue cancelado o no se completó correctamente.",
                    variant: "destructive",
                  });
                }
              })
              .catch(err => {
                console.error("Error checking connection status:", err);
                toast({
                  title: "Error al verificar conexión",
                  description: "No se pudo verificar el estado de la conexión. Por favor, intenta nuevamente.",
                  variant: "destructive",
                });
              });
          }
        }, 1000);
      } else {
        toast({
          title: "Error de configuración",
          description: "No se pudo generar la URL de autenticación. Verifica la configuración del servidor.",
          variant: "destructive",
        });
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error connecting to Google:", error);
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con Google ${service === 'docs' ? 'Docs' : 'Drive'}. Por favor, intenta nuevamente.`,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };
  
  // Preparar el ícono de Google
  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="#4285F4"
      />
    </svg>
  );
  
  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      
      {isConnecting 
        ? `Conectando...` 
        : `Conectar Google ${service === 'docs' ? 'Docs' : 'Drive'}`}
    </Button>
  );
}