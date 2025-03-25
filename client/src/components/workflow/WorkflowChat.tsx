import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent, AgentType } from '@/lib/agents';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Search, 
  FileEdit, 
  BarChart3, 
  Mail, 
  PenTool, 
  Share2, 
  SendHorizontal,
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  User,
  ArrowLeftRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowChatProps {
  agents: Agent[];
  onBack: () => void;
}

// Agent message types
type MessageType = 'in' | 'out' | 'system' | 'user';

// Chat message interface
interface ChatMessage {
  id: string;
  sender: string;
  senderType: AgentType | 'user' | 'system';
  content: string;
  timestamp: Date;
  type: MessageType;
  status?: 'sending' | 'sent' | 'read' | 'error';
  to?: string;
}

// Agent icons by type
const agentIcons: Record<AgentType | 'user' | 'system', React.ReactNode> = {
  seo: <Search className="h-4 w-4" />,
  copywriting: <FileEdit className="h-4 w-4" />,
  ads: <BarChart3 className="h-4 w-4" />,
  creative: <PenTool className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  system: <Bot className="h-4 w-4" />
};

// Agent colors by type
const agentColors: Record<AgentType | 'user' | 'system', string> = {
  seo: 'bg-amber-500 text-amber-50',
  copywriting: 'bg-sky-500 text-sky-50',
  ads: 'bg-violet-500 text-violet-50',
  creative: 'bg-rose-500 text-rose-50',
  email: 'bg-emerald-500 text-emerald-50',
  analytics: 'bg-blue-500 text-blue-50',
  social: 'bg-pink-500 text-pink-50',
  user: 'bg-gray-700 text-gray-50',
  system: 'bg-gray-400 text-gray-50'
};

// Workflow chat component
const WorkflowChat: React.FC<WorkflowChatProps> = ({ agents, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Sistema',
      senderType: 'system',
      content: '¡Bienvenido a tu flujo de trabajo con agentes de IA! Escribe tu pregunta o instrucción para comenzar.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Find a specific agent by type
  const getAgentByType = (type: AgentType): Agent | undefined => {
    return agents.find(agent => agent.type === type);
  };

  // Handle user input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'Tú',
      senderType: 'user',
      content: userInput,
      timestamp: new Date(),
      type: 'out'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Simulate system processing message
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        sender: 'Sistema',
        senderType: 'system',
        content: 'Asignando tarea a los agentes relevantes...',
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      // Determine which agent should respond based on user input
      simulateAgentResponses(userInput);
    }, 1000);
  };

  // Simulate a conversation between agents
  const simulateAgentResponses = (userPrompt: string) => {
    // Get some agents (this is simplified - in a real app, you'd use NLP to determine relevant agents)
    const seoAgent = getAgentByType('seo');
    const copyAgent = getAgentByType('copywriting');
    const socialAgent = getAgentByType('social');
    
    // First response - SEO agent analyzes the request
    setTimeout(() => {
      if (seoAgent) {
        const message: ChatMessage = {
          id: `seo-${Date.now()}`,
          sender: seoAgent.name,
          senderType: 'seo',
          content: `Analizando el prompt: "${userPrompt}". Identificando palabras clave relevantes y oportunidades de SEO...`,
          timestamp: new Date(),
          type: 'in',
          to: 'Agentes'
        };
        setMessages(prev => [...prev, message]);
      }
    }, 2000);
    
    // Second response - Copywriter plans content
    setTimeout(() => {
      if (copyAgent) {
        const message: ChatMessage = {
          id: `copy-${Date.now()}`,
          sender: copyAgent.name,
          senderType: 'copywriting',
          content: `Basado en el análisis SEO, prepararé contenido persuasivo que aborde "${userPrompt}" con un enfoque en engagement y conversión.`,
          timestamp: new Date(),
          type: 'in',
          to: seoAgent?.name
        };
        setMessages(prev => [...prev, message]);
      }
    }, 4000);
    
    // Third response - Social media agent creates distribution plan
    setTimeout(() => {
      if (socialAgent) {
        const message: ChatMessage = {
          id: `social-${Date.now()}`,
          sender: socialAgent.name,
          senderType: 'social',
          content: `Prepararé un plan de distribución en redes sociales para maximizar el alcance del contenido sobre "${userPrompt}". Enfocaré en LinkedIn y Twitter para mayor impacto profesional.`,
          timestamp: new Date(),
          type: 'in',
          to: copyAgent?.name
        };
        setMessages(prev => [...prev, message]);
      }
    }, 6000);
    
    // Fourth response - SEO agent provides final summary
    setTimeout(() => {
      if (seoAgent) {
        const message: ChatMessage = {
          id: `seo-final-${Date.now()}`,
          sender: seoAgent.name,
          senderType: 'seo',
          content: `Excelente trabajo colaborativo. He compilado un plan completo para "${userPrompt}" que incluye optimización SEO, contenido persuasivo y estrategia de distribución. ¿Deseas que proceda con la implementación o prefieres revisar el plan primero?`,
          timestamp: new Date(),
          type: 'in',
          to: 'Tú'
        };
        setMessages(prev => [...prev, message]);
        setIsProcessing(false);
      }
    }, 8000);
  };

  // Format timestamp to readable time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render a single message
  const renderMessage = (message: ChatMessage) => {
    const isUserMessage = message.senderType === 'user';
    const isSystemMessage = message.senderType === 'system';
    
    if (isSystemMessage) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-2"
        >
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Bot className="h-3 w-3" />
            <span>{message.content}</span>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex mb-4",
          isUserMessage ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn(
          "flex max-w-[80%]",
          isUserMessage ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Avatar */}
          {!isUserMessage && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className={agentColors[message.senderType]}>
                {agentIcons[message.senderType]}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Message content */}
          <div>
            {/* Sender name and timestamp */}
            <div className={cn(
              "flex text-xs text-gray-500 mb-1",
              isUserMessage ? "justify-end" : "justify-start"
            )}>
              <span>{message.sender}</span>
              {message.to && (
                <>
                  <span className="mx-1 flex items-center">
                    <ArrowLeftRight className="h-2 w-2 mx-1" />
                  </span>
                  <span>{message.to}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            
            {/* Message bubble */}
            <div className={cn(
              "rounded-lg p-3",
              isUserMessage 
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {/* Message status for user messages */}
            {isUserMessage && message.status && (
              <div className="flex justify-end mt-1">
                {message.status === 'sending' && <Clock className="h-3 w-3 text-gray-400" />}
                {message.status === 'sent' && <CheckCircle className="h-3 w-3 text-gray-400" />}
                {message.status === 'read' && (
                  <div className="flex">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <CheckCircle className="h-3 w-3 text-blue-500 -ml-1" />
                  </div>
                )}
                {message.status === 'error' && (
                  <span className="text-xs text-red-500">Error al enviar</span>
                )}
              </div>
            )}
          </div>
          
          {/* User avatar */}
          {isUserMessage && (
            <Avatar className="h-8 w-8 ml-2">
              <AvatarFallback className="bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-850">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Agentes IA - En ejecución</h3>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Activo
                </span>
              </Badge>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{agents.length} agentes</span>
            </div>
          </div>
        </div>
        
        <Button size="sm" variant="outline" className="gap-1" onClick={onBack}>
          <Play className="h-3 w-3" />
          <span>Editar workflow</span>
        </Button>
      </div>
      
      {/* Main content with tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="px-4 pt-2 bg-white dark:bg-gray-850 border-b">
          <TabsTrigger value="chat" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
            Conversación
          </TabsTrigger>
          <TabsTrigger value="info" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
            Agentes
          </TabsTrigger>
          <TabsTrigger value="results" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
            Resultados
          </TabsTrigger>
        </TabsList>
        
        {/* Chat tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 data-[state=active]:flex data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}
              
              {/* Loading indicator when processing */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2 my-4"
                  >
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full py-1 px-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
          
          {/* Input area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu mensaje o instrucción..."
                  className="resize-none min-h-[60px]"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isProcessing || !userInput.trim()}
                className="gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <span>Enviar</span>
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-2 text-xs text-gray-500 flex gap-1 items-center">
              <Sparkles className="h-3 w-3" />
              <span>
                Escribe una instrucción clara para obtener mejores resultados. Ejemplo: "Crea una campaña para..."
              </span>
            </div>
          </div>
        </TabsContent>
        
        {/* Team info tab */}
        <TabsContent value="info" className="m-0 p-4 overflow-auto data-[state=active]:block data-[state=inactive]:hidden">
          <h3 className="font-medium text-lg mb-4">Agentes activos</h3>
          <div className="grid gap-3">
            {agents.map(agent => (
              <Card key={agent.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={agentColors[agent.type]}>
                        {agentIcons[agent.type]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {agent.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {agent.description || "Agente especializado para workflows de marketing con IA."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Results tab */}
        <TabsContent value="results" className="m-0 p-4 overflow-auto data-[state=active]:block data-[state=inactive]:hidden">
          <div className="rounded-lg border p-6 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center text-center">
            <Bot className="h-8 w-8 text-gray-400 mb-2" />
            <h3 className="font-medium">No hay resultados disponibles</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              La conversación aún no ha generado resultados finales. Continúa interactuando con los agentes.
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              const chatTab = document.querySelector('[data-value="chat"]') as HTMLElement;
              if (chatTab) chatTab.click();
            }}>
              Volver a la conversación
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowChat;