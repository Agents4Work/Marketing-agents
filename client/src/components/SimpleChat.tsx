import React, { useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Bot,
  User,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Simple interfaces for the chat component
interface TeamMember {
  id: string;
  name: string;
  type: string;
}

interface ChatMessage {
  id: string;
  type: 'in' | 'out' | 'system';
  sender: string;
  senderType: string;
  content: string;
  timestamp: Date;
}

interface SimpleChatProps {
  messages: ChatMessage[];
  teamMembers: TeamMember[];
  userInput: string;
  isProcessing: boolean;
  contentName: string;
  isMaximized?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onUserInputChange: (value: string) => void;
  onMaximizeToggle?: () => void;
  getAgentColor: (type: string) => string;
  getAgentIcon: (type: string) => React.ReactNode;
}

const SimpleChat: React.FC<SimpleChatProps> = ({
  messages,
  teamMembers,
  userInput,
  isProcessing,
  contentName,
  isMaximized = false,
  onSubmit,
  onUserInputChange,
  onMaximizeToggle,
  getAgentColor,
  getAgentIcon
}) => {
  // Reference for the scrollable container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="flex-shrink-0 border-b p-2 bg-gray-50 flex justify-between items-center">
        <h4 className="font-medium text-sm flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          AI Team Chat
        </h4>
        {onMaximizeToggle && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={onMaximizeToggle}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? 
              <Minimize2 className="h-4 w-4" /> : 
              <Maximize2 className="h-4 w-4" />
            }
          </Button>
        )}
      </div>
      
      {/* Team members */}
      <div className="flex-shrink-0 border-b p-2 bg-white">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Team:</span>
          {teamMembers.map((member) => (
            <Badge 
              key={member.id} 
              variant="outline" 
              className="flex items-center gap-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className={getAgentColor(member.type)}>
                  {getAgentIcon(member.type)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2" />
              <p>Your AI team is ready</p>
              <p className="text-sm mt-1">Ask anything about your content</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex items-start gap-3 mb-4 ${message.type === 'out' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type !== 'out' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className={getAgentColor(message.senderType)}>
                      {getAgentIcon(message.senderType)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col max-w-[80%] ${message.type === 'out' ? 'items-end' : 'items-start'}`}>
                  {message.type !== 'out' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`rounded-lg py-2 px-3 ${
                      message.type === 'out' 
                        ? 'bg-blue-500 text-white self-end' 
                        : message.type === 'system'
                          ? 'bg-gray-100 border'
                          : 'bg-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                  
                  {message.type === 'out' && (
                    <span className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                
                {message.type === 'out' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isProcessing && (
              <div className="flex items-center my-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>AI team is working...</span>
                </div>
              </div>
            )}
            
            {/* Empty div for scroll reference */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Fixed input area */}
      <div className="flex-shrink-0 border-t bg-white p-3">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Textarea
            placeholder={`Ask about your ${contentName.toLowerCase()}...`}
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

export default SimpleChat;