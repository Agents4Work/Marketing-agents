import React, { useState, useEffect } from 'react';
import { AgentType } from '@/types/agents';
import PersistentAgentChat from './PersistentAgentChat';
import LocalAgentChat from './LocalAgentChat'; // Implementaremos esto después si es necesario
import { agentChatService } from '@/services/agentChatService';
import { Loader2Icon } from 'lucide-react';

interface PersistentAgentChatAdapterProps {
  agentId: string;
  agentType: AgentType;
  agentName: string;
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
  className?: string;
}

export default function PersistentAgentChatAdapter({
  agentId,
  agentType,
  agentName,
  conversationId,
  onConversationCreated,
  className
}: PersistentAgentChatAdapterProps) {
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState<boolean | null>(null);
  
  // Comprobar si Firestore está disponible
  useEffect(() => {
    const checkFirestore = async () => {
      try {
        const available = await agentChatService.isFirestoreAvailable();
        setIsFirestoreAvailable(available);
        console.log('Firestore disponible:', available);
      } catch (error) {
        console.error('Error comprobando Firestore:', error);
        setIsFirestoreAvailable(false);
      }
    };
    
    checkFirestore();
  }, []);
  
  // Mientras comprobamos Firestore, mostrar un indicador de carga
  if (isFirestoreAvailable === null) {
    return (
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2Icon className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-500">Verificando conexión...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Si Firestore está disponible, usar PersistentAgentChat
  if (isFirestoreAvailable) {
    return (
      <PersistentAgentChat
        agentId={agentId}
        agentType={agentType}
        agentName={agentName}
        conversationId={conversationId}
        onConversationCreated={onConversationCreated}
        className={className}
      />
    );
  }
  
  // Si Firestore no está disponible y tenemos implementado un chat local, usarlo
  // (Esta parte la implementaremos después si es necesario)
  /*
  return (
    <LocalAgentChat
      agentId={agentId}
      agentType={agentType}
      agentName={agentName}
      conversationId={conversationId}
      onConversationCreated={onConversationCreated}
      className={className}
    />
  );
  */
  
  // Mensaje de fallback cuando Firestore no está disponible
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-lg mb-2">Firebase no está disponible</h3>
            <p>No pudimos conectar con Firebase para almacenar tus conversaciones.</p>
            <p className="mt-2">Posibles causas:</p>
            <ul className="list-disc list-inside mt-1 text-left">
              <li>No has iniciado sesión</li>
              <li>Configuración de Firebase incompleta</li>
              <li>Problemas de conectividad</li>
            </ul>
          </div>
          <p className="text-gray-500">
            Por favor inicia sesión o verifica la configuración para usar el chat persistente.
          </p>
        </div>
      </div>
    </div>
  );
}