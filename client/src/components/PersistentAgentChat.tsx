import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { agentChatService } from '@/services/agentChatService';
import { AgentType } from '@/types/agents';
import { AgentMessage } from '@/types/conversations';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, User, Loader2 } from "lucide-react";
import { formatChatDate, cn } from '@/lib/utils';
import { agentIconNames, agentColors } from '@/lib/agents';
import { Search, FileEdit, BarChart3, PenTool, Mail, Share2, MessageSquare } from 'lucide-react';

interface PersistentAgentChatProps {
  agentId: string;
  agentType: AgentType;
  agentName: string;
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
  onSendMessage?: (message: string) => void;
  onReceiveMessage?: (message: AgentMessage) => void;
  className?: string;
}

export default function PersistentAgentChat({
  agentId,
  agentType,
  agentName,
  conversationId: initialConversationId,
  onConversationCreated,
  onSendMessage,
  onReceiveMessage,
  className
}: PersistentAgentChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Cargar mensajes si hay una conversación existente
  useEffect(() => {
    if (conversationId && user) {
      loadConversation(conversationId);
    }
  }, [conversationId, user]);
  
  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  // Intentar sincronizar conversaciones locales con Firestore cuando el componente se monta
  useEffect(() => {
    if (user) {
      // Solo intentar una vez por sesión para no sobrecargar
      const hasAttemptedSync = sessionStorage.getItem(`sync_attempted_${user.uid}`);
      
      if (!hasAttemptedSync) {
        console.log('Intentando sincronizar conversaciones locales con Firestore...');
        agentChatService.syncLocalConversationsToFirestore(user.uid)
          .then(() => {
            console.log('Sincronización completada o intentada');
            sessionStorage.setItem(`sync_attempted_${user.uid}`, 'true');
          })
          .catch(error => {
            console.error('Error durante la sincronización:', error);
          });
      }
    }
  }, [user]);
  
  // Cargar una conversación existente con manejo de errores mejorado
  const loadConversation = async (convId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Intento 1: Cargar directamente desde el agente conocido
      try {
        const conversation = await agentChatService.getConversation(user.uid, agentId, convId);
        
        if (conversation) {
          console.log('Conversación cargada correctamente del agente conocido');
          setMessages(conversation.messages);
          return;
        }
      } catch (directError) {
        console.warn('No se pudo cargar conversación directamente:', directError);
        // Continuar con el siguiente intento
      }
      
      // Intento 2: Buscar en todos los agentes
      try {
        const foundConversation = await agentChatService.findConversationById(user.uid, convId);
        
        if (foundConversation) {
          console.log('Conversación encontrada en otro agente');
          setMessages(foundConversation.messages);
          return;
        }
      } catch (findError) {
        console.warn('No se pudo buscar conversación en otros agentes:', findError);
        // Continuar con el siguiente intento
      }
      
      // Intento 3: Comprobar localStorage
      try {
        // Recuperar desde localStorage a través de la API
        const storageKey = `local_conversations_${user.uid}`;
        const userConversations = JSON.parse(localStorage.getItem(storageKey) || '{}');
        
        // Buscar en todos los agentes guardados
        for (const [savedAgentId, agentConversations] of Object.entries(userConversations)) {
          if ((agentConversations as any)[convId]) {
            const localConversation = (agentConversations as any)[convId];
            console.log('Conversación recuperada de localStorage');
            setMessages(localConversation.messages || []);
            return;
          }
        }
      } catch (localStorageError) {
        console.warn('Error accediendo a localStorage:', localStorageError);
      }
      
      // Si llegamos aquí, no se encontró la conversación
      setError('Conversación no encontrada. Inicia una nueva conversación.');
      
    } catch (err: any) {
      console.error('Error general cargando conversación:', err);
      setError('No se pudo cargar la conversación. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Crear una nueva conversación
  const createConversation = async (initialMessage: string) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Crear un título basado en el mensaje inicial
      const title = initialMessage.length > 30 
        ? `${initialMessage.substring(0, 30)}...` 
        : initialMessage;
      
      // Usar el método mejorado con retry y fallback
      const newConversation = await agentChatService.createConversationWithFallback({
        title,
        agentId,
        agentType,
        userId: user.uid,
        initialMessage
      });
      
      console.log('Conversación creada:', newConversation);
      
      // Actualizar estado
      setConversationId(newConversation.id);
      setMessages(newConversation.messages);
      
      // Notificar al componente padre
      if (onConversationCreated) {
        onConversationCreated(newConversation.id);
      }
      
      return newConversation.id;
    } catch (err: any) {
      console.error('Error creando conversación:', err);
      
      // Mensajes de error específicos según el tipo de error
      if (err.code === 'invalid-argument') {
        setError('Error de datos: Formato de mensaje no válido. Por favor, evite caracteres especiales.');
      } else if (err.code === 'permission-denied') {
        setError('Error de permisos: Verifica tu inicio de sesión para acceder a esta función.');
      } else if (err.code === 'unavailable') {
        setError('Servicio no disponible: No se pudo conectar con la base de datos. Verifica tu conexión.');
      } else if (err.message?.includes('circular')) {
        setError('Error de formato: Se detectó una estructura circular. Intenta con un mensaje más simple.');
      } else if (err.message?.includes('network')) {
        setError('Error de red: No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Mensaje genérico para otros errores
        setError(`No se pudo crear la conversación. ${err.message || 'Por favor, intenta de nuevo.'}`);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar el envío de mensajes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || !user) return;
    
    const messageContent = userInput;
    setUserInput('');
    
    try {
      // Si no hay conversación, crear una nueva
      if (!conversationId) {
        const newConversationId = await createConversation(messageContent);
        if (!newConversationId) return;
        
        // Notificar al componente padre
        if (onSendMessage) {
          onSendMessage(messageContent);
        }
        
        // Simular respuesta del agente después de un breve retraso
        setTimeout(() => generateAgentResponse(newConversationId), 1500);
        return;
      }
      
      // Añadir mensaje a una conversación existente
      setIsLoading(true);
      
      // Optimismo UI: Mostrar el mensaje inmediatamente
      const optimisticMessage: AgentMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Enviar a Firestore con retry y fallback
      await agentChatService.addMessageWithFallback(user.uid, agentId, {
        conversationId,
        role: 'user',
        content: messageContent
      });
      
      // Notificar al componente padre
      if (onSendMessage) {
        onSendMessage(messageContent);
      }
      
      // Simular respuesta del agente
      generateAgentResponse(conversationId);
    } catch (err: any) {
      console.error('Error enviando mensaje:', err);
      
      // Mensajes de error específicos según el tipo de error
      if (err.code === 'invalid-argument') {
        setError('Error de datos: El mensaje contiene formato no válido. Por favor, simplifique su mensaje.');
      } else if (err.code === 'permission-denied') {
        setError('Error de permisos: Verifica tu inicio de sesión para enviar mensajes.');
      } else if (err.code === 'unavailable') {
        setError('Servicio no disponible: No se pudo entregar el mensaje. Verifica tu conexión.');
      } else if (err.message?.includes('offline')) {
        setError('Sin conexión: El mensaje se guardará y enviará cuando se restablezca la conexión.');
      } else if (err.message?.includes('timeout')) {
        setError('Tiempo de espera agotado: La operación tardó demasiado. Verifica tu conexión.');
      } else {
        // Mensaje genérico para otros errores
        setError(`Error al enviar el mensaje: ${err.message || 'Intenta de nuevo.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simular respuesta del agente (en un proyecto real, llamaría a una API)
  const generateAgentResponse = async (convId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Esperar un breve momento para simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar respuesta del agente
      const agentResponse: AgentMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Soy el agente de ${agentName}. Esta es una respuesta simulada para propósitos de demostración.`,
        timestamp: new Date()
      };
      
      // Añadir mensaje a Firestore con retry y fallback
      await agentChatService.addMessageWithFallback(user.uid, agentId, {
        conversationId: convId,
        role: 'assistant',
        content: agentResponse.content
      });
      
      // Actualizar UI
      setMessages(prev => [...prev, agentResponse]);
      
      // Notificar al componente padre
      if (onReceiveMessage) {
        onReceiveMessage(agentResponse);
      }
    } catch (err: any) {
      console.error('Error generando respuesta:', err);
      setError(err.message || 'Error al recibir respuesta del agente');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para renderizar el icono de agente según su tipo
  const renderAgentIcon = (type: AgentType) => {
    const iconName = agentIconNames[type];
    switch (iconName) {
      case 'Search':
        return <Search className="h-4 w-4" />;
      case 'FileEdit':
        return <FileEdit className="h-4 w-4" />;
      case 'BarChart3':
        return <BarChart3 className="h-4 w-4" />;
      case 'PenTool':
        return <PenTool className="h-4 w-4" />;
      case 'Mail':
        return <Mail className="h-4 w-4" />;
      case 'Share2':
        return <Share2 className="h-4 w-4" />;
      case 'MessageSquare':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  // Renderizar mensaje individual
  const renderMessage = (message: AgentMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id || index}
        className={cn(
          "flex gap-3 p-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className={agentColors[agentType]}>
              {renderAgentIcon(agentType)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "rounded-lg p-4 max-w-[80%]",
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        )}>
          <p className="text-sm">{message.content}</p>
          <div className="mt-2 text-xs opacity-70">
            {formatChatDate(message.timestamp)}
          </div>
        </div>
        
        {isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || undefined} alt="Usuario" />
            <AvatarFallback className="bg-gray-700 text-gray-50">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };
  
  return (
    <Card className={cn("flex flex-col h-[calc(100vh-180px)]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className={agentColors[agentType]}>
              {renderAgentIcon(agentType)}
            </AvatarFallback>
          </Avatar>
          <span>{agentName}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-4">
              <div className="max-w-sm">
                <h3 className="text-lg font-medium mb-2">Inicia una conversación</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Envía un mensaje para comenzar a chatear con {agentName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map(renderMessage)}
              
              {/* Indicador de carga */}
              {isLoading && (
                <div className="flex gap-3 p-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={agentColors[agentType]}>
                      {renderAgentIcon(agentType)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-100"></div>
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {error && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      
      <CardFooter className="pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            placeholder={`Escribe un mensaje para ${agentName}...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !userInput.trim()}
            className="self-end h-10 w-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}