import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send } from 'lucide-react';
import { useLocation } from 'wouter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopywriterWorkspace() {
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Alex, your AI copywriting assistant. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/copywriter/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputMessage,
          type: 'chat'
        }),
      });

      if (!response.ok) {
        throw new Error('Error generating response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (data.content) {
        setGeneratedContent(data.content);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setLocation('/agent-marketplace')} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span>Back to Agent</span>
        </button>
        <h1 className="text-2xl font-bold ml-4">Alex Copywriter Workspace</h1>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2 flex flex-col h-[calc(100vh-120px)]">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto border rounded-t p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="border rounded-b p-2 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-1/2">
          <div className="border rounded p-4 h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
            {generatedContent ? (
              <div className="whitespace-pre-wrap">{generatedContent}</div>
            ) : (
              <div className="text-gray-500">
                The latest generated content will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 