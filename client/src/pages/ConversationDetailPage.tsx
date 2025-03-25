/**
 * Vista detallada de una conversación con un agente
 * Muestra todos los mensajes y permite al usuario enviar nuevos mensajes
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AgentType } from '@/lib/agents';
import { AgentConversation, AgentMessage } from '@/types/conversations';
import { chatService } from '@/services/chatService';
import { formatChatDate } from '@/utils/chatUtils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  SendHorizontal,
  User,
  Bot,
  Search,
  FileEdit,
  BarChart3,
  PenTool,
  Mail,
  Share2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Íconos por tipo de agente
const agentIcons: Record<AgentType, React.ReactNode> = {
  seo: <Search className="h-4 w-4" />,
  copywriting: <FileEdit className="h-4 w-4" />,
  ads: <BarChart3 className="h-4 w-4" />,
  creative: <PenTool className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  strategy: <MessageSquare className="h-4 w-4" />
};

// Colores por tipo de agente
const agentColors: Record<AgentType, string> = {
  seo: 'bg-amber-500 text-amber-50',
  copywriting: 'bg-sky-500 text-sky-50',
  ads: 'bg-violet-500 text-violet-50',
  creative: 'bg-rose-500 text-rose-50',
  email: 'bg-emerald-500 text-emerald-50',
  analytics: 'bg-blue-500 text-blue-50',
  social: 'bg-pink-500 text-pink-50',
  strategy: 'bg-indigo-500 text-indigo-50'
};

// Nombres legibles para tipos de agentes
const agentTypeNames: Record<AgentType, string> = {
  seo: 'SEO',
  copywriting: 'Copywriting',
  ads: 'Publicidad',
  creative: 'Creativo',
  email: 'Email',
  analytics: 'Analítica',
  social: 'Social Media',
  strategy: 'Estrategia'
};

export default function ConversationDetailPage() {
  const params = useParams<{ agentType: AgentType; id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener datos de la conversación utilizando chatService
  useEffect(() => {
    const loadConversation = async () => {
      if (!user || !params.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Usar el servicio para obtener la conversación
        const conversationData = await chatService.getConversation(user.uid, params.id);
        
        if (!conversationData) {
          setError('Conversación no encontrada');
          setIsLoading(false);
          return;
        }
        
        setConversation(conversationData);
        setMessages(conversationData.messages);
        setIsLoading(false);
      } catch (err) {
        console.error('Error cargando conversación:', err);
        setError('No se pudo cargar la conversación');
        setIsLoading(false);
      }
    };
    
    loadConversation();
  }, [user, params.id]);
  
  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  // Enviar un mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || !user || !conversation) return;
    
    const newUserMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    // Actualizar interfaz inmediatamente
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    try {
      // Enviar mensaje a Firestore
      await chatService.addMessage(user.uid, {
        conversationId: conversation.id,
        role: 'user',
        content: userInput
      });
      
      // Simular respuesta del agente
      setTimeout(async () => {
        const agentResponse: AgentMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `He recibido tu mensaje: "${userInput}". Esta es una respuesta simulada para la demostración.`,
          timestamp: new Date()
        };
        
        // Actualizar Firestore y la interfaz
        await chatService.addMessage(user.uid, {
          conversationId: conversation.id,
          role: 'assistant',
          content: agentResponse.content
        });
        
        // Actualizar conversación
        const updatedConversation = await chatService.getConversation(
          user.uid, 
          conversation.id
        );
        
        // Actualizar estado si se obtuvieron los datos correctamente
        if (updatedConversation) {
          setConversation(updatedConversation);
          setMessages(updatedConversation.messages);
        }
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setIsProcessing(false);
    }
  };
  
  // Renderizar mensajes
  const renderMessage = (message: AgentMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        key={message.id || index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 * Math.min(index, 5) }}
        className={cn(
          "flex gap-3 p-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className={agentColors[conversation?.agentType || 'copywriting']}>
              {agentIcons[conversation?.agentType || 'copywriting']}
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
      </motion.div>
    );
  };
  
  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3"></div>
          <div className="h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  // Pantalla de error
  if (error || !conversation) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">{error || 'Conversación no encontrada'}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            No pudimos encontrar la conversación solicitada
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation('/conversations')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Volver al historial</span>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setLocation('/conversations')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>
          <div>
            <Badge className={cn("text-xs mr-2", agentColors[conversation.agentType])}>
              <div className="flex items-center gap-1">
                {agentIcons[conversation.agentType]}
                <span>{agentTypeNames[conversation.agentType]}</span>
              </div>
            </Badge>
          </div>
        </div>
        
        <Card className="flex flex-col h-[calc(100vh-150px)]">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{conversation.title}</CardTitle>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatChatDate(conversation.createdAt)}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 pt-4 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-250px)]">
              <AnimatePresence>
                <div className="flex flex-col">
                  {messages.map((message, index) => renderMessage(message, index))}
                  
                  {/* Indicador de escritura */}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 p-4"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={agentColors[conversation.agentType]}>
                          {agentIcons[conversation.agentType]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-4 max-w-[80%] bg-gray-100 dark:bg-gray-800">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce"></div>
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-100"></div>
                          <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
          
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Textarea
                placeholder="Escribe tu mensaje..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isProcessing}
                className="flex-1 min-h-[60px] resize-none"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isProcessing || !userInput.trim()}
                className="self-end h-10 w-10"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}