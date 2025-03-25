import React, { useState, useEffect } from 'react';
import { AgentType } from '@/types/agents';
import PersistentWorkflowChat from './PersistentWorkflowChat';
import { isFirestoreAvailable } from '@/firebase/firestore';
import { Loader2Icon } from 'lucide-react';

// Componente para fallback cuando Firebase no está disponible
const FirebaseUnavailableMessage = () => (
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

interface PersistentWorkflowChatAdapterProps {
  agentId: string;
  agentType: AgentType;
  agentName: string;
  agentDescription?: string;
  onResponseGenerated?: (response: string) => void;
}

/**
 * Adaptador que verifica disponibilidad de Firestore y muestra el componente adecuado
 */
const PersistentWorkflowChatAdapter: React.FC<PersistentWorkflowChatAdapterProps> = ({
  agentId,
  agentType,
  agentName,
  agentDescription,
  onResponseGenerated
}) => {
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState<boolean | null>(null);
  
  // Verificar disponibilidad de Firebase al cargar
  useEffect(() => {
    const checkFirebaseAvailability = async () => {
      try {
        const available = await isFirestoreAvailable();
        setIsFirebaseAvailable(available);
        console.log('Firebase disponible:', available);
      } catch (error) {
        console.error('Error al verificar Firebase:', error);
        setIsFirebaseAvailable(false);
      }
    };
    
    checkFirebaseAvailability();
  }, []);
  
  // Mientras verificamos, mostrar cargando
  if (isFirebaseAvailable === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500">Verificando disponibilidad de Firebase...</p>
        </div>
      </div>
    );
  }
  
  // Si Firebase no está disponible, mostrar mensaje
  if (!isFirebaseAvailable) {
    return <FirebaseUnavailableMessage />;
  }
  
  // Si Firebase está disponible, mostrar chat persistente
  return (
    <PersistentWorkflowChat
      agentId={agentId}
      agentType={agentType}
      agentName={agentName}
      agentDescription={agentDescription}
      onResponseGenerated={onResponseGenerated}
    />
  );
};

export default PersistentWorkflowChatAdapter;