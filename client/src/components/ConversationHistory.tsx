/**
 * Componente de historial de conversaciones
 * Muestra todas las conversaciones de un usuario con diferentes agentes
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatChatDate, truncateMessage } from '@/utils/chatUtils';
import { AgentType } from '@/lib/agents';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, Search, Tag, Folder, Clock, ExternalLink, FileEdit, BarChart3, Mail, PenTool, Share2 } from 'lucide-react';
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Definición de tipos
export interface Conversation {
  id: string;
  title: string;
  agentId: string;
  agentType: AgentType;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
}

interface ConversationHistoryProps {
  onSelectConversation?: (conversation: Conversation) => void;
  limit?: number;
  showSearch?: boolean;
  selectedAgentType?: AgentType;
  className?: string;
}

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

export default function ConversationHistory({
  onSelectConversation,
  limit = 20,
  showSearch = true,
  selectedAgentType,
  className
}: ConversationHistoryProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgentType, setFilterAgentType] = useState<AgentType | "all">(
    selectedAgentType || "all"
  );
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones desde Firestore
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        setIsLoading(false);
        return; // No cargar nada si no hay usuario autenticado
      }

      try {
        setIsLoading(true);
        
        const allConversations: Conversation[] = [];
        const agentTypes: AgentType[] = [
          'seo', 'copywriting', 'ads', 'creative', 'email', 'analytics', 'social', 'strategy'
        ];
        
        // Para cada tipo de agente, buscar sus conversaciones
        for (const agentType of agentTypes) {
          // Buscar todos los documentos de agentes de este tipo
          const agentsCollectionRef = collection(db, 'agents');
          const agentsSnapshot = await getDocs(agentsCollectionRef);
          
          // Para cada agente, obtener sus chats
          for (const agentDoc of agentsSnapshot.docs) {
            const agentId = agentDoc.id;
            
            // Consultar chats del usuario para este agente
            const chatsCollectionRef = collection(db, 'agents', agentId, 'chats');
            const q = query(
              chatsCollectionRef,
              where('userId', '==', user.uid),
              orderBy('updatedAt', 'desc'),
              // Limitar resultados si es necesario
              limit ? where('_limit', '==', limit) : where('userId', '==', user.uid)
            );
            
            const chatsSnapshot = await getDocs(q);
            
            // Convertir los documentos a objetos de conversación
            for (const chatDoc of chatsSnapshot.docs) {
              const chatData = chatDoc.data();
              // Convertir los timestamps a fechas
              const conversation: Conversation = {
                id: chatDoc.id,
                agentId,
                agentType: agentType,
                userId: chatData.userId,
                title: chatData.title || 'Sin título',
                createdAt: chatData.createdAt instanceof Timestamp 
                  ? chatData.createdAt.toDate() 
                  : new Date(),
                updatedAt: chatData.updatedAt instanceof Timestamp 
                  ? chatData.updatedAt.toDate() 
                  : new Date(),
                messages: chatData.messages.map((msg: any) => ({
                  role: msg.role,
                  content: msg.content,
                  timestamp: msg.timestamp instanceof Timestamp 
                    ? msg.timestamp.toDate() 
                    : new Date()
                }))
              };
              
              allConversations.push(conversation);
            }
          }
        }
        
        // Ordenar todas las conversaciones por fecha de actualización
        const sortedConversations = allConversations.sort((a, b) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
        
        setConversations(sortedConversations);
        applyFilters(sortedConversations, searchQuery, filterAgentType);
        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
        setError("No se pudo cargar tu historial de conversaciones");
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user, limit]);

  // Aplicar filtros cuando cambia la búsqueda o el tipo de agente
  const applyFilters = (
    conversations: Conversation[], 
    query: string, 
    agentType: AgentType | "all"
  ) => {
    let filtered = [...conversations];
    
    // Filtrar por consulta de búsqueda
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(convo => 
        convo.title.toLowerCase().includes(searchLower) ||
        convo.messages.some(m => m.content.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por tipo de agente
    if (agentType !== "all") {
      filtered = filtered.filter(convo => convo.agentType === agentType);
    }
    
    setFilteredConversations(filtered);
  };

  // Actualizar filtros cuando cambian los criterios
  useEffect(() => {
    applyFilters(conversations, searchQuery, filterAgentType);
  }, [searchQuery, filterAgentType, conversations]);

  // Obtener el resumen de una conversación
  const getConversationSummary = (conversation: Conversation): string => {
    // Intentar encontrar el último mensaje del asistente
    const lastAssistantMessage = [...conversation.messages]
      .reverse()
      .find(m => m.role === 'assistant');
    
    if (lastAssistantMessage) {
      return truncateMessage(lastAssistantMessage.content);
    }
    
    // Si no hay mensaje de asistente, usar el último mensaje de usuario
    const lastUserMessage = [...conversation.messages]
      .reverse()
      .find(m => m.role === 'user');
    
    if (lastUserMessage) {
      return truncateMessage(lastUserMessage.content);
    }
    
    return "Sin contenido disponible";
  };

  // Renderizar estados de carga y error
  if (isLoading) {
    return (
      <div className={cn("flex flex-col space-y-4 animate-pulse", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("text-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800", className)}>
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Inicia sesión para ver tu historial</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Necesitas iniciar sesión para acceder a tus conversaciones
        </p>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className={cn("text-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800", className)}>
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No se encontraron conversaciones</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {searchQuery || filterAgentType !== "all"
            ? "Intenta cambiar tu búsqueda o filtros"
            : "Inicia una nueva conversación para verla aquí"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2 items-center">
        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar conversaciones..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        
        <Select
          value={filterAgentType}
          onValueChange={(value) => setFilterAgentType(value as AgentType | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los agentes</SelectItem>
            {Object.entries(agentTypeNames).map(([type, name]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center">
                  <Badge className={cn("mr-2 h-2 w-2", agentColors[type as AgentType])} />
                  <span>{name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3 pr-4">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
              onClick={() => onSelectConversation && onSelectConversation(conversation)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">{conversation.title}</CardTitle>
                  <Badge className={cn("text-xs", agentColors[conversation.agentType])}>
                    <div className="flex items-center gap-1">
                      {agentIcons[conversation.agentType]}
                      <span>{agentTypeNames[conversation.agentType]}</span>
                    </div>
                  </Badge>
                </div>
                <CardDescription className="text-sm line-clamp-2 mt-1">
                  {getConversationSummary(conversation)}
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="px-4 py-2 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatChatDate(conversation.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{conversation.messages.length} mensajes</span>
                  </div>
                  {onSelectConversation ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xs px-2 text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectConversation(conversation);
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>Abrir</span>
                    </Button>
                  ) : (
                    <Link 
                      href={`/conversation/${conversation.agentType}/${conversation.id}`} 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>Abrir</span>
                    </Link>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}