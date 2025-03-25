import { AgentType } from "@/types/agents";

/**
 * Representa un mensaje en una conversación con un agente
 */
export interface AgentMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Representa una conversación completa con un agente
 */
export interface AgentConversation {
  id: string;
  title: string;
  agentId: string;
  agentType: AgentType;
  userId: string;
  messages: AgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parámetros para crear una nueva conversación
 */
export interface CreateConversationParams {
  title: string;
  agentId: string;
  agentType: AgentType;
  userId: string;
  initialMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Parámetros para agregar un mensaje a una conversación existente
 */
export interface AddMessageParams {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Respuesta simplificada para listas de conversaciones
 */
export interface ConversationListItem {
  id: string;
  title: string;
  agentType: AgentType;
  agentId: string;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    role: 'user' | 'assistant' | 'system';
  };
}