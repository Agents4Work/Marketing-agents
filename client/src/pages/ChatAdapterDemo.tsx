import React, { useState } from 'react';
import { Link } from 'wouter';
import PersistentWorkflowChatAdapter from '@/components/workflow/PersistentWorkflowChatAdapter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentType } from '@/types/agents';
import { getAgentTypeName } from '@/lib/utils';
import { isAuthenticated, getCurrentUser } from '@/firebase/auth-utils';

const agents = [
  {
    id: 'seo-expert',
    name: 'SEO Expert',
    type: 'seo' as AgentType,
    description: 'Optimiza tu contenido para motores de búsqueda',
    capabilities: ['Análisis de keywords', 'Optimización on-page', 'Estrategia de backlinks']
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    type: 'copywriting' as AgentType,
    description: 'Crea textos persuasivos para tu marca',
    capabilities: ['Headlines impactantes', 'Storytelling', 'Copywriting para ventas']
  },
  {
    id: 'ads-specialist',
    name: 'Ads Specialist',
    type: 'ads' as AgentType,
    description: 'Optimiza tus campañas publicitarias',
    capabilities: ['Segmentación de audiencia', 'Optimización de CPC', 'A/B testing']
  },
  {
    id: 'creative-director',
    name: 'Creative Director',
    type: 'creative' as AgentType,
    description: 'Desarrolla conceptos creativos para tu marca',
    capabilities: ['Dirección de arte', 'Branding', 'Conceptos creativos']
  },
  {
    id: 'email-marketer',
    name: 'Email Marketer',
    type: 'email' as AgentType,
    description: 'Diseña estrategias efectivas de email marketing',
    capabilities: ['Secuencias de nutrición', 'Optimización de conversión', 'Automatizaciones']
  },
  {
    id: 'analytics-expert',
    name: 'Analytics Expert',
    type: 'analytics' as AgentType,
    description: 'Analiza datos para optimizar tu marketing',
    capabilities: ['Análisis de KPIs', 'Atribución', 'Optimización de embudo']
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    type: 'social' as AgentType,
    description: 'Gestiona tus redes sociales estratégicamente',
    capabilities: ['Calendario editorial', 'Tendencias', 'Engagement']
  }
];

const ChatAdapterDemo: React.FC = () => {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('copywriting');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  
  const selectedAgent = agents.find(agent => agent.type === selectedAgentType) || agents[0];
  
  const handleAgentSelect = (value: string) => {
    setSelectedAgentType(value as AgentType);
  };
  
  const handleResponseGenerated = (response: string) => {
    setLastResponse(response);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/" className="text-blue-500 hover:underline mb-2 inline-block">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-bold mb-2">Chat con Agentes IA</h1>
        <p className="text-gray-600 mb-6">
          Esta demo muestra el componente PersistentWorkflowChatAdapter que detecta automáticamente
          si Firestore está disponible y elige la implementación adecuada.
        </p>
        
        {!isAuthenticated() && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">No has iniciado sesión</p>
            <p>Para usar el chat persistente con Firestore, necesitas iniciar sesión primero.</p>
            <Button className="mt-2">Iniciar sesión</Button>
          </div>
        )}
        
        {isAuthenticated() && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Has iniciado sesión como {getCurrentUser()?.displayName || getCurrentUser()?.email}</p>
            <p>ID del usuario: {getCurrentUser()?.uid}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona un Agente</CardTitle>
              <CardDescription>Cada agente tiene habilidades diferentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedAgentType} onValueChange={handleAgentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.type}>
                        {getAgentTypeName(agent.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Capacidades:</h4>
                  <ul className="text-sm space-y-1">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2 text-green-500">✓</span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {lastResponse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Última respuesta</CardTitle>
                <CardDescription>Para uso en workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  {lastResponse}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-2 h-[600px]">
          <Tabs defaultValue="chat">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat en vivo</TabsTrigger>
              <TabsTrigger value="info">Información</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="h-[540px]">
              <PersistentWorkflowChatAdapter
                agentId={selectedAgent.id}
                agentType={selectedAgent.type}
                agentName={selectedAgent.name}
                agentDescription={selectedAgent.description}
                onResponseGenerated={handleResponseGenerated}
              />
            </TabsContent>
            
            <TabsContent value="info">
              <Card className="h-[540px] overflow-auto">
                <CardHeader>
                  <CardTitle>Sobre la persistencia de conversaciones</CardTitle>
                  <CardDescription>
                    Implementación híbrida para almacenamiento de conversaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Arquitectura</h3>
                    <p>
                      La implementación utiliza un enfoque híbrido que permite almacenar conversaciones
                      tanto en Firestore como en localStorage, dependiendo de la disponibilidad del servicio.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Componentes</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>PersistentWorkflowChatAdapter:</strong> Componente principal que detecta
                        la disponibilidad de Firestore y elige la implementación adecuada.
                      </li>
                      <li>
                        <strong>PersistentWorkflowChat:</strong> Implementación basada en Firestore para
                        persistencia de conversaciones.
                      </li>
                      <li>
                        <strong>LocalWorkflowChat:</strong> Implementación alternativa que utiliza localStorage
                        cuando Firestore no está disponible.
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Estructura en Firestore</h3>
                    <p>Las conversaciones se almacenan con la siguiente estructura:</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm mt-2">
                      users/{'{userId}'}/conversations/{'{conversationId}'}
                    </pre>
                    <p className="mt-2">
                      Cada documento de conversación contiene metadatos como título,
                      tipo de agente, y un array de mensajes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChatAdapterDemo;