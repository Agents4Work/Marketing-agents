import React, { useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Send, 
  User,
  Bot,
  Maximize2,
  Minimize2,
} from 'lucide-react';

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

interface ChatInterfaceProps {
  messages: ChatMessage[];
  teamMembers: TeamMember[];
  userInput: string;
  isProcessing: boolean;
  contentName: string;
  isMaximized: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onUserInputChange: (value: string) => void;
  onMaximizeToggle: () => void;
  getSafeAgentColor: (type: string) => string;
  getSafeAgentIcon: (type: string) => React.ReactNode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  teamMembers,
  userInput,
  isProcessing,
  contentName,
  isMaximized,
  onSubmit,
  onUserInputChange,
  onMaximizeToggle,
  getSafeAgentColor,
  getSafeAgentIcon
}) => {
  // Reference for the messages container to enable scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or when processing state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Render a chat message
  const renderMessage = (message: ChatMessage) => {
    const isUserMessage = message.sender === 'user';
    
    return (
      <div 
        key={message.id}
        className={`flex items-start gap-3 mb-4 ${isUserMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isUserMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className={
              typeof message.sender !== 'string' 
                ? getSafeAgentColor(message.sender.type) 
                : 'bg-blue-500 text-white'
            }>
              {typeof message.sender !== 'string' 
                ? getSafeAgentIcon(message.sender.type) 
                : <User className="h-4 w-4" />
              }
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col max-w-[80%] ${isUserMessage ? 'items-end' : 'items-start'}`}>
          {!isUserMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">
                {typeof message.sender !== 'string' ? message.sender.name : 'You'}
              </span>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          
          <div 
            className={`rounded-lg py-2 px-3 ${
              isUserMessage 
                ? 'bg-blue-500 text-white self-end' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <div className="whitespace-pre-wrap text-sm">
              {message.content}
            </div>
          </div>
          
          {isUserMessage && (
            <span className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        {isUserMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="bg-blue-500 text-white">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  return (
    // Main container with fixed height structure
    <div className="flex flex-col h-full">
      {/* Fixed header with title and maximize button */}
      <div className="flex-shrink-0 border-b flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-850">
        <h4 className="font-medium text-sm flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          AI Team Collaboration
        </h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={onMaximizeToggle}
        >
          {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Fixed team members bar */}
      <div className="flex-shrink-0 border-b p-2 bg-white dark:bg-gray-900">
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
      
      {/* Scrollable messages container - expands to fill available space */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ minHeight: "0px" }} // This is crucial for Firefox compatibility
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2" />
              <p>Tu equipo de AI está listo</p>
              <p className="text-sm mt-1">Te ayudaremos a crear contenido según tus requisitos.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map(message => renderMessage(message))}
            
            {/* Typing indicator */}
            {isProcessing && (
              <div className="flex items-center my-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>AI Team is working...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Fixed input form */}
      <div className="flex-shrink-0 border-t bg-white dark:bg-gray-900 p-3">
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

export default ChatInterface;