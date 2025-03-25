'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDirectText } from '@/lib/direct-text';
import { Sparkles, Send, Search, Pencil, FileText, MessageSquare, Mail, Megaphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";

// Definimos los tipos de contenido predefinidos
const contentTypeButtons = [
  { 
    value: "text", 
    label: "General Content", 
    icon: <Pencil size={14} />,
    prompt: "Escribe un texto informativo sobre marketing digital. Incluye 3-5 puntos clave que toda estrategia debería tener."
  },
  { 
    value: "blog", 
    label: "Blog Post", 
    icon: <FileText size={14} />,
    prompt: "Escribe un artículo de blog de 500 palabras sobre las tendencias emergentes en inteligencia artificial aplicada al marketing. Incluye introducción, subtítulos y conclusión."
  },
  { 
    value: "social", 
    label: "Social Media", 
    icon: <MessageSquare size={14} />,
    prompt: "Crea 3 publicaciones cortas para redes sociales (LinkedIn, Twitter e Instagram) sobre el lanzamiento de una nueva herramienta de automatización de marketing."
  },
  { 
    value: "email", 
    label: "Email", 
    icon: <Mail size={14} />,
    prompt: "Redacta un email de bienvenida para nuevos suscriptores de un boletín sobre estrategias de marketing digital. Debe ser amigable, informativo y con un llamado a la acción claro."
  },
  { 
    value: "ad", 
    label: "Ad Copy", 
    icon: <Megaphone size={14} />,
    prompt: "Crea un anuncio persuasivo para una plataforma de inteligencia artificial de marketing. Incluye título atractivo, descripción convincente y un llamado a la acción efectivo."
  }
];

interface WelcomeSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  placeholderText: string;
  onSendMessage: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  contentType?: string;
  onContentTypeChange?: (type: string, prompt: string) => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  inputText,
  setInputText,
  placeholderText,
  onSendMessage,
  inputRef,
  contentType = "text",
  onContentTypeChange = () => {}
}) => {
  const { t } = useDirectText();

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="relative mb-8 flex flex-col items-center"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* Modern 3D Hero Banner */}
      <motion.div 
        variants={itemVariants}
        className="w-full mb-10 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-3xl" />
        <div className="absolute inset-0 border-3 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]" />
        <div className="relative px-8 py-10 flex flex-col items-center md:flex-row md:items-center md:justify-between">
          {/* Left section - Welcome text */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="relative mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-20 h-20 flex items-center justify-center rounded-2xl border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                <Sparkles className="h-10 w-10" />
              </div>
            </div>
            
            {/* Heading with proper layout */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                Welcome to MarketingAI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Your AI marketing assistant
              </p>
            </div>
          </div>
          
          {/* Right section - Animated circles */}
          <div className="hidden md:block relative w-40 h-40">
            <motion.div
              className="absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/30"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -10, 0],
                y: [0, 10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/30"
              animate={{
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Content Type Buttons */}
      <motion.div
        variants={itemVariants}
        className="w-full max-w-2xl mb-4 flex flex-wrap justify-center gap-2"
      >
        {contentTypeButtons.map((type) => (
          <Badge
            key={type.value}
            variant={contentType === type.value ? "default" : "outline"}
            className={`py-1.5 px-3 cursor-pointer transition-all duration-200 ${
              contentType === type.value 
                ? "bg-primary hover:bg-primary/90" 
                : "hover:bg-primary/10 text-gray-600 dark:text-gray-300"
            }`}
            onClick={() => onContentTypeChange(type.value, type.prompt)}
          >
            <span className="flex items-center gap-1">
              {type.icon}
              {type.label}
            </span>
          </Badge>
        ))}
      </motion.div>
      
      {/* Modern search input */}
      <motion.div 
        variants={itemVariants}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="relative">
          {/* Shadow element for 3D effect */}
          <div className="absolute inset-0 border-3 border-black rounded-full translate-x-2 translate-y-2 bg-black/80" />
          
          {/* Input container */}
          <div className="relative bg-white dark:bg-gray-800 border-3 border-black rounded-full shadow-sm overflow-hidden">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={placeholderText}
              className="pl-7 pr-16 py-7 h-16 border-none focus:ring-0 text-lg font-medium placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <Button 
              className="absolute right-3 top-3 h-10 w-10 rounded-full p-0 
                       border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600
                       text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                       flex items-center justify-center transform transition-transform
                       hover:translate-x-0 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]" 
              onClick={onSendMessage}
              disabled={!inputText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
            
            {/* Subtle decoration */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none opacity-50">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeSection;