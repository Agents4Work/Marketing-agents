'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import SidebarOptimized from "../components/SidebarOptimized";
import { useAuth } from "../hooks/useAuth";
import useOnboarding from "../hooks/use-onboarding";
import DashboardOnboarding from "../components/DashboardOnboarding";
import "../styles/scrollbar.css";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { generateContent } from "../lib/openai";
import { generateChatResponse, ConversationHistory } from "../lib/gemini";
import { cn } from "../lib/utils";
import Modern3DCard from "../components/ui/modern-3d-card";
import Modern3DButton from "../components/ui/modern-3d-button";
import Modern3DHeader from "../components/ui/modern-3d-header";
import { COLORS, SHADOWS, BORDERS, UI_COMPONENTS } from "../styles/modern-3d-design-system";

import GlowHoverCard from "../components/ui/glow-hover-card";
import { useDirectText } from "../lib/direct-text";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import AIMarketingToolkit from "../components/dashboard/AIMarketingToolkit";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Layout,
  Calendar,
  Image,
  Mail,
  Megaphone,
  Search,
  Plus,
  ChevronRight,
  Sparkles,
  Copy,
  CheckCircle2,
  Pencil,
  Send,
  PenLine,
  BarChart,
  Camera,
  Zap,
  Globe,
  BarChart3,
  LineChart,
  BrainCircuit,
  Share2
} from "lucide-react";

// Placeholder data for recent documents
const recentDocuments = [
  {
    id: 1,
    title: "Q1 Marketing Campaign",
    type: "Blog Post",
    timestamp: "a day ago",
    preview: "In today's competitive landscape, businesses are constantly seeking innovative ways to reach their target audience...",
  },
  {
    id: 2,
    title: "Product Launch Email Sequence",
    type: "Email Campaign",
    timestamp: "a day ago",
    preview: "Subject: Introducing Our Revolutionary New Product...",
  },
  {
    id: 3,
    title: "Social Media Content Calendar",
    type: "Social Media",
    timestamp: "a day ago",
    preview: "Monday: Product spotlight with testimonial quote...",
  }
];

// Placeholder data for recent conversations
const recentConversations = [
  {
    id: 1,
    title: "Landing Page Discussion",
    timestamp: "a day ago",
  },
  {
    id: 2,
    title: "Product LinkedIn Post",
    timestamp: "a day ago",
  }
];

// Expanded featured categories with proper descriptions
const featuredCategories = [
  {
    id: 1,
    title: "Content Marketing",
    description: "Create SEO-optimized blogs, articles & long-form content with AI that knows your brand voice.",
    icon: <FileText className="h-8 w-8" />,
    color: "from-blue-500 to-blue-600",
    apps: ["Blog Writer", "SEO Content", "Article Generator"]
  },
  {
    id: 2,
    title: "Product Marketing",
    description: "Generate product descriptions, feature highlights & compelling benefit statements.",
    icon: <Layout className="h-8 w-8" />,
    color: "from-purple-500 to-purple-600",
    apps: ["Product Story", "Feature Writer", "USP Generator"]
  },
  {
    id: 3,
    title: "Social Media Marketing",
    description: "Create platform-specific content that drives engagement, reaches new audiences & builds community.",
    icon: <Share2 className="h-8 w-8" />,
    color: "from-pink-500 to-rose-600",
    apps: ["Post Generator", "Hashtag Finder", "Caption Writer"]
  },
  {
    id: 4,
    title: "Performance Marketing",
    description: "Craft high-converting ad copy, landing pages & CTAs that maximize ROI across all digital channels.",
    icon: <BarChart3 className="h-8 w-8" />,
    color: "from-amber-500 to-amber-600", 
    apps: ["Ad Copy Creator", "CTA Generator", "Landing Page Copy"]
  },
  {
    id: 5,
    title: "Email Marketing",
    description: "Write compelling subject lines, email sequences & newsletters that drive opens, clicks & conversions.",
    icon: <Mail className="h-8 w-8" />,
    color: "from-green-500 to-green-600",
    apps: ["Email Sequence", "Subject Line", "Newsletter Creator"]
  },
  {
    id: 6,
    title: "Video Marketing",
    description: "Generate video scripts, storyboards & captions that engage viewers across all platforms.",
    icon: <Camera className="h-8 w-8" />,
    color: "from-red-500 to-red-600",
    apps: ["Script Generator", "Storyboard", "Video Captions"]
  },
  {
    id: 7,
    title: "Analytics & Insights",
    description: "Transform raw data into actionable marketing insights with AI-powered analysis & visualizations.",
    icon: <LineChart className="h-8 w-8" />,
    color: "from-indigo-500 to-indigo-600",
    apps: ["Data Interpreter", "Insight Generator", "Report Creator"]
  },
  {
    id: 8,
    title: "AI Strategy Assistant",
    description: "Get expert guidance on marketing strategy, campaign planning & competitive analysis.",
    icon: <BrainCircuit className="h-8 w-8" />,
    color: "from-cyan-500 to-cyan-600",
    apps: ["Strategy Builder", "Campaign Planner", "Competitive Analysis"]
  }
];

// Quick action buttons with animations - with translations 
const getQuickActionButtons = (t: (key: string) => string) => [
  {
    id: 1,
    label: t("generate_blog_post"),
    icon: <PenLine size={20} />,
    color: "bg-gradient-to-r from-blue-500 to-blue-600"
  },
  {
    id: 2,
    label: t("write_ad_copy"),
    icon: <Megaphone size={20} />,
    color: "bg-gradient-to-r from-purple-500 to-purple-600"
  },
  {
    id: 3,
    label: t("create_social_post"),
    icon: <MessageSquare size={20} />,
    color: "bg-gradient-to-r from-pink-500 to-rose-600"
  },
  {
    id: 4,
    label: t("generate_image"),
    icon: <Image size={20} />,
    color: "bg-gradient-to-r from-amber-500 to-amber-600"
  }
];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useDirectText();
  const [, setLocation] = useLocation();
  const [activeDocument, setActiveDocument] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [isPlaceholderAnimating, setIsPlaceholderAnimating] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Onboarding tour state
  const { 
    activeTour, 
    shouldShowTour, 
    startTour, 
    completeTour, 
    skipTour 
  } = useOnboarding();

  // Show dashboard tour automatically on first visit
  useEffect(() => {
    // Slight delay to ensure the dashboard renders completely
    const timer = setTimeout(() => {
      if (shouldShowTour('dashboard')) {
        startTour('dashboard');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [shouldShowTour, startTour]);

  // Animated placeholder text options
  const placeholders = [
    "What content do you need today?",
    "Generate an AI-powered blog post...",
    "Write high-converting ad copy...",
    "Create a social media strategy..."
  ];

  // Temporarily disable redirection to make development easier
  // useEffect(() => {
  //   if (!loading && !user) {
  //     setLocation("/");
  //   }
  // }, [user, loading, setLocation]);

  // Handle document click
  const handleDocumentClick = (id: number) => {
    setActiveDocument(id === activeDocument ? null : id);
  };

  // Content type options with enhanced descriptions and prompts - Memoized to prevent recreation
  const contentTypes = useMemo(() => [
    { 
      value: "text", 
      label: "General Content", 
      icon: <Pencil size={14} />,
      description: "All-purpose content for various needs",
      model: "gemini-pro",
      defaultPrompt: "Escribe un texto informativo sobre marketing digital. Incluye 3-5 puntos clave que toda estrategia debería tener."
    },
    { 
      value: "blog", 
      label: "Blog Post", 
      icon: <FileText size={14} />,
      description: "Long-form educational or informational content",
      model: "gemini-1.5-pro",
      defaultPrompt: "Escribe un artículo de blog de 500 palabras sobre las tendencias emergentes en inteligencia artificial aplicada al marketing. Incluye introducción, subtítulos y conclusión."
    },
    { 
      value: "social", 
      label: "Social Media", 
      icon: <MessageSquare size={14} />,
      description: "Engaging posts for social platforms",
      model: "gemini-pro",
      defaultPrompt: "Crea 3 publicaciones cortas para redes sociales (LinkedIn, Twitter e Instagram) sobre el lanzamiento de una nueva herramienta de automatización de marketing."
    },
    { 
      value: "email", 
      label: "Email", 
      icon: <Mail size={14} />,
      description: "Professional email communications",
      model: "gemini-pro",
      defaultPrompt: "Redacta un email de bienvenida para nuevos suscriptores de un boletín sobre estrategias de marketing digital. Debe ser amigable, informativo y con un llamado a la acción claro."
    },
    { 
      value: "ad", 
      label: "Ad Copy", 
      icon: <Megaphone size={14} />,
      description: "Persuasive advertising content",
      model: "gemini-pro",
      defaultPrompt: "Crea un anuncio persuasivo para una plataforma de inteligencia artificial de marketing. Incluye título atractivo, descripción convincente y un llamado a la acción efectivo."
    }
  ], []);

  // State for AI response and loading
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const [contentType, setContentType] = useState<string>("text");
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory>([]);
  const [useGemini, setUseGemini] = useState<boolean>(true);

  // Handle input submission with animation feedback - asistente IA simple
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsAiLoading(true);
    setShowResponse(true);

    try {
      // Guardar el mensaje del usuario para usarlo en el historial
      const userMessage = inputText;
      console.log("Enviando mensaje al asistente:", userMessage);
      console.log("Tipo de contenido:", contentType);
      console.log("Historial de conversación:", JSON.stringify(conversationHistory));
      
      try {
        // Hacer la solicitud a la API con un timeout más largo
        const response = await Promise.race([
          generateChatResponse(userMessage, contentType, conversationHistory),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("La solicitud tomó demasiado tiempo")), 20000)
          )
        ]) as any;
        
        console.log("Respuesta completa recibida del asistente:", JSON.stringify(response));
        
        if (response && response.content) {
          console.log("Contenido extraído de la respuesta:", response.content);
          // Respuesta directa sin modificaciones
          setAiResponse(response.content);
          if (response.conversationHistory) {
            console.log("Actualizando historial de conversación");
            setConversationHistory(response.conversationHistory);
          }
        } else {
          console.log("No se encontró contenido en la respuesta:", response);
          
          // Si tenemos una respuesta pero sin contenido, trata de extraer información útil
          let errorMessage = "No se pudo generar una respuesta. Por favor intenta de nuevo.";
          
          if (response && typeof response === 'object') {
            // Intentar extraer algún mensaje útil de la respuesta
            if (response.error) {
              errorMessage = `Error: ${response.error}`;
            } else if (response.message) {
              errorMessage = `Mensaje: ${response.message}`;
            } else if (Object.keys(response).length > 0) {
              errorMessage = `Respuesta incompleta recibida. Detalles: ${JSON.stringify(response)}`;
            }
          }
          
          setAiResponse(errorMessage);
        }
      } catch (apiError: any) {
        console.error("Error generando contenido:", apiError);
        
        // Construir un mensaje de error más informativo
        let errorMessage = "Hubo un problema al procesar tu solicitud. Por favor intenta de nuevo.";
        
        if (apiError instanceof Error) {
          // Extraer el mensaje específico del error
          errorMessage = `Error: ${apiError.message}`;
        }
        
        setAiResponse(errorMessage);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setAiResponse("Ocurrió un error inesperado. Por favor recarga la página e intenta nuevamente.");
    } finally {
      setIsAiLoading(false);
      setInputText("");
    }
  };

  // Animate placeholder text - optimized to reduce renders
  useEffect(() => {
    if (!isPlaceholderAnimating) return;

    // Using a more efficient interval approach
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000); // Increased time to reduce state updates

    return () => clearInterval(interval);
  }, [isPlaceholderAnimating, placeholders.length]);

  // Focus the input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Removed scroll handlers since we're using the AIMarketingToolkit component now

  // Get translated quick action buttons
  const quickActionButtons = useMemo(() => getQuickActionButtons(t), [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-8">
          <div className="max-w-6xl mx-auto px-6 space-y-8">
            {/* Hero section with Modern3D Welcome Component */}
            <WelcomeSection
              inputText={inputText}
              setInputText={setInputText}
              placeholderText={placeholders[placeholderIndex]}
              onSendMessage={handleSendMessage}
              inputRef={inputRef}
              contentType={contentType}
              onContentTypeChange={(type, prompt) => {
                setContentType(type);
                if (prompt) {
                  setInputText(prompt);
                }
              }}
            />

            {/* AI Response Section - Optimized with conditional rendering and CSS transitions */}
            {showResponse && (
              <div
                className="mt-8 max-w-3xl mx-auto transition-all duration-300 ease-in-out transform-gpu opacity-100"
                style={{
                  maxHeight: showResponse ? '2000px' : '0',
                  opacity: showResponse ? 1 : 0,
                  overflow: 'hidden'
                }}
              >
                <Card className="overflow-hidden border border-primary/20 shadow-lg bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Thinking...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">AI Assistant</h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-primary/5 hover:bg-primary/5 text-primary border-primary/20"
                              >
                                {contentTypes.find(t => t.value === contentType)?.label || "Content"}
                              </Badge>
                              {aiResponse && aiResponse.includes("Error:") && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-red-500/10 hover:bg-red-500/10 text-red-500 border-red-500/20"
                                >
                                  Error
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto text-gray-500 hover:text-gray-700"
                            onClick={() => setShowResponse(false)}
                          >
                            <span className="sr-only">Close</span>
                            <div className="h-5 w-5 flex items-center justify-center">×</div>
                          </Button>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                          {aiResponse && aiResponse.split('\n').map((line, i) => (
                            <p key={i} className={line.trim() === '' ? 'my-3' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => {
                                navigator.clipboard.writeText(aiResponse || '');
                                // You would add a toast notification here in a real app
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content Type Selection - Hidden initially, shows with animation when AI panel is active */}
            {showResponse && (
              <div className="mt-4 max-w-3xl mx-auto">
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {contentTypes.map((type) => (
                    <Badge
                      key={type.value}
                      variant={contentType === type.value ? "default" : "outline"}
                      className={`py-1.5 px-3 cursor-pointer transition-all duration-200 ${
                        contentType === type.value 
                          ? "bg-primary hover:bg-primary/90" 
                          : "hover:bg-primary/10 text-gray-600 dark:text-gray-300"
                      }`}
                      onClick={() => {
                        setContentType(type.value);
                        // Usar el prompt predefinido para este tipo de contenido
                        if (type.defaultPrompt) {
                          setInputText(type.defaultPrompt);
                        }
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {type.icon}
                        {type.label}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Modern Feature Cards - Organized Content Actions */}
            <div className="mb-8">
              <Modern3DHeader
                title="Content Creation Tools"
                size="md"
                accentColor="from-blue-600 to-indigo-600"
                className="mb-6"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: "Create a document",
                    description: "Start fresh with an AI-powered blank document",
                    color: "bg-gradient-to-r from-blue-500 to-blue-600"
                  },
                  {
                    icon: <MessageSquare className="h-6 w-6" />,
                    title: "Start a conversation",
                    description: "Use Chat to brainstorm ideas or conduct research",
                    color: "bg-gradient-to-r from-indigo-500 to-purple-600"
                  },
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: "Discover AI Apps",
                    description: "Find specialized AI tools to boost your marketing",
                    color: "bg-gradient-to-r from-green-500 to-green-600"
                  }
                ].map((card, index) => (
                  <div key={index} className="relative">
                    <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border-3 border-black p-5">
                      <div className={`${card.color} text-white w-12 h-12 rounded-xl border-2 border-black 
                                     shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] flex items-center justify-center mb-4`}>
                        {card.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{card.description}</p>
                      <Button 
                        className="bg-white dark:bg-gray-800 text-black border-2 border-black
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                                transform hover:-translate-y-0.5 transition-all w-full justify-center"
                        size="sm"
                      >
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                        <span>Start</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productivity Stats */}
            <div className="mb-8">
              <Modern3DHeader
                title="Your Productivity Stats"
                size="sm"
                accentColor="from-amber-500 to-orange-600"
                className="mb-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: <FileText className="h-5 w-5" />,
                    title: "Content Created",
                    value: "12",
                    subtitle: "pieces this month",
                    color: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: <BarChart className="h-5 w-5" />,
                    title: "AI Efficiency",
                    value: "68%",
                    subtitle: "time saved",
                    color: "from-amber-500 to-orange-600"
                  },
                  {
                    icon: <LineChart className="h-5 w-5" />,
                    title: "Engagement Rate",
                    value: "21%",
                    subtitle: "average across channels",
                    color: "from-green-500 to-emerald-600"
                  }
                ].map((stat, i) => (
                  <div key={i} className="relative">
                    <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border-3 border-black overflow-hidden">
                      <div className={`h-1 w-full bg-gradient-to-r ${stat.color}`}></div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`bg-gradient-to-r ${stat.color} text-white p-2 rounded-lg border-2 border-black
                                          shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]`}>
                              {stat.icon}
                            </div>
                            <span className="text-sm font-medium">{stat.title}</span>
                          </div>
                          <span className="text-2xl font-bold">{stat.value}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Documents and Conversations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Recent Documents */}
              <div>
                <Modern3DHeader
                  title="Recent documents"
                  size="sm"
                  accentColor="from-blue-500 to-blue-600"
                  className="mb-4"
                  action={
                    <Modern3DButton 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center"
                      icon={<ChevronRight className="ml-1 h-4 w-4" />}
                    >
                      View all
                    </Modern3DButton>
                  }
                />
                <div className="space-y-5">
                  {recentDocuments.map((doc, index) => index < 2 && (
                    <div
                      key={doc.id}
                      className="transform"
                    >
                      <div className="relative">
                        {/* Shadow element for 3D effect */}
                        <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>

                        {/* Card content */}
                        <div className="relative bg-white dark:bg-gray-800 rounded-xl border-3 border-black overflow-hidden">
                          <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>

                          <div className="p-5">
                            <div className="flex justify-between mb-3">
                              <h4 className="font-bold text-xl">{doc.title}</h4>
                              <Badge className="border-2 border-black px-2.5 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                                {doc.timestamp}
                              </Badge>
                            </div>

                            <div className="flex gap-2 mb-3">
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white
                                              border-2 border-black px-3 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                                {doc.type}
                              </Badge>
                              <Badge className="border-2 border-black px-3 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                                200 words
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4 line-clamp-2">{doc.preview}</p>

                            <div className="flex justify-between mt-3">
                              <div className="flex gap-2">
                                <Button 
                                  className="bg-white dark:bg-gray-800 text-black border-2 border-black
                                          shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                                          transform hover:-translate-y-0.5 transition-all"
                                  size="sm"
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  className="bg-white dark:bg-gray-800 text-black border-2 border-black
                                          shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                                          transform hover:-translate-y-0.5 transition-all"
                                  size="sm"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <Button 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-black
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                                        transform hover:-translate-y-0.5 transition-all h-9 w-9 p-0 rounded-full"
                                size="sm"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Conversations */}
              <div>
                <Modern3DHeader
                  title="Recent conversations"
                  size="sm"
                  accentColor="from-indigo-500 to-purple-600"
                  className="mb-4"
                  action={
                    <Modern3DButton 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center"
                      icon={<ChevronRight className="ml-1 h-4 w-4" />}
                    >
                      View all
                    </Modern3DButton>
                  }
                />
                <div className="space-y-4">
                  {recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="transform"
                    >
                      <div className="relative">
                        {/* Shadow element for 3D effect */}
                        <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2"></div>

                        {/* Card content */}
                        <div className="relative bg-white dark:bg-gray-800 rounded-xl border-3 border-black overflow-hidden">
                          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                          <div className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                                  <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg">{conv.title}</h4>
                                  <Badge className="mt-1 border-2 border-black px-2 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                                    {conv.timestamp}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-2 border-black
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                                        transform hover:-translate-y-0.5 transition-all h-9 w-9 p-0 rounded-full"
                                size="sm"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">Continue</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Marketing Toolkit using our new component */}
            <AIMarketingToolkit featuredCategories={featuredCategories} />
          </div>
        </main>
      </div>

      {/* Dashboard Onboarding Tour */}
      <DashboardOnboarding 
        isOpen={activeTour === 'dashboard'}
        onComplete={() => completeTour('dashboard')}
        onSkip={() => skipTour('dashboard')}
      />
    </div>
  );
};

export default Dashboard;