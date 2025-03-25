import { db } from '@/firebase/index';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { 
  AgentConversation, 
  AgentMessage, 
  AddMessageParams, 
  CreateConversationParams,
  ConversationListItem
} from '@/types/conversations';
import { generateRandomId } from '@/lib/utils';

/**
 * Función para convertir Timestamp de Firestore a Date
 */
const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

/**
 * Función para sanitizar un objeto para Firestore
 * Convierte Date a Timestamp y elimina propiedades no válidas
 */
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return Timestamp.fromDate(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Omitir propiedades indefinidas, funciones, y símbolos
      if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        continue;
      }
      sanitized[key] = sanitizeForFirestore(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Función para convertir un documento de Firestore a AgentConversation
 */
const convertToConversation = (docData: DocumentData, docId: string): AgentConversation => {
  const messages: AgentMessage[] = docData.messages?.map((msg: any) => ({
    id: msg.id || generateRandomId(),
    role: msg.role,
    content: msg.content,
    timestamp: timestampToDate(msg.timestamp)
  })) || [];

  return {
    id: docId,
    title: docData.title || 'Nueva conversación',
    agentId: docData.agentId,
    agentType: docData.agentType,
    userId: docData.userId,
    messages,
    createdAt: timestampToDate(docData.createdAt),
    updatedAt: timestampToDate(docData.updatedAt)
  };
};

// Paths para colecciones
const conversationsPath = (userId: string) => `users/${userId}/conversations`;

/**
 * Clase que maneja las operaciones de chat con Firestore
 */
export class ChatService {
  /**
   * Obtiene todas las conversaciones para un usuario
   */
  async getConversations(userId: string): Promise<ConversationListItem[]> {
    try {
      const userConversationsRef = collection(db, conversationsPath(userId));
      const q = query(userConversationsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const messages = data.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
        
        return {
          id: doc.id,
          title: data.title || 'Nueva conversación',
          agentType: data.agentType,
          agentId: data.agentId,
          updatedAt: timestampToDate(data.updatedAt),
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            role: lastMessage.role
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene conversaciones filtradas por tipo de agente
   */
  async getConversationsByAgentType(userId: string, agentType: string): Promise<ConversationListItem[]> {
    try {
      const userConversationsRef = collection(db, conversationsPath(userId));
      const q = query(
        userConversationsRef, 
        where('agentType', '==', agentType),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const messages = data.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
        
        return {
          id: doc.id,
          title: data.title || 'Nueva conversación',
          agentType: data.agentType,
          agentId: data.agentId,
          updatedAt: timestampToDate(data.updatedAt),
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            role: lastMessage.role
          } : undefined
        };
      });
    } catch (error) {
      console.error('Error al obtener conversaciones por tipo de agente:', error);
      throw error;
    }
  }

  /**
   * Obtiene una conversación específica por ID
   */
  async getConversation(userId: string, conversationId: string): Promise<AgentConversation | null> {
    try {
      const conversationRef = doc(db, conversationsPath(userId), conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        return null;
      }
      
      return convertToConversation(conversationDoc.data(), conversationDoc.id);
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva conversación
   */
  async createConversation(params: CreateConversationParams): Promise<AgentConversation> {
    try {
      const { title, agentId, agentType, userId, initialMessage } = params;
      const now = new Date();
      
      const messages: AgentMessage[] = [];
      
      // Agregar mensaje inicial si existe
      if (initialMessage) {
        messages.push({
          id: generateRandomId(),
          role: 'user',
          content: initialMessage,
          timestamp: now
        });
      }
      
      // Preparar datos para Firestore
      const conversationData = sanitizeForFirestore({
        title: title || 'Nueva conversación',
        agentId,
        agentType,
        userId,
        messages,
        createdAt: now,
        updatedAt: now
      });
      
      // Crear documento en Firestore
      const userConversationsRef = collection(db, conversationsPath(userId));
      const docRef = await addDoc(userConversationsRef, conversationData);
      
      return {
        id: docRef.id,
        title: title || 'Nueva conversación',
        agentId,
        agentType,
        userId,
        messages,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error al crear conversación:', error);
      throw error;
    }
  }

  /**
   * Genera un título para la conversación basado en el primer mensaje
   */
  async generateTitleFromMessage(userId: string, conversationId: string, message: string): Promise<string> {
    try {
      // Extraer el título del mensaje (primeras 30 palabras o hasta el primer punto)
      let title = message.split(' ').slice(0, 5).join(' ');
      
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Actualizar el título en Firestore
      const conversationRef = doc(db, conversationsPath(userId), conversationId);
      await updateDoc(conversationRef, { title });
      
      return title;
    } catch (error) {
      console.error('Error al generar título:', error);
      return 'Nueva conversación';
    }
  }

  /**
   * Agrega un mensaje a una conversación existente
   */
  async addMessage(userId: string, params: AddMessageParams): Promise<AgentMessage> {
    try {
      const { conversationId, role, content } = params;
      const now = new Date();
      
      // Obtener conversación actual
      const conversationRef = doc(db, conversationsPath(userId), conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error(`Conversación no encontrada: ${conversationId}`);
      }
      
      // Crear nuevo mensaje
      const newMessage: AgentMessage = {
        id: generateRandomId(),
        role,
        content,
        timestamp: now
      };
      
      // Obtener mensajes existentes
      const conversationData = conversationDoc.data();
      const existingMessages = conversationData.messages || [];
      
      // Determinar si necesitamos generar un título
      const needsTitle = existingMessages.length === 0 && role === 'user';
      
      // Actualizar la conversación
      const updatedMessages = [...existingMessages, sanitizeForFirestore(newMessage)];
      
      await updateDoc(conversationRef, { 
        messages: updatedMessages,
        updatedAt: serverTimestamp()
      });
      
      // Generar título si es necesario
      if (needsTitle) {
        await this.generateTitleFromMessage(userId, conversationId, content);
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error al agregar mensaje:', error);
      throw error;
    }
  }

  /**
   * Verifica si el servicio de Firestore está disponible
   */
  async isFirestoreAvailable(): Promise<boolean> {
    try {
      // Intenta acceder a una colección de prueba
      const testCollection = collection(db, '_firestore_test');
      const q = query(testCollection, orderBy('timestamp', 'desc'));
      await getDocs(q);
      return true;
    } catch (error) {
      console.error('Error al acceder a Firestore:', error);
      return false;
    }
  }
}

// Instancia por defecto para uso en la aplicación
export const chatService = new ChatService();