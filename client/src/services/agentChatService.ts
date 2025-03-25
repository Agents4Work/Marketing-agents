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
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { 
  AgentConversation, 
  AgentMessage, 
  AddMessageParams, 
  CreateConversationParams,
  ConversationListItem
} from '@/types/conversations';
import { AgentType } from '@/types/agents';
import { generateRandomId } from '@/lib/utils';
import { 
  sanitizeForFirestore, 
  timestampToDate, 
  isPermissionError, 
  getFirebaseErrorMessage 
} from '@/firebase/firestore';

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

/**
 * Clase que maneja las operaciones de chat con Firestore
 * usando la estructura jerarquica: agents/{agentId}/chats/{chatId}
 */
export class AgentChatService {
  /**
   * Obtiene todas las conversaciones para un usuario
   */
  async getConversations(userId: string): Promise<ConversationListItem[]> {
    try {
      const allConversations: ConversationListItem[] = [];
      const agentsRef = collection(db, 'agents');
      const agentsSnapshot = await getDocs(agentsRef);
      
      // Para cada agente, obtener sus chats
      for (const agentDoc of agentsSnapshot.docs) {
        const agentId = agentDoc.id;
        const chatsRef = collection(db, `agents/${agentId}/chats`);
        const q = query(
          chatsRef, 
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        
        const chatsSnapshot = await getDocs(q);
        
        for (const chatDoc of chatsSnapshot.docs) {
          const data = chatDoc.data();
          const messages = data.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          
          allConversations.push({
            id: chatDoc.id,
            title: data.title || 'Nueva conversación',
            agentType: data.agentType,
            agentId: agentId,
            updatedAt: timestampToDate(data.updatedAt),
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              role: lastMessage.role
            } : undefined
          });
        }
      }
      
      // Ordenar todas las conversaciones por fecha de actualización
      return allConversations.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene conversaciones filtradas por tipo de agente
   */
  async getConversationsByAgentType(userId: string, agentType: AgentType): Promise<ConversationListItem[]> {
    try {
      const allConversations: ConversationListItem[] = [];
      const agentsRef = collection(db, 'agents');
      const agentsSnapshot = await getDocs(agentsRef);
      
      // Para cada agente del tipo especificado, obtener sus chats
      for (const agentDoc of agentsSnapshot.docs) {
        const agentData = agentDoc.data();
        
        // Solo procesar agentes del tipo solicitado
        if (agentData.type !== agentType) continue;
        
        const agentId = agentDoc.id;
        const chatsRef = collection(db, `agents/${agentId}/chats`);
        const q = query(
          chatsRef, 
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        
        const chatsSnapshot = await getDocs(q);
        
        for (const chatDoc of chatsSnapshot.docs) {
          const data = chatDoc.data();
          const messages = data.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          
          allConversations.push({
            id: chatDoc.id,
            title: data.title || 'Nueva conversación',
            agentType: agentType,
            agentId: agentId,
            updatedAt: timestampToDate(data.updatedAt),
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              role: lastMessage.role
            } : undefined
          });
        }
      }
      
      // Ordenar todas las conversaciones por fecha de actualización
      return allConversations.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      console.error('Error al obtener conversaciones por tipo de agente:', error);
      throw error;
    }
  }

  /**
   * Obtiene una conversación específica por ID
   */
  async getConversation(userId: string, agentId: string, conversationId: string): Promise<AgentConversation | null> {
    try {
      const conversationRef = doc(db, `agents/${agentId}/chats`, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        return null;
      }
      
      const data = conversationDoc.data();
      
      // Verificar que la conversación pertenece al usuario
      if (data.userId !== userId) {
        console.warn('Intento de acceso a conversación de otro usuario');
        return null;
      }
      
      return convertToConversation(data, conversationDoc.id);
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  }
  
  /**
   * Sobrecarga para obtener una conversación por ID cuando no conocemos el agentId
   */
  async findConversationById(userId: string, conversationId: string): Promise<AgentConversation | null> {
    try {
      const agentsRef = collection(db, 'agents');
      const agentsSnapshot = await getDocs(agentsRef);
      
      // Buscar en todos los agentes
      for (const agentDoc of agentsSnapshot.docs) {
        const agentId = agentDoc.id;
        const conversationRef = doc(db, `agents/${agentId}/chats`, conversationId);
        const conversationDoc = await getDoc(conversationRef);
        
        if (conversationDoc.exists()) {
          const data = conversationDoc.data();
          
          // Verificar que la conversación pertenece al usuario
          if (data.userId !== userId) {
            continue;
          }
          
          return convertToConversation(data, conversationDoc.id);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error al buscar conversación por ID:', error);
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
        agentType,
        userId,
        messages,
        createdAt: now,
        updatedAt: now
      });
      
      // Crear documento en Firestore
      const chatsRef = collection(db, `agents/${agentId}/chats`);
      const docRef = await addDoc(chatsRef, conversationData);
      
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
  async generateTitleFromMessage(userId: string, agentId: string, conversationId: string, message: string): Promise<string> {
    try {
      // Extraer el título del mensaje (primeras 5 palabras)
      let title = message.split(' ').slice(0, 5).join(' ');
      
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Actualizar el título en Firestore
      const conversationRef = doc(db, `agents/${agentId}/chats`, conversationId);
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
  async addMessage(userId: string, agentId: string, params: AddMessageParams): Promise<AgentMessage> {
    try {
      const { conversationId, role, content } = params;
      const now = new Date();
      
      // Obtener conversación actual
      const conversationRef = doc(db, `agents/${agentId}/chats`, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error(`Conversación no encontrada: ${conversationId}`);
      }
      
      // Verificar que la conversación pertenece al usuario
      const conversationData = conversationDoc.data();
      if (conversationData.userId !== userId) {
        throw new Error('No tienes permisos para modificar esta conversación');
      }
      
      // Crear nuevo mensaje
      const newMessage: AgentMessage = {
        id: generateRandomId(),
        role,
        content,
        timestamp: now
      };
      
      // Obtener mensajes existentes
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
        await this.generateTitleFromMessage(userId, agentId, conversationId, content);
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error al agregar mensaje:', error);
      throw error;
    }
  }
  
  /**
   * Sobrecarga para agregar un mensaje cuando no conocemos el agentId
   */
  async addMessageToConversation(userId: string, params: AddMessageParams): Promise<AgentMessage | null> {
    try {
      const { conversationId, role, content } = params;
      
      // Primero, buscar la conversación en todos los agentes
      const conversation = await this.findConversationById(userId, conversationId);
      
      if (!conversation) {
        throw new Error(`Conversación no encontrada: ${conversationId}`);
      }
      
      // Usando el agentId de la conversación encontrada
      return this.addMessage(userId, conversation.agentId, params);
    } catch (error) {
      console.error('Error al agregar mensaje a conversación:', error);
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
      const q = query(testCollection, limit(1));
      await getDocs(q);
      console.log('Firestore está disponible! ✅');
      return true;
    } catch (error) {
      console.error('Error al acceder a Firestore:', error);
      // Si el error es de permisos, es posible que Firestore esté disponible 
      // pero el usuario no tenga permisos para esta colección específica
      if (isPermissionError(error)) {
        console.warn('Firestore está disponible pero el usuario no tiene permisos');
        return false;
      }
      return false;
    }
  }

  /**
   * Guarda una conversación en localStorage como respaldo
   */
  private saveConversationToLocalStorage(conversation: AgentConversation): void {
    try {
      // Crea una estructura para almacenar conversaciones por usuario y agente
      const storageKey = `local_conversations_${conversation.userId}`;
      let userConversations = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // Organiza por agentId
      if (!userConversations[conversation.agentId]) {
        userConversations[conversation.agentId] = {};
      }
      
      // Almacena la conversación
      userConversations[conversation.agentId][conversation.id] = conversation;
      
      localStorage.setItem(storageKey, JSON.stringify(userConversations));
    } catch (error) {
      console.error('Error al guardar conversación en localStorage:', error);
    }
  }

  /**
   * Obtiene conversaciones de localStorage como respaldo
   */
  private getConversationsFromLocalStorage(userId: string): ConversationListItem[] {
    try {
      const storageKey = `local_conversations_${userId}`;
      const userConversations = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      const conversations: ConversationListItem[] = [];
      
      // Recorrer todos los agentes
      Object.entries(userConversations).forEach(([agentId, agentConversations]: [string, any]) => {
        // Recorrer las conversaciones de cada agente
        Object.entries(agentConversations).forEach(([conversationId, conversation]: [string, any]) => {
          const messages = conversation.messages || [];
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
          
          conversations.push({
            id: conversationId,
            title: conversation.title || 'Nueva conversación',
            agentType: conversation.agentType,
            agentId: agentId,
            updatedAt: new Date(conversation.updatedAt),
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              role: lastMessage.role
            } : undefined
          });
        });
      });
      
      // Ordenar por fecha de actualización
      return conversations.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      console.error('Error al recuperar conversaciones de localStorage:', error);
      return [];
    }
  }

  /**
   * Crea una nueva conversación con retry y fallback a localStorage
   * Incluye manejo específico para el error "invalid-argument"
   */
  async createConversationWithFallback(params: CreateConversationParams, maxRetries = 3): Promise<AgentConversation> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`Intento de crear conversación ${attempt}/${maxRetries}...`);
        
        // Verificar si los datos tienen algún problema
        if (attempt > 1) {
          // En intentos posteriores, aplicar sanitización adicional
          console.log('Aplicando sanitización adicional a los datos...');
          params = this.sanitizeConversationParams(params);
        }
        
        const conversation = await this.createConversation(params);
        
        // Si llegamos aquí, la operación fue exitosa
        console.log('Conversación creada correctamente en Firestore');
        
        // Guardar un respaldo en localStorage
        this.saveConversationToLocalStorage(conversation);
        
        return conversation;
      } catch (error: any) {
        console.error(`Error al crear conversación (intento ${attempt}/${maxRetries}):`, error);
        
        // Si es error "invalid-argument", intentar corregir específicamente
        if (error instanceof FirebaseError && error.code === 'invalid-argument') {
          console.warn('Error de argumento inválido detectado, aplicando correcciones específicas...');
          
          // Si estamos en el último intento, ir directamente a localStorage
          if (attempt >= maxRetries) {
            console.warn('Agotados los intentos con Firestore, utilizando localStorage');
            break;
          }
          
          // Esperar un poco antes del siguiente intento (backoff exponencial)
          const delayMs = Math.pow(2, attempt) * 500;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        if (attempt >= maxRetries) {
          console.warn('Agotados los intentos con Firestore, utilizando localStorage');
          
          // Crear conversación localmente
          const now = new Date();
          const localId = `local_${generateRandomId()}`;
          const { title, agentId, agentType, userId, initialMessage } = params;
          
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
          
          const localConversation: AgentConversation = {
            id: localId,
            title: title || 'Nueva conversación',
            agentId,
            agentType,
            userId,
            messages,
            createdAt: now,
            updatedAt: now
          };
          
          // Guardar en localStorage
          this.saveConversationToLocalStorage(localConversation);
          
          return localConversation;
        }
        
        // Esperar antes del siguiente intento (backoff exponencial)
        const backoffMs = Math.min(1000 * (2 ** (attempt - 1)), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    
    // Este punto nunca debería alcanzarse debido al manejo dentro del ciclo
    throw new Error('Error inesperado al crear conversación');
  }

  /**
   * Agrega un mensaje con retry y fallback a localStorage
   */
  async addMessageWithFallback(
    userId: string, 
    agentId: string, 
    params: AddMessageParams, 
    maxRetries = 3
  ): Promise<AgentMessage> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        
        const message = await this.addMessage(userId, agentId, params);
        
        // Si llegamos aquí, la operación fue exitosa
        return message;
      } catch (error) {
        console.error(`Error al agregar mensaje (intento ${attempt}/${maxRetries}):`, error);
        
        if (attempt >= maxRetries) {
          console.warn('Agotados los intentos con Firestore, utilizando localStorage');
          
          // Crear mensaje localmente
          const now = new Date();
          const { conversationId, role, content } = params;
          
          const newMessage: AgentMessage = {
            id: generateRandomId(),
            role,
            content,
            timestamp: now
          };
          
          // Recuperar la conversación de localStorage
          const storageKey = `local_conversations_${userId}`;
          let userConversations = JSON.parse(localStorage.getItem(storageKey) || '{}');
          
          if (userConversations[agentId] && userConversations[agentId][conversationId]) {
            // Agregar el mensaje a la conversación existente
            const conversation = userConversations[agentId][conversationId];
            
            if (!conversation.messages) {
              conversation.messages = [];
            }
            
            conversation.messages.push(newMessage);
            conversation.updatedAt = now.toISOString();
            
            // Actualizar localStorage
            localStorage.setItem(storageKey, JSON.stringify(userConversations));
          } else {
            // La conversación no existe en localStorage, intentar crearla
            const localConversation: AgentConversation = {
              id: conversationId,
              title: 'Nueva conversación',
              agentId,
              agentType: 'unknown' as AgentType, // Tipo genérico
              userId,
              messages: [newMessage],
              createdAt: now,
              updatedAt: now
            };
            
            this.saveConversationToLocalStorage(localConversation);
          }
          
          return newMessage;
        }
        
        // Esperar antes del siguiente intento
        const backoffMs = Math.min(1000 * (2 ** (attempt - 1)), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    
    // Este punto nunca debería alcanzarse debido al manejo dentro del ciclo
    throw new Error('Error inesperado al agregar mensaje');
  }

  /**
   * Sanitiza parámetros de conversación para prevenir errores de invalid-argument
   * Este método aplica sanitización adicional específica para el formato de conversaciones
   * y maneja casos especiales que pueden causar problemas al crear documentos en Firestore
   */
  private sanitizeConversationParams(params: CreateConversationParams): CreateConversationParams {
    const { title, agentId, agentType, userId, initialMessage, metadata } = params;
    
    // Verificar y sanitizar agentId
    let sanitizedAgentId = agentId;
    if (!sanitizedAgentId || typeof sanitizedAgentId !== 'string') {
      console.warn('AgentId inválido, utilizando valor predeterminado');
      sanitizedAgentId = 'default-agent';
    } else if (sanitizedAgentId.length > 100) {
      sanitizedAgentId = sanitizedAgentId.substring(0, 100);
    }
    
    // Verificar y sanitizar userId
    let sanitizedUserId = userId;
    if (!sanitizedUserId || typeof sanitizedUserId !== 'string') {
      console.warn('UserId inválido o faltante, utilizando valor generado');
      sanitizedUserId = `guest-${Date.now().toString(36)}`;
    } else if (sanitizedUserId.length > 128) {
      sanitizedUserId = sanitizedUserId.substring(0, 128);
    }
    
    // Sanitizar el título (a veces causa problemas)
    const sanitizedTitle = title ? 
      title.substring(0, Math.min(title.length, 100))  // Limitar longitud
        .replace(/[^\w\s.,!?()-]/g, '') // Eliminar caracteres especiales
        .trim() || 'Nueva conversación'
      : 'Nueva conversación';
    
    // Asegurar que agentType sea uno de los valores permitidos
    const validAgentTypes = ['seo', 'copywriting', 'ads', 'creative', 'email', 'analytics', 'social', 'strategy'];
    const sanitizedAgentType = validAgentTypes.includes(agentType as string) ? 
      agentType : 'copywriting' as AgentType;
    
    // Limpiar el mensaje inicial (si existe)
    let sanitizedInitialMessage = undefined;
    if (initialMessage) {
      // Eliminar caracteres problemáticos y limitar longitud
      sanitizedInitialMessage = initialMessage
        .substring(0, Math.min(initialMessage.length, 1000))
        .replace(/[\uD800-\uDFFF]|[\uFFFE\uFFFF]/g, ''); // Eliminar caracteres Unicode no válidos
      
      // Si después de la limpieza quedó vacío, establecer como undefined
      if (sanitizedInitialMessage.trim().length === 0) {
        sanitizedInitialMessage = undefined;
      }
    }
    
    // Sanitizar metadata si existe
    let sanitizedMetadata = undefined;
    if (metadata) {
      sanitizedMetadata = {};
      // Solo incluir propiedades seguras y con valores válidos
      Object.entries(metadata).forEach(([key, value]) => {
        // Sanitizar clave (nombre seguro para Firestore)
        const safeKey = key.replace(/[.\\/[\]#$]/g, '_');
        
        // Solo incluir valores primitivos (string, number, boolean) o arrays/objetos simples
        const valueType = typeof value;
        if (['string', 'number', 'boolean'].includes(valueType)) {
          if (valueType === 'string' && (value as string).length > 500) {
            // Truncar strings largos
            sanitizedMetadata![safeKey] = (value as string).substring(0, 500);
          } else {
            sanitizedMetadata![safeKey] = value;
          }
        } else if (Array.isArray(value)) {
          // Para arrays, solo incluir si no son muy grandes y contienen valores simples
          if (value.length <= 50) {
            sanitizedMetadata![safeKey] = value.map(item => 
              typeof item === 'string' ? item.substring(0, 100) : 
              typeof item === 'object' ? JSON.stringify(item).substring(0, 100) : 
              item
            ).slice(0, 50); // Limitar tamaño del array
          }
        } else if (valueType === 'object' && value !== null) {
          // Para objetos simples, convertir a string JSON y limitar tamaño
          try {
            const jsonString = JSON.stringify(value);
            sanitizedMetadata![safeKey] = jsonString.substring(0, 500);
          } catch (e) {
            // Si no se puede serializar, omitir
            console.warn(`No se pudo serializar metadata[${key}]`);
          }
        }
      });
      
      // Si después de la sanitización no hay propiedades, establecer como undefined
      if (Object.keys(sanitizedMetadata).length === 0) {
        sanitizedMetadata = undefined;
      }
    }
    
    return {
      title: sanitizedTitle,
      agentId: sanitizedAgentId,
      agentType: sanitizedAgentType,
      userId: sanitizedUserId,
      initialMessage: sanitizedInitialMessage,
      metadata: sanitizedMetadata
    };
  }
  
  /**
   * Sincroniza conversaciones de localStorage a Firestore cuando esté disponible
   */
  async syncLocalConversationsToFirestore(userId: string): Promise<void> {
    try {
      // Verificar si Firestore está disponible
      const isAvailable = await this.isFirestoreAvailable();
      
      if (!isAvailable) {
        console.log('Firestore no está disponible, no se pueden sincronizar las conversaciones');
        return;
      }
      
      const storageKey = `local_conversations_${userId}`;
      const userConversations = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // Si no hay conversaciones locales, no hay nada que sincronizar
      if (Object.keys(userConversations).length === 0) {
        return;
      }
      
      console.log('Sincronizando conversaciones locales a Firestore...');
      
      for (const [agentId, agentConversations] of Object.entries(userConversations)) {
        for (const [conversationId, conversation] of Object.entries(agentConversations as any)) {
          // Solo sincronizar las conversaciones con ID local
          if (!conversationId.startsWith('local_')) {
            continue;
          }
          
          const typedConversation = conversation as AgentConversation;
          
          try {
            // Crear nueva conversación en Firestore
            const firestoreConversation = await this.createConversation({
              title: typedConversation.title,
              agentId,
              agentType: typedConversation.agentType,
              userId,
              initialMessage: undefined // No agregar mensaje inicial
            });
            
            // Agregar todos los mensajes
            for (const message of typedConversation.messages) {
              await this.addMessage(userId, agentId, {
                conversationId: firestoreConversation.id,
                role: message.role,
                content: message.content
              });
            }
            
            // Eliminar la conversación local
            delete (userConversations as any)[agentId][conversationId];
          } catch (error) {
            console.error(`Error al sincronizar conversación ${conversationId}:`, error);
          }
        }
      }
      
      // Actualizar localStorage
      localStorage.setItem(storageKey, JSON.stringify(userConversations));
      
      console.log('Sincronización de conversaciones completada');
    } catch (error) {
      console.error('Error al sincronizar conversaciones:', error);
    }
  }
}

// Instancia por defecto para uso en la aplicación
export const agentChatService = new AgentChatService();