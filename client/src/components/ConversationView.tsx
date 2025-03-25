import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, formatDate, addMessageToConversation, saveMessageWithRetry } from '@/lib/conversation-memory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  User, 
  Bot, 
  Send, 
  Copy, 
  ChevronLeft, 
  Download,
  Check,
  Clock,
  AlertCircle,
  Loader,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { serverTimestamp, Timestamp } from 'firebase/firestore';

interface ConversationViewProps {
  conversation: Conversation;
  onBack?: () => void;
  onUpdate?: (conversation: Conversation) => void;
  enableFeedback?: boolean;
  agentName?: string;
  agentAvatar?: string;
}

export default function ConversationView({
  conversation,
  onBack,
  onUpdate,
  enableFeedback = true,
  agentName = "AI Assistant",
  agentAvatar
}: ConversationViewProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Add the user's message to the conversation with retry capability
      await saveMessageWithRetry(
        conversation.id || '',
        { role: 'user', content: inputMessage }
      );
      
      // Use the imported serverTimestamp
      
      // Prepare the updated conversation for UI update
      const updatedMessages = [
        ...conversation.messages,
        { 
          role: 'user', 
          content: inputMessage, 
          timestamp: serverTimestamp() 
        } as Message
      ];
      
      // Update the UI immediately with user message
      if (onUpdate) {
        onUpdate({
          ...conversation,
          messages: updatedMessages
        });
      }
      
      // Get content type from metadata if available
      const contentType = conversation.metadata?.contentType || '';
      
      // Call the AI service for a response
      let aiResponse = '';
      try {
        // First try to use the AI service
        const response = await fetch('/api/ai/generate-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: inputMessage,
            contentType: contentType,
            conversationHistory: updatedMessages.map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        });
        
        if (!response.ok) throw new Error('AI service unavailable');
        const data = await response.json();
        aiResponse = data.content;
      } catch (aiError) {
        console.error("Error calling AI service:", aiError);
        // Fallback to basic response
        aiResponse = `I understood your message about "${inputMessage.substring(0, 30)}...", but I'm having trouble generating a response right now. Please try again shortly.`;
      }
      
      // Add the AI response to the conversation with retry capability
      await saveMessageWithRetry(
        conversation.id || '',
        { role: 'assistant', content: aiResponse }
      );
      
      // Clear the input
      setInputMessage("");
      
      // If parent component wants updates, notify it with final state
      if (onUpdate) {
        onUpdate({
          ...conversation,
          messages: [
            ...updatedMessages,
            { role: 'assistant', content: aiResponse, timestamp: serverTimestamp() } as Message
          ]
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleCopyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message.id || '');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  const handleDownloadConversation = () => {
    // Create text version of the conversation
    const conversationText = conversation.messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : agentName;
      return `${role}:\n${msg.content}\n`;
    }).join('\n');
    
    // Create and trigger download
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const getAvatarForMessage = (message: Message) => {
    if (message.role === 'user') {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      );
    } else if (message.role === 'assistant') {
      return (
        <Avatar className="h-8 w-8">
          {agentAvatar ? (
            <AvatarImage src={agentAvatar} alt={agentName} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      );
    } else if (message.role === 'system') {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-500 text-white">
            <AlertCircle className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold">{conversation.title}</h2>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(conversation.updatedAt?.toDate() || new Date())}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadConversation}>
                <Download className="h-4 w-4 mr-2" />
                <span>Download Conversation</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message, index) => (
          <div key={message.id || index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {getAvatarForMessage(message)}
              
              <div className={`mx-2 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : message.role === 'system'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                <div className={`mt-1 text-xs flex items-center ${
                  message.role === 'user' ? 'justify-end text-primary-foreground/70' : 'justify-start text-gray-500'
                }`}>
                  {message.timestamp && (
                    <span>
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : message.timestamp.toDate ? 
                          message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  )}
                  
                  {message.role === 'assistant' && enableFeedback && (
                    <div className="ml-2 flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`ml-2 h-5 w-5 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'
                    }`}
                    onClick={() => handleCopyMessage(message)}
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t">
        {error && (
          <div className="mb-2 p-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none min-h-[60px]"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || isSubmitting}
            className="h-10 px-3"
          >
            {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}