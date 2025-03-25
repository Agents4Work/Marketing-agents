import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Types for chat messages
export interface TeamMember {
  id: string;
  name: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  sender: TeamMember | 'user';
  content: string;
  timestamp: Date;
}

interface SimpleChatInterfaceProps {
  messages: ChatMessage[];
  teamMembers: TeamMember[];
  userInput: string;
  isProcessing: boolean;
  contentName: string;
  onUserInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  getSafeAgentColor: (type: string) => string;
  getSafeAgentIcon: (type: string) => React.ReactNode;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({
  messages,
  teamMembers,
  userInput,
  isProcessing,
  contentName,
  onUserInputChange,
  onSubmit,
  getSafeAgentColor,
  getSafeAgentIcon
}) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Render a single message
  const renderMessage = (message: ChatMessage) => {
    const isUserMessage = message.sender === 'user';
    
    return (
      <div 
        key={message.id}
        className={`flex items-start gap-3 ${isUserMessage ? 'justify-end' : ''}`}
      >
        {!isUserMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className={
              typeof message.sender !== 'string' 
              ? getSafeAgentColor(message.sender.type) 
              : 'bg-blue-500'
            }>
              {typeof message.sender !== 'string' 
                ? getSafeAgentIcon(message.sender.type) 
                : 'U'
              }
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'}`}>
          {!isUserMessage && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium">
                {typeof message.sender !== 'string' ? message.sender.name : 'You'}
              </span>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          <div 
            className={`rounded-lg py-2 px-3 max-w-[80%] ${
              isUserMessage 
                ? 'bg-blue-500 text-white self-end' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          </div>
          
          {isUserMessage && (
            <span className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {isUserMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="bg-blue-500 text-white">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r overflow-hidden">
      {/* Header */}
      <div className="border-b flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-850">
        <h4 className="font-medium text-sm flex items-center gap-1">
          <Bot className="h-4 w-4" />
          AI Team Collaboration
        </h4>
      </div>
      
      {/* Team members */}
      <div className="border-b p-2 bg-white dark:bg-gray-900">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Your AI Team:</span>
          {teamMembers.map((member) => (
            <Badge 
              key={member.id} 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className={getSafeAgentColor(member.type)}>
                  {getSafeAgentIcon(member.type)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Messages - scrollable area */}
      <div 
        className="flex-1 overflow-y-auto"
        ref={chatScrollRef}
      >
        <div className="flex flex-col gap-4 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2" />
                <p>Welcome to AI Team</p>
                <p className="text-sm mt-1">Ask anything about your content</p>
              </div>
            </div>
          ) : (
            messages.map(message => renderMessage(message))
          )}
          
          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>AI Team is working...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t bg-white dark:bg-gray-900 p-3">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Textarea
            placeholder={`Ask your AI team about this ${contentName.toLowerCase()}...`}
            className="min-h-10 flex-1 resize-none"
            value={userInput}
            onChange={(e) => onUserInputChange(e.target.value)}
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-10 w-10"
            disabled={isProcessing || !userInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SimpleChatInterface;