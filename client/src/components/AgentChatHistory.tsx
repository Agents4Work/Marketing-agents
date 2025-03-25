/**
 * Componente para mostrar el historial de conversaciones de un agente específico
 * Este componente se utilizará dentro de la interfaz de chat de cada agente
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { agentChatService } from '@/services/agentChatService';
import { AgentConversation, ConversationListItem } from '@/types/conversations';
import { AgentType } from '@/types/agents';
import { formatRelativeDate, truncateText } from '@/lib/utils';
import { MessageSquare, Clock, Search, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

// Función auxiliar para convertir timestamps de Firestore a objetos Date
const timestampToDate = (timestamp: Timestamp | Date | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

interface AgentChatHistoryProps {
  agentId: string;
  agentType: AgentType;
  className?: string;
  onSelectConversation: (conversationId: string) => void;
  activeChatId?: string;
}

export default function AgentChatHistory({
  agentId,
  agentType,
  className,
  onSelectConversation,
  activeChatId
}: AgentChatHistoryProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Comprobar si Firestore está disponible
  useEffect(() => {
    const checkFirestore = async () => {
      try {
        const available = await agentChatService.isFirestoreAvailable();
        setIsFirestoreAvailable(available);
      } catch (error) {
        console.error('Error comprobando Firestore:', error);
        setIsFirestoreAvailable(false);
      }
    };
    
    checkFirestore();
  }, []);

  // Cargar conversaciones cuando se monte el componente y cuando cambie el usuario
  useEffect(() => {
    const loadConversations = async () => {
      if (!user || !isFirestoreAvailable) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener todas las conversaciones para este agente específico
        const agentsRef = collection(db, 'agents');
        const chatsRef = collection(db, `agents/${agentId}/chats`);
        const q = query(
          chatsRef, 
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
        
        const chatsSnapshot = await getDocs(q);
        
        const loadedConversations: ConversationListItem[] = [];
        
        for (const chatDoc of chatsSnapshot.docs) {
          const data = chatDoc.data();
          const messages = data.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          
          loadedConversations.push({
            id: chatDoc.id,
            title: data.title || 'Nueva conversación',
            agentType: data.agentType || agentType,
            agentId: agentId,
            updatedAt: timestampToDate(data.updatedAt),
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              role: lastMessage.role
            } : undefined
          });
        }
        
        setConversations(loadedConversations);
        applySearchFilter(loadedConversations, searchQuery);
        
      } catch (err) {
        console.error('Error cargando conversaciones:', err);
        setError('No se pudo cargar el historial de conversaciones');
      } finally {
        setIsLoading(false);
      }
    };

    if (isFirestoreAvailable !== null) {
      loadConversations();
    }
  }, [user, agentId, agentType, isFirestoreAvailable]);

  // Aplicar filtro de búsqueda
  const applySearchFilter = (allConversations: ConversationListItem[], query: string) => {
    if (!query.trim()) {
      setFilteredConversations(allConversations);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allConversations.filter(
      conv => conv.title.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredConversations(filtered);
  };

  // Actualizar filtro cuando cambia la consulta de búsqueda
  useEffect(() => {
    applySearchFilter(conversations, searchQuery);
  }, [searchQuery, conversations]);

  // Si estamos comprobando Firestore
  if (isFirestoreAvailable === null) {
    return (
      <div className={cn("flex flex-col space-y-4", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Si Firestore no está disponible
  if (!isFirestoreAvailable) {
    return (
      <div className={cn("p-4 rounded-lg border bg-yellow-50 text-yellow-800", className)}>
        <p className="text-center">
          Firebase no está disponible. No es posible cargar el historial de conversaciones.
        </p>
      </div>
    );
  }

  // Si está cargando
  if (isLoading) {
    return (
      <div className={cn("flex flex-col space-y-4 animate-pulse", className)}>
        <div className="flex justify-between">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-24"></div>
        ))}
      </div>
    );
  }

  // Si hay un error
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

  // Si no hay conversaciones
  if (filteredConversations.length === 0) {
    return (
      <div className={cn("p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border", className)}>
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">
          {searchQuery ? 'No se encontraron resultados' : 'No hay conversaciones'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {searchQuery 
            ? 'Intenta con otros términos de búsqueda' 
            : 'Inicia una conversación para que aparezca aquí'}
        </p>
      </div>
    );
  }

  // Renderizar lista de conversaciones
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar conversaciones..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3 pr-4">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                activeChatId === conversation.id 
                  ? "border-primary bg-primary/5" 
                  : "border border-gray-200 dark:border-gray-700"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-medium">{conversation.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {conversation.lastMessage?.content ? (
                    truncateText(conversation.lastMessage.content, 100)
                  ) : (
                    "Sin mensajes"
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="p-4 pt-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatRelativeDate(conversation.updatedAt)}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}