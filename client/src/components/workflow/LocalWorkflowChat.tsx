/**
 * LocalWorkflowChat Component
 * 
 * Este componente proporciona funcionalidad de chat persistente para los nodos de flujo de trabajo
 * utilizando localStorage en lugar de Firestore mientras resolvemos los problemas de integración.
 * 
 * Características:
 * - Persiste conversaciones por agente y usuario
 * - Muestra historial de conversaciones
 * - Permite crear nuevas conversaciones
 * - Simula respuestas del agente (para pruebas)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  createLocalConversation, 
  addLocalMessage, 
  getLocalConversation,
  getLocalConversationsByAgent,
  LocalConversation,
  LocalMessage
} from '@/services/localChatService';
import { AgentType, DEFAULT_AGENTS } from '@/lib/agents';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, User as UserIcon, Bot, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LocalWorkflowChatProps {
  agentId: string;
  agentType: AgentType;
  nodeId?: string;
  agentName?: string;
  agentDescription?: string;
  disabled?: boolean;
  onResponseGenerated?: (response: string) => void;
}

export default function LocalWorkflowChat({
  agentId,
  agentType,
  nodeId = 'default',
  agentName,
  agentDescription,
  disabled = false,
  onResponseGenerated
}: LocalWorkflowChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<LocalConversation | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Obtener nombre del agente de la lista predefinida si no se proporciona
  const resolvedAgentName = agentName || 
    DEFAULT_AGENTS.find(a => a.id === agentId)?.name || 
    'Asistente IA';

  // Cargar conversaciones al montar componente o cambiar agente
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, agentId]);

  // Scroll al final de los mensajes cuando cambian
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  // Cargar conversaciones existentes para este agente
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const userConversations = getLocalConversationsByAgent(agentId, user.uid);
      setConversations(userConversations);
      
      // Si hay conversaciones, seleccionamos la más reciente
      if (userConversations.length > 0) {
        // Ordenar por fecha de actualización (más reciente primero)
        const sortedConversations = [...userConversations].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setConversation(sortedConversations[0]);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar conversaciones');
    }
  };

  // Enviar un mensaje
  const sendMessage = async () => {
    if (!user || !message.trim() || disabled) return;
    
    try {
      setStatus('loading');
      setError(null);
      
      // Si no hay conversación activa, crear una nueva
      if (!conversation) {
        const newConversation = createLocalConversation(
          agentId,
          user.uid,
          agentType,
          message
        );
        
        setConversation(newConversation);
        setConversations(prev => [newConversation, ...prev]);
        
        // Generar respuesta del asistente
        generateResponse(newConversation);
      } else {
        // Agregar mensaje a la conversación existente
        const updatedConversation = addLocalMessage(
          conversation.id,
          'user',
          message
        );
        
        if (updatedConversation) {
          setConversation(updatedConversation);
          
          // Actualizar lista de conversaciones
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversation.id ? updatedConversation : conv
            )
          );
          
          // Generar respuesta del asistente
          generateResponse(updatedConversation);
        } else {
          throw new Error('No se pudo agregar el mensaje');
        }
      }
      
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar mensaje');
      setStatus('error');
    }
  };

  // Generar respuesta del asistente según el tipo de agente
  const generateResponse = async (currentConversation: LocalConversation) => {
    const userMessage = currentConversation.messages[currentConversation.messages.length - 1].content;
    let responseContent = '';
    
    // Generar respuesta según el tipo de agente
    switch (agentType) {
      case 'seo':
        responseContent = generateSEOResponse(userMessage);
        break;
      case 'copywriting':
        responseContent = generateCopywritingResponse(userMessage);
        break;
      case 'ads':
        responseContent = generateAdsResponse(userMessage);
        break;
      case 'creative':
        responseContent = generateCreativeResponse(userMessage);
        break;
      case 'email':
        responseContent = generateEmailResponse(userMessage);
        break;
      case 'analytics':
        responseContent = generateAnalyticsResponse(userMessage);
        break;
      case 'social':
        responseContent = generateSocialResponse(userMessage);
        break;
      default:
        responseContent = "Gracias por tu mensaje. ¿En qué más puedo ayudarte?";
    }
    
    // Agregar respuesta a la conversación
    const updatedConversation = addLocalMessage(
      currentConversation.id,
      'assistant',
      responseContent
    );
    
    if (updatedConversation) {
      setConversation(updatedConversation);
      
      // Actualizar lista de conversaciones
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      );
      
      // Notificar al componente padre si es necesario
      if (onResponseGenerated) {
        onResponseGenerated(responseContent);
      }
    }
    
    setStatus('success');
  };
  
  // Funciones generadoras de respuestas según el tipo de agente
  const generateSEOResponse = (userMessage: string) => {
    const responses = [
      "He analizado tus keywords y sugiero optimizar los meta títulos con estas palabras clave: [keyword1], [keyword2], [keyword3].",
      "Después de revisar tu sitio, recomiendo mejorar la estructura de URLs y añadir breadcrumbs para mejorar el SEO técnico.",
      "Para mejorar tu ranking en Google, necesitas trabajar en tu contenido de calidad y enlaces entrantes. Puedo ayudarte a crear una estrategia.",
      "Basado en mi análisis, tu competencia está utilizando estas keywords que tú no: [keyword1], [keyword2]. Sugiero incorporarlas en tu estrategia.",
      "Tu velocidad de carga es un factor crítico para SEO. Recomiendo optimizar imágenes y utilizar caché del navegador para mejorar tu rendimiento."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateCopywritingResponse = (userMessage: string) => {
    const responses = [
      "He preparado un copy persuasivo para tu landing page que destaca los beneficios de tu producto y genera urgencia de compra.",
      "Aquí tienes tres opciones de titulares para tu campaña. Todos utilizan técnicas probadas de copywriting para aumentar conversiones.",
      "Para tu email marketing, sugiero utilizar esta secuencia de asuntos que he creado para maximizar la tasa de apertura.",
      "He analizado tu mensaje y desarrollado un copy que utiliza storytelling para conectar emocionalmente con tu audiencia.",
      "Para tu descripción de producto, recomiendo este texto que destaca características y beneficios, además de incluir llamadas a la acción efectivas."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateAdsResponse = (userMessage: string) => {
    const responses = [
      "He creado 3 variantes de anuncios para Google Ads con diferentes llamadas a la acción para que puedas testear cuál funciona mejor.",
      "Para tu campaña de Facebook, sugiero estos segmentos de audiencia basados en intereses y comportamientos similares a tus clientes actuales.",
      "Aquí tienes un plan de medios optimizado para maximizar tu ROI, distribuyendo tu presupuesto entre Google, Facebook y LinkedIn.",
      "He analizado tus anteriores campañas y detectado que los anuncios con estas características generaron más conversiones.",
      "Para tu campaña de remarketing, recomiendo estos mensajes personalizados según la fase del embudo en que se encuentre el usuario."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateCreativeResponse = (userMessage: string) => {
    const responses = [
      "He desarrollado un concepto creativo para tu campaña que se centra en la emoción de [beneficio principal] y se diferencia de tu competencia.",
      "Propongo este estilo visual para tu marca que transmite los valores de [valor1], [valor2] y [valor3] que mencionaste.",
      "Aquí tienes un moodboard que refleja la dirección creativa que recomiendo para tu próxima campaña, alineada con tu posicionamiento.",
      "Basado en las tendencias actuales y tu público objetivo, sugiero este enfoque narrativo para tus próximos contenidos.",
      "He diseñado esta paleta de colores y elementos visuales que fortalecerán tu identidad de marca y mejorarán el reconocimiento."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateEmailResponse = (userMessage: string) => {
    const responses = [
      "He creado una secuencia de 5 emails para tu embudo de conversión, desde el lead magnet hasta la propuesta de venta.",
      "Para aumentar la tasa de apertura, sugiero estos asuntos personalizados que generan curiosidad y urgencia sin parecer spam.",
      "Aquí tienes una plantilla de email para recuperación de carritos abandonados con un 35% de tasa de conversión en promedio.",
      "He desarrollado esta estrategia de segmentación para tus newsletters que permitirá enviar contenido más relevante según el comportamiento del usuario.",
      "Para tu campaña de reactivación de suscriptores inactivos, recomiendo esta estructura de email con una oferta especial limitada."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateAnalyticsResponse = (userMessage: string) => {
    const responses = [
      "He analizado tus datos de tráfico y he identificado que la mayor tasa de conversión proviene de [fuente], pero no estás maximizando esta oportunidad.",
      "Según el análisis de tu embudo de ventas, hay un 67% de abandono en la página de checkout que podría mejorarse con estos cambios.",
      "Los datos muestran que tu audiencia interactúa más con contenido sobre [tema], sugiero priorizar este tipo de contenidos en tu estrategia.",
      "He creado un dashboard personalizado en Google Analytics que te permitirá monitorizar los KPIs críticos para tu negocio en tiempo real.",
      "Analizando tus campañas de marketing, he identificado que tu ROI más alto proviene de [canal], recomiendo reasignar presupuesto para maximizar resultados."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateSocialResponse = (userMessage: string) => {
    const responses = [
      "He desarrollado un calendario editorial para tus redes sociales con temas, formatos y mejores horarios de publicación según tu audiencia.",
      "Para Instagram, sugiero implementar esta estrategia de contenidos que combina posts educativos, inspiracionales y promocionales en proporción 4:3:1.",
      "Basado en las tendencias actuales, recomiendo incluir estos hashtags en tus publicaciones para aumentar alcance y descubrimiento.",
      "He analizado tus competidores en redes sociales y he identificado oportunidades de contenido que están funcionando pero que no estás aprovechando.",
      "Para aumentar engagement, sugiero implementar estas dinámicas interactivas en tus stories y posts que incentivan la participación de tu comunidad."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Seleccionar una conversación del historial
  const selectConversation = (selectedConversation: LocalConversation) => {
    setConversation(selectedConversation);
    setHistoryOpen(false);
  };

  // Iniciar una nueva conversación
  const startNewConversation = () => {
    setConversation(null);
    setHistoryOpen(false);
  };

  // Renderizar un mensaje
  const renderMessage = (msg: LocalMessage, index: number) => {
    const isUser = msg.role === 'user';
    
    return (
      <div 
        key={msg.id} 
        className={`my-2 p-3 rounded-lg max-w-[85%] ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none' 
            : 'bg-muted/70 text-muted-foreground mr-auto rounded-tl-none'
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1">
            <div className="text-sm font-medium mb-1">
              {isUser ? 'Tú' : resolvedAgentName}
            </div>
            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            <div className="text-xs opacity-70 text-right mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {isUser && (
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={user?.photoURL || undefined} alt="User" />
              <AvatarFallback className="bg-gray-400 text-white">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {resolvedAgentName}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            disabled={disabled}
            title="Ver historial de conversaciones"
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100%-0.5rem)] pr-3">
          <div className="space-y-2 min-h-full">
            {conversation && conversation.messages.length > 0 ? (
              <>
                {conversation.messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="h-full min-h-[150px] flex items-center justify-center text-center p-4 text-muted-foreground">
                <div>
                  <p>Inicia una nueva conversación con {resolvedAgentName}</p>
                  {agentDescription && (
                    <p className="text-sm mt-2 max-w-md mx-auto">{agentDescription}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Escribe un mensaje para ${resolvedAgentName}...`}
            disabled={disabled || status === 'loading' || !user}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || status === 'loading' || disabled || !user}
          >
            Enviar
          </Button>
        </form>
      </CardFooter>
      
      {/* Diálogo de historial de conversaciones */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Historial de Conversaciones</DialogTitle>
            <DialogDescription>
              Conversaciones previas con {resolvedAgentName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={startNewConversation}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nueva conversación
            </Button>
            
            {conversations.length === 0 ? (
              <div className="text-center p-4 border rounded-md text-muted-foreground">
                No hay conversaciones guardadas
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer hover:shadow-sm transition-shadow ${
                        conversation?.id === conv.id ? 'border-primary' : ''
                      }`}
                      onClick={() => selectConversation(conv)}
                    >
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm font-medium">{conv.title}</CardTitle>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                          <span>{conv.messages.length} mensajes</span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {error && (
        <div className="p-2 text-xs text-destructive">
          {error}
        </div>
      )}
      
      {!user && (
        <div className="p-2 text-xs text-amber-500">
          Inicia sesión para usar el chat.
        </div>
      )}
    </Card>
  );
}