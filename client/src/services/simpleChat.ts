/**
 * Servicio de chat simplificado para almacenar conversaciones en Firestore
 * Usa un enfoque mínimo para garantizar compatibilidad
 */
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgentType } from '@/lib/agents';

// Estructura mínima para mensajes
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
}

// Estructura mínima para conversaciones
interface ChatConversation {
  id: string;
  title: string;
  userId: string;
  agentType: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crea una nueva conversación con estructura mínima
 */
export async function createSimpleConversation(
  userId: string,
  agentType: AgentType,
  firstMessage: string
): Promise<ChatConversation | null> {
  try {
    // Crear título basado en el mensaje
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 27) + '...' 
      : firstMessage;
    
    // Usar la colección 'chats' directamente (sin subcollecciones)
    const chatsRef = collection(db, 'chats');
    
    // Datos mínimos para Firestore
    const chatData = {
      title,
      userId,
      agentType,
      messages: [
        {
          role: 'user', 
          content: firstMessage,
          timestamp: Timestamp.now()
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Crear documento
    const docRef = await addDoc(chatsRef, chatData);
    
    // Crear objeto conversación para retornar
    return {
      id: docRef.id,
      title,
      userId,
      agentType,
      messages: [
        {
          role: 'user',
          content: firstMessage,
          timestamp: Timestamp.now()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating simple conversation:', error);
    return null;
  }
}

/**
 * Agrega un mensaje a una conversación existente
 */
export async function addSimpleMessage(
  conversationId: string, 
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<boolean> {
  try {
    const chatRef = doc(db, 'chats', conversationId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      console.error('Chat document not found');
      return false;
    }
    
    const data = chatSnap.data();
    const currentMessages = data.messages || [];
    
    // Nuevo mensaje con formato compatible con Firestore
    const newMessage = {
      role,
      content,
      timestamp: Timestamp.now()
    };
    
    // Actualizar documento
    await updateDoc(chatRef, {
      messages: [...currentMessages, newMessage],
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding simple message:', error);
    return false;
  }
}

/**
 * Obtiene una conversación por su ID
 */
export async function getSimpleConversation(conversationId: string): Promise<ChatConversation | null> {
  try {
    const chatRef = doc(db, 'chats', conversationId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      return null;
    }
    
    const data = chatSnap.data();
    
    return {
      id: chatSnap.id,
      title: data.title || 'Sin título',
      userId: data.userId,
      agentType: data.agentType,
      messages: data.messages || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error getting simple conversation:', error);
    return null;
  }
}

/**
 * Obtiene todas las conversaciones de un usuario
 */
export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: ChatConversation[] = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        title: data.title || 'Sin título',
        userId: data.userId,
        agentType: data.agentType,
        messages: data.messages || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
}