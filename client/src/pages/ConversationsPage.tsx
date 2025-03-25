/**
 * Página de historial de conversaciones
 * Muestra todas las conversaciones del usuario con los diferentes agentes
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ConversationHistory, { Conversation } from '@/components/ConversationHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, Bot } from 'lucide-react';

export default function ConversationsPage() {
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Seleccionar una conversación para redirigir a la página de detalle
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setLocation(`/conversation/${conversation.agentType}/${conversation.id}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Mis Conversaciones</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Historial de Conversaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversationHistory 
              onSelectConversation={handleSelectConversation}
              showSearch={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}