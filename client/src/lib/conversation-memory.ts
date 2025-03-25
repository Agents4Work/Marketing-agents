/**
 * Conversation Memory System for AI Content Hub
 * 
 * This module provides functionality to save, retrieve, and manage conversation histories
 * between users and AI agents, using Google Cloud Firestore for persistence.
 */

import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Types
export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp?: Timestamp;
  metadata?: Record<string, any>;
  tokenCount?: number;
}

export interface Conversation {
  id?: string;
  userId: string;
  agentType?: string;
  title: string;
  summary?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  messages: Message[];
  metadata?: {
    contentType?: string;
    category?: string;
    tags?: string[];
    documentIds?: string[];
    [key: string]: any;
  };
}

// Generate a title for the conversation based on first message
function generateConversationTitle(firstMessage: string): string {
  // Truncate and clean the message to create a title
  const maxLength = 50;
  let title = firstMessage.trim().split('\n')[0]; // Get first line
  
  if (title.length > maxLength) {
    title = title.substring(0, maxLength) + '...';
  }
  
  // If title is still empty (rare case), use a timestamp-based fallback
  if (!title) {
    title = `Conversation from ${new Date().toLocaleString()}`;
  }
  
  return title;
}

/**
 * Creates a new conversation in Firestore
 */
export async function createConversation(
  firstMessageOrOptions: string | {
    initialMessage?: string;
    title?: string;
    agentType?: string;
    metadata?: Record<string, any>;
  },
  agentType?: string,
  metadata?: Record<string, any>
): Promise<Conversation> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to save conversations');
    }

    let firstMessage = '';
    let conversationTitle = '';
    let conversationAgentType = agentType;
    let conversationMetadata = metadata || {};
    
    // Handle new options-based calling pattern
    if (typeof firstMessageOrOptions === 'object') {
      firstMessage = firstMessageOrOptions.initialMessage || '';
      conversationTitle = firstMessageOrOptions.title || '';
      conversationAgentType = firstMessageOrOptions.agentType || agentType;
      conversationMetadata = firstMessageOrOptions.metadata || metadata || {};
    } else {
      // Legacy calling pattern
      firstMessage = firstMessageOrOptions;
    }

    const userId = currentUser.uid;
    const title = conversationTitle || generateConversationTitle(firstMessage);
    
    const conversationData: Conversation = {
      userId,
      agentType: conversationAgentType,
      title,
      createdAt: serverTimestamp() as unknown as Timestamp,
      updatedAt: serverTimestamp() as unknown as Timestamp,
      messages: firstMessage ? [
        {
          role: 'user',
          content: firstMessage,
          timestamp: serverTimestamp() as unknown as Timestamp
        }
      ] : [],
      metadata: conversationMetadata
    };

    const conversationsRef = collection(db, 'conversations');
    const docRef = await addDoc(conversationsRef, conversationData);
    
    return {
      ...conversationData,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Adds a message to an existing conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  message: {
    role: 'user' | 'assistant' | 'system' | 'function',
    content: string,
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to update conversations');
    }

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationSnap.data() as Conversation;
    
    // Verify the user owns this conversation
    if (conversationData.userId !== currentUser.uid) {
      throw new Error('You do not have permission to update this conversation');
    }
    
    // Add the new message
    const newMessage: Message = {
      role: message.role,
      content: message.content,
      timestamp: serverTimestamp() as unknown as Timestamp,
      metadata: message.metadata
    };
    
    await updateDoc(conversationRef, {
      messages: [...(conversationData.messages || []), newMessage],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    throw error;
  }
}

/**
 * Updates a conversation's metadata (title, summary, etc.)
 */
export async function updateConversationMetadata(
  conversationId: string,
  updates: {
    title?: string;
    summary?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to update conversations');
    }

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationSnap.data();
    
    // Verify the user owns this conversation
    if (conversationData.userId !== currentUser.uid) {
      throw new Error('You do not have permission to update this conversation');
    }
    
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp()
    };
    
    if (updates.title) updateData.title = updates.title;
    if (updates.summary) updateData.summary = updates.summary;
    
    if (updates.metadata) {
      updateData.metadata = {
        ...(conversationData.metadata || {}),
        ...updates.metadata
      };
    }
    
    await updateDoc(conversationRef, updateData);
  } catch (error) {
    console.error('Error updating conversation metadata:', error);
    throw error;
  }
}

/**
 * Gets a specific conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to retrieve conversations');
    }

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      return null;
    }
    
    const conversationData = conversationSnap.data() as Conversation;
    
    // Verify the user owns this conversation
    if (conversationData.userId !== currentUser.uid) {
      throw new Error('You do not have permission to access this conversation');
    }
    
    return {
      ...conversationData,
      id: conversationSnap.id
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Gets recent conversations for the current user
 */
export async function getRecentConversations(maxLimit = 10): Promise<Conversation[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to retrieve conversations');
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc'),
      limit(maxLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        ...doc.data() as Conversation,
        id: doc.id
      });
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting recent conversations:', error);
    throw error;
  }
}

/**
 * Searches conversations by content or metadata
 */
export async function searchConversations(searchTerm: string): Promise<Conversation[]> {
  try {
    // First get all conversations for the user (Firestore doesn't support text search directly)
    const allConversations = await getRecentConversations(100);
    
    // Then filter them client-side (for a production app, this would use a dedicated search service)
    return allConversations.filter(conversation => {
      // Search in title
      if (conversation.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // Search in messages
      const messagesMatch = conversation.messages.some(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (messagesMatch) return true;
      
      // Search in metadata tags
      if (conversation.metadata?.tags) {
        const tagsMatch = conversation.metadata.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (tagsMatch) return true;
      }
      
      return false;
    });
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
}

/**
 * Format a date for display in the UI
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
  if (!date) return 'Unknown date';
  
  // For today, just show the time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateToCheck.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For yesterday, show "Yesterday"
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateToCheck.getTime() === yesterday.getTime()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For dates in the last week, show the day name
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 6);
  if (date >= lastWeek) {
    return date.toLocaleDateString([], { weekday: 'long' }) + 
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // For all other dates, show the full date
  return date.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

/**
 * Gets a specific conversation by ID
 * @param id The conversation ID
 * @returns The conversation or null if not found
 */
export async function getConversationById(id: string): Promise<Conversation | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to retrieve a conversation');
    }

    const conversationRef = doc(db, 'conversations', id);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      return null;
    }
    
    // Security check - verify this conversation belongs to this user
    const conversationData = conversationSnap.data() as Conversation;
    if (conversationData.userId !== currentUser.uid) {
      console.error('Attempted to access conversation belonging to another user');
      return null;
    }
    
    return {
      ...conversationData,
      id: conversationSnap.id
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Utility function to save messages with retry capability and exponential backoff
 * @param conversationId The conversation ID
 * @param message The message to save
 * @param maxRetries Maximum number of retry attempts
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function saveMessageWithRetry(
  conversationId: string, 
  message: { 
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    metadata?: Record<string, any>;
  },
  maxRetries = 3
): Promise<boolean> {
  let attempts = 0;
  let backoffTime = 500; // Start with 500ms delay
  
  while (attempts < maxRetries) {
    try {
      await addMessageToConversation(conversationId, message);
      console.log(`Message saved successfully: ${message.role}`);
      return true;
    } catch (err) {
      attempts++;
      console.error(`Failed to save message (attempt ${attempts}/${maxRetries}):`, err);
      
      if (attempts >= maxRetries) {
        console.error('All attempts to save message failed');
        return false;
      }
      
      // Wait before retrying with exponential backoff
      backoffTime *= 1.5;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  return false;
}