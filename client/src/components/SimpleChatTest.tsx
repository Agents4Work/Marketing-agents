/**
 * Componente simple para probar las conversaciones con Firestore
 * Este componente usa nuestro servicio simplificado para evitar problemas de compatibilidad
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  createSimpleConversation, 
  addSimpleMessage, 
  getSimpleConversation, 
  getUserConversations 
} from '@/services/simpleChat';
import { AgentType } from '@/lib/agents';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
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

export default function SimpleChatTest() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [agentType, setAgentType] = useState<AgentType>('copywriting');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

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
      addLog('Cargando conversaciones...');
      
      const userConversations = await getUserConversations(user.uid);
      
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
      addLog('Creando nueva conversación...');
      
      const newConversation = await createSimpleConversation(
        user.uid,
        agentType,
        message
      );
      
      if (!newConversation) {
        throw new Error('No se pudo crear la conversación');
      }
      
      setConversationId(newConversation.id);
      setCurrentConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
      
      // Simular respuesta del asistente
      await simulateResponse(newConversation.id);
      
      setMessage('');
      setStatus('success');
      addLog(`Conversación creada con ID: ${newConversation.id}`);
      
      // Actualizar la conversación con la respuesta
      const updatedConversation = await getSimpleConversation(newConversation.id);
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
      }
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
      
      const success = await addSimpleMessage(
        conversationId,
        'user',
        message
      );
      
      if (!success) {
        throw new Error('No se pudo agregar el mensaje');
      }
      
      // Simular respuesta del asistente
      await simulateResponse(conversationId);
      
      // Actualizar la conversación con los nuevos mensajes
      const updatedConversation = await getSimpleConversation(conversationId);
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
        
        // Actualizar la lista de conversaciones
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? updatedConversation : conv
          )
        );
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
  const simulateResponse = async (convId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Esperar un momento
    
    addLog('Generando respuesta del asistente...');
    
    const responses = [
      "¡Gracias por tu mensaje! Estoy aquí para ayudarte con tu estrategia de marketing.",
      "Interesante planteamiento. Podemos expandir esta idea para tu campaña.",
      "He analizado tu mensaje y tengo varias sugerencias para optimizar tu enfoque.",
      "Basado en tu objetivo, te recomendaría enfocarte en estos puntos clave...",
      "¡Excelente! Trabajemos en esta dirección para maximizar el impacto de tu marketing."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const success = await addSimpleMessage(
      convId,
      'assistant',
      randomResponse
    );
    
    if (success) {
      addLog('Respuesta del asistente agregada correctamente');
    } else {
      addLog('Error al agregar respuesta del asistente');
    }
  };

  // Seleccionar una conversación
  const selectConversation = async (convId: string) => {
    try {
      setStatus('loading');
      addLog(`Seleccionando conversación ${convId}...`);
      
      const conversation = await getSimpleConversation(convId);
      
      if (!conversation) {
        throw new Error('No se pudo cargar la conversación');
      }
      
      setCurrentConversation(conversation);
      setConversationId(convId);
      
      setStatus('success');
      addLog(`Conversación seleccionada: ${conversation.title}`);
    } catch (err) {
      console.error('Error selecting conversation:', err);
      setError('Error al seleccionar conversación');
      setStatus('error');
      addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
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
    
    return (
      <div 
        key={index} 
        className={`my-2 p-3 rounded-lg ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-12' 
            : 'bg-muted text-muted-foreground mr-12'
        }`}
      >
        <div className="text-sm">{msg.content}</div>
        <div className="text-xs opacity-70 text-right mt-1">
          {msg.timestamp?.toDate 
            ? msg.timestamp.toDate().toLocaleTimeString() 
            : 'tiempo desconocido'}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Prueba de Chat Simple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div>
            <p className="text-sm font-medium mb-2">Conversaciones:</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setConversationId(null)}
              >
                + Nueva conversación
              </Button>
              
              {conversations.map(conv => (
                <Button
                  key={conv.id}
                  variant={conversationId === conv.id ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start truncate"
                  onClick={() => selectConversation(conv.id)}
                >
                  {conv.title}
                </Button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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