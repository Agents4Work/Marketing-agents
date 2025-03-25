import React, { useState, useEffect, useRef } from 'react';
import { AgentMessage, AgentConversation } from '@/types/conversations';
import { AgentType } from '@/types/agents';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatRelativeDate, generateRandomId } from '@/lib/utils';
import { Send as PaperPlaneIcon, Loader2 as Loader2Icon } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { getCurrentUser } from '@/firebase/auth-utils';

interface ChatMessage extends AgentMessage {
  animateIn?: boolean;
}

interface PersistentWorkflowChatProps {
  agentId: string;
  agentType: AgentType;
  agentName: string;
  agentIcon?: React.ReactNode;
  agentDescription?: string;
  systemPrompt?: string;
  className?: string;
  showHeader?: boolean;
  placeholderText?: string;
  onResponseGenerated?: (response: string) => void;
}

const DEFAULT_PLACEHOLDER = 'Escribe tu mensaje...';

const PersistentWorkflowChat: React.FC<PersistentWorkflowChatProps> = ({
  agentId,
  agentType,
  agentName,
  agentIcon,
  agentDescription,
  systemPrompt,
  className,
  showHeader = true,
  placeholderText = DEFAULT_PLACEHOLDER,
  onResponseGenerated
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Función para obtener el usuario actual
  const getUser = (): { uid: string } | undefined => {
    const user = getCurrentUser();
    return user ? { uid: user.uid } : undefined;
  };
  
  // Scroll al final cuando se agregan mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Función para crear una nueva conversación
  const createNewConversation = async (initialMessage?: string): Promise<string> => {
    try {
      const user = getUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      const conversation = await chatService.createConversation({
        title: `Conversación con ${agentName}`,
        agentId,
        agentType,
        userId: user.uid,
        initialMessage
      });
      
      return conversation.id;
    } catch (error: any) {
      console.error('Error al crear conversación:', error);
      setError(error.message || 'Error al crear conversación');
      throw error;
    }
  };
  
  // Cargar mensajes de una conversación existente
  const loadMessages = async (convId: string) => {
    try {
      const user = getUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      const conversation = await chatService.getConversation(user.uid, convId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }
      
      setMessages(conversation.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error: any) {
      console.error('Error al cargar mensajes:', error);
      setError(error.message || 'Error al cargar mensajes');
    }
  };
  
  // Agregar mensaje del usuario y procesar respuesta del agente
  const addUserMessageAndGetResponse = async (content: string, convId: string) => {
    try {
      const user = getUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Agregar mensaje del usuario a Firestore
      await chatService.addMessage(user.uid, {
        conversationId: convId,
        role: 'user',
        content
      });
      
      // Simular respuesta del agente (en un proyecto real, esto llamaría a una API)
      setLoading(true);
      
      // Esperar un tiempo aleatorio para simular procesamiento (entre 1 y 3 segundos)
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Generar una respuesta de ejemplo
      const response = generateMockResponse(content, agentType);
      
      // Agregar respuesta del agente a Firestore
      const assistantMessage = await chatService.addMessage(user.uid, {
        conversationId: convId,
        role: 'assistant',
        content: response
      });
      
      // Notificar la respuesta para uso en workflows
      if (onResponseGenerated) {
        onResponseGenerated(response);
      }
      
      return assistantMessage;
    } catch (error: any) {
      console.error('Error en la conversación:', error);
      setError(error.message || 'Error en la conversación');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar el envío del formulario
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const messageContent = input.trim();
    setInput('');
    
    // Actualizar UI inmediatamente
    const userMessage: ChatMessage = {
      id: generateRandomId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      animateIn: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Crear conversación si es necesario
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        currentConversationId = await createNewConversation(messageContent);
        setConversationId(currentConversationId);
      } else {
        // Si ya existe una conversación, solo procesamos el mensaje
        const user = getUser();
        if (user) {
          await chatService.addMessage(user.uid, {
            conversationId: currentConversationId,
            role: 'user',
            content: messageContent
          });
        }
      }
      
      // Indicador de carga
      setMessages(prev => [
        ...prev,
        {
          id: 'loading',
          role: 'assistant',
          content: '...',
          timestamp: new Date(),
          animateIn: true
        }
      ]);
      
      // Obtener respuesta del agente
      const assistantMessage = await addUserMessageAndGetResponse(messageContent, currentConversationId);
      
      // Reemplazar indicador de carga con la respuesta real
      setMessages(prev => 
        prev.filter(msg => msg.id !== 'loading').concat({
          ...assistantMessage,
          animateIn: true
        })
      );
    } catch (error: any) {
      console.error('Error al procesar mensaje:', error);
      setError(error.message || 'Error al procesar mensaje');
      
      // Eliminar indicador de carga si hubo un error
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'));
    }
  };
  
  // Manejar tecla Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Ajustar altura del textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);
  
  // Función para generar respuestas simuladas basadas en el tipo de agente
  // En un proyecto real, esto llamaría a una API de IA
  const generateMockResponse = (userMessage: string, agentType: AgentType): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    const responses: Record<AgentType, string[]> = {
      'seo': [
        `Para mejorar el SEO de tu contenido sobre "${userMessage}", te recomiendo enfocarte en palabras clave específicas y crear contenido de calidad que responda a la intención de búsqueda.`,
        `Analizando tu consulta, deberías optimizar los meta títulos y descripciones, además de mejorar la estructura de encabezados H1, H2, H3.`,
        `Una estrategia efectiva sería crear contenido extenso (+2000 palabras) sobre "${userMessage}" y optimizarlo para voice search.`
      ],
      'copywriting': [
        `He creado un copy persuasivo para tu mensaje: "${userMessage}". Enfatiza los beneficios y crea un sentido de urgencia para motivar la acción.`,
        `Para tu copy sobre "${userMessage}", recomiendo usar la estructura PAS (Problema, Agitación, Solución) y enfocarte en el valor para el cliente.`,
        `Un buen enfoque para "${userMessage}" sería utilizar storytelling y conectar emocionalmente con tu audiencia.`
      ],
      'ads': [
        `Para tus anuncios sobre "${userMessage}", recomiendo segmentar por intereses y comportamientos, con un CPC máximo de $1.50 para empezar.`,
        `Basándome en tu mensaje, sugiero crear 3-5 variaciones de anuncios A/B testing para "${userMessage}" con diferentes llamados a la acción.`,
        `Una estrategia efectiva para anuncios de "${userMessage}" sería utilizar remarketing para usuarios que visitaron tu sitio en los últimos 30 días.`
      ],
      'creative': [
        `Para tu concepto creativo sobre "${userMessage}", recomiendo un enfoque disruptivo que combine elementos visuales inesperados con una narrativa emocional.`,
        `Un concepto creativo para "${userMessage}" podría basarse en el contraste entre lo tradicional y lo moderno, creando una tensión visual interesante.`,
        `Para destacar creativamente "${userMessage}", sugiero usar una paleta de colores complementarios y tipografía que refleje la personalidad de la marca.`
      ],
      'email': [
        `Para tu campaña de email sobre "${userMessage}", recomiendo una secuencia de nutrición de 5 emails con enfoque en educación antes de la venta.`,
        `Un buen asunto para tu email sobre "${userMessage}" sería: "La estrategia que está transformando [industria]" con un 32% de tasa de apertura estimada.`,
        `Para maximizar conversiones en tu campaña de "${userMessage}", implementa segmentación basada en comportamiento y personaliza el contenido según la etapa del embudo.`
      ],
      'analytics': [
        `Analizando tu consulta sobre "${userMessage}", recomiendo implementar un dashboard con KPIs específicos: tasa de conversión, CAC, y LTV.`,
        `Para medir el rendimiento de "${userMessage}", configura eventos personalizados en GA4 y establece un embudo de conversión para seguir el recorrido del usuario.`,
        `Basado en los datos, la atribución para "${userMessage}" debería seguir un modelo multi-touch con mayor peso en los touchpoints de consideración y decisión.`
      ],
      'social': [
        `Para tu estrategia de redes sociales sobre "${userMessage}", recomiendo enfocarte en Instagram y TikTok con contenido visual de alta calidad y storytelling.`,
        `Un calendario editorial para "${userMessage}" debería incluir 3 posts semanales: educativo (lunes), inspiracional (miércoles) y promocional (viernes).`,
        `Para aumentar el engagement en tu contenido sobre "${userMessage}", implementa estrategias de UGC y colaboraciones con micro-influencers de tu nicho.`
      ],
      'strategy': [
        `Para tu estrategia de marketing sobre "${userMessage}", recomiendo un enfoque omnicanal con énfasis en contenido educativo y construcción de comunidad.`,
        `Un plan estratégico para "${userMessage}" debería dividirse en 3 fases: awareness (contenido viral), consideración (webinars y casos de estudio) y conversión (pruebas gratuitas).`,
        `Basado en las tendencias actuales, tu estrategia para "${userMessage}" debería priorizar marketing conversacional y experiencias personalizadas.`
      ]
    };
    
    // Seleccionar respuesta aleatoria según el tipo de agente
    const agentResponses = responses[agentType] || responses['strategy'];
    const randomIndex = Math.floor(Math.random() * agentResponses.length);
    return agentResponses[randomIndex];
  };
  
  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {showHeader && (
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex items-center">
            {agentIcon && <div className="mr-2">{agentIcon}</div>}
            <div>
              <CardTitle className="text-lg">{agentName}</CardTitle>
              {agentDescription && <p className="text-sm text-gray-500">{agentDescription}</p>}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="flex-grow p-0 overflow-y-auto">
        <div className="flex flex-col p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
              <p>No hay mensajes en esta conversación.</p>
              <p className="text-sm mt-2">Escribe tu primer mensaje para comenzar a chatear con {agentName}.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={cn(
                  "flex items-start gap-3 transition-opacity",
                  message.animateIn && "animate-in fade-in-50",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[85%] break-words",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                  <div 
                    className={cn(
                      "text-xs mt-1 text-right",
                      message.role === 'user' 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    )}
                  >
                    {formatRelativeDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 text-sm">
            {error}
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 ml-2 text-red-700" 
              onClick={() => setError(null)}
            >
              Cerrar
            </Button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-end w-full gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="min-h-10 flex-1 p-3 resize-none"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !input.trim()}
            className="h-10 w-10"
          >
            {loading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default PersistentWorkflowChat;