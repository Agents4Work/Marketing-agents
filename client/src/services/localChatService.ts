/**
 * Servicio de chat local (sin Firestore)
 * 
 * Esta es una implementación temporal que almacena las conversaciones en localStorage
 * mientras resolvemos el problema con Firestore.
 * 
 * NOTA: Esta implementación es solo para desarrollo y testing.
 * No utilizar en producción. No persiste entre sesiones diferentes de navegador.
 */

import { AgentType } from '@/lib/agents';
import { v4 as uuidv4 } from 'uuid';

// Tipos básicos
export interface LocalMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string; // ISO string
}

export interface LocalConversation {
  id: string;
  title: string;
  agentId: string;
  agentType: AgentType;
  userId: string;
  messages: LocalMessage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Clave para almacenamiento
const STORAGE_KEY = 'local_conversations';

// Helpers
function saveToStorage(conversations: LocalConversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function getFromStorage(): LocalConversation[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing stored conversations:', e);
    return [];
  }
}

/**
 * Crear una nueva conversación local
 */
export function createLocalConversation(
  agentId: string,
  userId: string,
  agentType: AgentType,
  firstMessage: string
): LocalConversation {
  // Generar título basado en el mensaje
  const title = firstMessage.length > 30 
    ? firstMessage.substring(0, 27) + '...' 
    : firstMessage;
  
  // Fecha actual en ISO
  const now = new Date().toISOString();
  
  // Crear nueva conversación
  const newConversation: LocalConversation = {
    id: uuidv4(),
    title,
    agentId,
    agentType,
    userId,
    messages: [
      {
        id: uuidv4(),
        role: 'user',
        content: firstMessage,
        timestamp: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };
  
  // Guardar en localStorage
  const conversations = getFromStorage();
  saveToStorage([newConversation, ...conversations]);
  
  return newConversation;
}

/**
 * Agregar mensaje a una conversación existente
 */
export function addLocalMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): LocalConversation | null {
  const conversations = getFromStorage();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) return null;
  
  // Crear nuevo mensaje
  const newMessage: LocalMessage = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString()
  };
  
  // Actualizar conversación
  const updatedConversation = {
    ...conversations[conversationIndex],
    messages: [...conversations[conversationIndex].messages, newMessage],
    updatedAt: new Date().toISOString()
  };
  
  // Actualizar almacenamiento
  conversations[conversationIndex] = updatedConversation;
  saveToStorage(conversations);
  
  return updatedConversation;
}

/**
 * Obtener una conversación por su ID
 */
export function getLocalConversation(conversationId: string): LocalConversation | null {
  const conversations = getFromStorage();
  return conversations.find(c => c.id === conversationId) || null;
}

/**
 * Obtener todas las conversaciones de un usuario
 */
export function getLocalConversationsByUser(userId: string): LocalConversation[] {
  const conversations = getFromStorage();
  return conversations.filter(c => c.userId === userId);
}

/**
 * Obtener conversaciones de un usuario con un agente específico
 */
export function getLocalConversationsByAgent(
  agentId: string,
  userId: string
): LocalConversation[] {
  const conversations = getFromStorage();
  return conversations.filter(c => c.agentId === agentId && c.userId === userId);
}

/**
 * Actualizar título de una conversación
 */
export function updateLocalConversationTitle(
  conversationId: string,
  newTitle: string
): LocalConversation | null {
  const conversations = getFromStorage();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) return null;
  
  // Actualizar conversación
  const updatedConversation = {
    ...conversations[conversationIndex],
    title: newTitle,
    updatedAt: new Date().toISOString()
  };
  
  // Actualizar almacenamiento
  conversations[conversationIndex] = updatedConversation;
  saveToStorage(conversations);
  
  return updatedConversation;
}

/**
 * Eliminar una conversación
 */
export function deleteLocalConversation(conversationId: string): boolean {
  const conversations = getFromStorage();
  const filteredConversations = conversations.filter(c => c.id !== conversationId);
  
  if (filteredConversations.length === conversations.length) {
    return false; // No se encontró la conversación
  }
  
  saveToStorage(filteredConversations);
  return true;
}

/**
 * Limpiar todas las conversaciones (solo para testing)
 */
export function clearAllLocalConversations(): void {
  saveToStorage([]);
}