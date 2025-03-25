'use client'

import React, { useState, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'
import { RouteComponentProps } from 'wouter'
import ModernAIChat, { Message } from '../components/ui/modern-ai-chat'

export default function ChatDemo(_props: RouteComponentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: 'Welcome to our AI Assistant! How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ])

  const handleSendMessage = useCallback(async (messageText: string) => {
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add AI response
    const aiResponse: Message = {
      id: `ai_${Date.now()}`,
      content: getAIResponse(messageText),
      isUser: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, aiResponse])
  }, [])

  const handleAttachmentUpload = useCallback(async (file: File) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add AI response acknowledging file upload
    const aiResponse: Message = {
      id: `ai_file_${Date.now()}`,
      content: `I've received your file: ${file.name} (${formatFileSize(file.size)})`,
      isUser: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, aiResponse])
  }, [])

  const handleCommunityClick = useCallback(() => {
    // This would normally navigate to a community page
    alert('Navigating to Community Page')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Assistant</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ask questions, get recommendations, or upload files for analysis. Our AI assistant is here to help.
            </p>
          </div>
          
          <ModernAIChat
            userName="Alex"
            onSendMessage={handleSendMessage}
            onAttachmentUpload={handleAttachmentUpload}
            showCommunityButton={true}
            onCommunityClick={handleCommunityClick}
            primaryColor="bg-purple-500"
            messages={messages}
            className="mb-8"
          />
          
          <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Chat Interface</h2>
            <p className="text-gray-600 mb-3">
              This modern AI chat interface demonstrates a clean, professional design with:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Personalized greeting with user's name</li>
              <li>Modern UI with subtle gradient and pattern effects</li>
              <li>File attachment capabilities</li>
              <li>Animated message transitions</li>
              <li>Responsive design that works on all devices</li>
              <li>Customizable primary color scheme</li>
              <li>Community button for additional support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes'
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getAIResponse(message: string): string {
  // Simple response generation logic - in a real app, this would call an AI API
  const lowercaseMessage = message.toLowerCase()
  
  if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
    return "Hello! It's nice to chat with you. How can I assist you today?"
  }
  
  if (lowercaseMessage.includes('help')) {
    return "I'd be happy to help! I can answer questions, provide information, or assist with tasks. What specifically do you need help with?"
  }
  
  if (lowercaseMessage.includes('features') || lowercaseMessage.includes('do')) {
    return "As your AI assistant, I can help with content generation, answer questions, analyze data, provide recommendations, and much more. What would you like to accomplish today?"
  }
  
  if (lowercaseMessage.includes('thank')) {
    return "You're very welcome! Is there anything else I can help you with today?"
  }
  
  return `I've processed your message: "${message}". In a real implementation, this would connect to an AI service like OpenAI's GPT to provide intelligent responses.`
}