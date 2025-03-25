'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ModernAIChatProps {
  userName?: string
  onSendMessage: (message: string) => Promise<void>
  onAttachmentUpload?: (file: File) => Promise<void>
  showCommunityButton?: boolean
  onCommunityClick?: () => void
  primaryColor?: string
  messages?: Message[]
  className?: string
}

export const ModernAIChat: React.FC<ModernAIChatProps> = ({
  userName = 'there',
  onSendMessage,
  onAttachmentUpload,
  showCommunityButton = false,
  onCommunityClick,
  primaryColor = 'bg-purple-500',
  messages = [],
  className
}) => {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Message[]>(messages)
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  
  // Extract primary color for different states
  const primaryColorBase = primaryColor.replace('bg-', '')
  const primaryColorHover = `hover:bg-${primaryColorBase.replace('500', '600')}`
  const primaryTextColor = `text-${primaryColorBase}`
  const primaryBorderColor = `border-${primaryColorBase}`
  const primaryBgLight = `bg-${primaryColorBase.replace('500', '50')}`
  
  useEffect(() => {
    setChatMessages(messages)
  }, [messages])
  
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async () => {
    if (input.trim() === '' && !attachmentFile) return
    
    const newMessage: Message = {
      id: `user_${Date.now()}`,
      content: input,
      isUser: true,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, newMessage])
    setIsLoading(true)
    setInput('')
    
    try {
      await onSendMessage(input)
      
      if (attachmentFile && onAttachmentUpload) {
        await onAttachmentUpload(attachmentFile)
        setAttachmentFile(null)
        setShowAttachmentPreview(false)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachmentFile(file)
      setShowAttachmentPreview(true)
    }
  }
  
  const handleRemoveAttachment = () => {
    setAttachmentFile(null)
    setShowAttachmentPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xl", className)}>
      {/* Chat Header with Gradient Background */}
      <div className={`relative p-6 ${primaryColor} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]"></div>
        <div className="absolute right-0 top-0 w-64 h-64 transform translate-x-1/4 -translate-y-1/4">
          <div className="w-full h-full bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hey <span className="text-white">{userName}!</span>
          </h1>
          <p className="text-base md:text-lg opacity-80">
            How can I help you today?
          </p>
        </div>
      </div>
      
      {/* Chat Messages Area with Subtle Background Pattern */}
      <div 
        ref={messageContainerRef}
        className="bg-gradient-to-br from-gray-50 to-white p-6 max-h-[40vh] min-h-[30vh] overflow-y-auto"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        <AnimatePresence initial={false}>
          {chatMessages.map((message) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`relative max-w-[80%] rounded-xl px-4 py-3 ${
                  message.isUser 
                    ? `${primaryColor} text-white` 
                    : 'bg-white border border-gray-200 text-gray-800'
                } shadow-sm`}
              >
                <div className="font-medium">{message.content}</div>
                <div className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-300"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {showAttachmentPreview && attachmentFile && (
          <div className="mb-2 flex items-center p-2 rounded-md bg-gray-50">
            <div className="flex-1 truncate text-sm text-gray-600">
              {attachmentFile.name}
            </div>
            <button 
              onClick={handleRemoveAttachment}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent"
            />
            
            <button
              onClick={handleAttachmentClick}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Paperclip size={18} />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (input.trim() === '' && !attachmentFile)}
            className={`${primaryColor} ${primaryColorHover} text-white p-3 rounded-r-xl focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send size={20} />
          </button>
        </div>
        
        {showCommunityButton && (
          <div className="mt-4 text-center">
            <button
              onClick={onCommunityClick}
              className={`text-sm ${primaryTextColor} hover:underline focus:outline-none inline-flex items-center gap-1.5`}
            >
              <MessageSquare size={14} />
              <span>Join our community</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModernAIChat