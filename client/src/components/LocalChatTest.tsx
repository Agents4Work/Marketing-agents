/**
 * Componente de prueba usando almacenamiento local para conversaciones
 * 
 * Este componente usa localStorage para persistir conversaciones en lugar
 * de Firestore, para evitar problemas con el servicio.
 * 
 * NOTA: Esta implementación es temporal para desarrollo y diagnóstico.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  createLocalConversation, 
  addLocalMessage, 
  getLocalConversation,
  getLocalConversationsByUser,
  getLocalConversationsByAgent,
  LocalConversation
} from '@/services/localChatService';
import { AgentType, DEFAULT_AGENTS } from '@/lib/agents';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, User as UserIcon, Bot, RefreshCw } from 'lucide-react';

export default function LocalChatTest() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [message, setMessage] = useState('');
  const [agentType, setAgentType] = useState<AgentType>('copywriting');
  const [agentId, setAgentId] = useState('2'); // Default: Copywriter
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<LocalConversation | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Cambiar el agentId cuando cambia el tipo de agente
  useEffect(() => {
    // Encontrar el agente con este tipo
    const agent = DEFAULT_AGENTS.find(a => a.type === agentType);
    if (agent) {
      setAgentId(agent.id);
      addLog(`Agente seleccionado: ${agent.name} (ID: ${agent.id})`);
    }
  }, [agentType]);

  // Cargar conversaciones al iniciar
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Cargar conversaciones del usuario
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setStatus('loading');
      addLog('Cargando conversaciones locales...');
      
      const userConversations = getLocalConversationsByUser(user.uid);
      
      setConversations(userConversations);
      addLog(`Conversaciones cargadas: ${userConversations.length}`);
      
      if (userConversations.length > 0) {
        setCurrentConversation(userConversations[0]);
        setConversationId(userConversations[0].id);
        addLog(`Conversación activa: ${userConversations[0].title}`);
      }
      
      setStatus('success');
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar conversaciones');
      setStatus('error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Crear una nueva conversación
  const createNewConversation = async () => {
    if (!user || !message.trim()) return;
    
    try {
      setStatus('loading');
      addLog('Creando nueva conversación local...');
      
      const newConversation = createLocalConversation(
        agentId,
        user.uid,
        agentType,
        message
      );
      
      setConversationId(newConversation.id);
      setCurrentConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
      
      // Simular respuesta del asistente
      addLog('Generando respuesta del asistente...');
      const updatedConversation = simulateResponse(newConversation);
      
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(c => 
          c.id === updatedConversation.id ? updatedConversation : c
        ));
      }
      
      setMessage('');
      setStatus('success');
      addLog(`Conversación creada con ID: ${newConversation.id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Error al crear conversación');
      setStatus('error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Agregar mensaje a conversación existente
  const addMessageToConversation = async () => {
    if (!user || !conversationId || !message.trim()) return;
    
    try {
      setStatus('loading');
      addLog(`Agregando mensaje a conversación ${conversationId}...`);
      
      const updatedConversation = addLocalMessage(
        conversationId,
        'user',
        message
      );
      
      if (!updatedConversation) {
        throw new Error('No se pudo agregar el mensaje');
      }
      
      setCurrentConversation(updatedConversation);
      
      // Actualizar la lista de conversaciones
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
      // Simular respuesta del asistente
      addLog('Generando respuesta del asistente...');
      const finalConversation = simulateResponse(updatedConversation);
      
      if (finalConversation) {
        setCurrentConversation(finalConversation);
        setConversations(prev => prev.map(c => 
          c.id === finalConversation.id ? finalConversation : c
        ));
      }
      
      setMessage('');
      setStatus('success');
      addLog('Mensaje agregado correctamente');
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Error al agregar mensaje');
      setStatus('error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Simular respuesta del asistente
  const simulateResponse = (conversation: LocalConversation): LocalConversation | null => {
    const responses = [
      "¡Gracias por tu mensaje! Estoy aquí para ayudarte con tu estrategia de marketing.",
      "Interesante planteamiento. Podemos expandir esta idea para tu campaña.",
      "He analizado tu mensaje y tengo varias sugerencias para optimizar tu enfoque.",
      "Basado en tu objetivo, te recomendaría enfocarte en estos puntos clave...",
      "¡Excelente! Trabajemos en esta dirección para maximizar el impacto de tu marketing."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const updatedConversation = addLocalMessage(
      conversation.id,
      'assistant',
      randomResponse
    );
    
    if (updatedConversation) {
      addLog('Respuesta del asistente agregada correctamente');
      return updatedConversation;
    } else {
      addLog('Error al agregar respuesta del asistente');
      return null;
    }
  };

  // Seleccionar una conversación
  const selectConversation = (conversation: LocalConversation) => {
    setCurrentConversation(conversation);
    setConversationId(conversation.id);
    setActiveTab('chat');
    addLog(`Conversación seleccionada: ${conversation.title}`);
  };

  // Iniciar una nueva conversación
  const startNewConversation = () => {
    setCurrentConversation(null);
    setConversationId(null);
    setActiveTab('chat');
    addLog('Preparando nueva conversación');
  };

  // Agregar log
  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // Manejar envío de mensaje
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (conversationId) {
      addMessageToConversation();
    } else {
      createNewConversation();
    }
  };

  // Renderizar mensaje
  const renderMessage = (msg: any, index: number) => {
    const isUser = msg.role === 'user';
    const agent = DEFAULT_AGENTS.find(a => a.id === agentId);
    const agentName = agent?.name || 'Asistente';
    
    return (
      <div 
        key={index} 
        className={`my-2 p-3 rounded-lg max-w-[80%] ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none' 
            : 'bg-muted text-muted-foreground mr-auto rounded-tl-none'
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
          
          <div>
            <div className="text-sm font-medium mb-1">
              {isUser ? 'Tú' : agentName}
            </div>
            <div className="text-sm">{msg.content}</div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Chat Local (localStorage)</CardTitle>
          <CardDescription>
            Esta versión usa almacenamiento local para evitar problemas con Firestore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Agente</label>
            <Select value={agentType} onValueChange={(value: AgentType) => setAgentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seo">SEO Expert</SelectItem>
                <SelectItem value="copywriting">Copywriter</SelectItem>
                <SelectItem value="ads">Ads Specialist</SelectItem>
                <SelectItem value="creative">Creative Director</SelectItem>
                <SelectItem value="email">Email Marketer</SelectItem>
                <SelectItem value="analytics">Analytics Expert</SelectItem>
                <SelectItem value="social">Social Media Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex mb-2">
            <TabsList className="w-full">
              <TabsTrigger 
                value="chat" 
                className={`flex-1 ${activeTab === 'chat' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className={`flex-1 ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Historial
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div>
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="min-h-[100px]"
                  />
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || status === 'loading' || !user}
                    className="w-full"
                  >
                    {conversationId ? 'Enviar Mensaje' : 'Crear Conversación'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={startNewConversation}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
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
                            conversationId === conv.id ? 'border-primary' : ''
                          }`}
                          onClick={() => selectConversation(conv)}
                        >
                          <CardHeader className="p-3 pb-2">
                            <CardTitle className="text-sm font-medium">{conv.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(conv.updatedAt).toLocaleString()} - {conv.messages.length} mensajes
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          
          {!user && (
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-md text-sm">
              Debes iniciar sesión para poder usar el chat.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentConversation 
                ? `Conversación: ${currentConversation.title}` 
                : 'Nueva Conversación'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card border rounded-lg min-h-[300px] max-h-[400px] overflow-y-auto p-3">
              {currentConversation && currentConversation.messages.length > 0 ? (
                currentConversation.messages.map(renderMessage)
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {conversationId 
                    ? 'No hay mensajes en esta conversación'
                    : 'Inicia una nueva conversación'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/90 text-green-400 font-mono text-xs p-3 rounded-lg max-h-[200px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-muted-foreground">Sin actividad reciente</div>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLogs([])}
              className="ml-auto"
            >
              Limpiar Logs
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}