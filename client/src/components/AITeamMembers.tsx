import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Search, 
  BarChart3, 
  Mail, 
  MessageCircle, 
  Zap,
  RotateCw
} from "lucide-react";
import { 
  SHADOWS, 
  BORDERS, 
  BORDERS_RADIUS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES, 
  CARD_3D_STYLES 
} from "@/styles/modern-3d-design-system";
import { useDirectText } from "@/lib/direct-text";

// Define AI team member data
const aiTeamMembers = [
  {
    id: 1,
    role: "AI Copywriter",
    tagline: "The Wordsmith Who Never Sleeps",
    specialty: "Writes ad copy, landing pages, and blogs that convert.",
    advantage: "Trained on millions of high-performing marketing messages.",
    impact: "Never gets writer's block, works in seconds, and analyzes past results to improve future content.",
    icon: <FileText className="h-10 w-10" />,
    color: "bg-blue-500",
  },
  {
    id: 2,
    role: "AI SEO Strategist",
    tagline: "Your Algorithm Whisperer",
    specialty: "Finds high-value keywords & optimizes content in real time.",
    advantage: "Knows Google's algorithm better than their own engineers.",
    impact: "Constantly updates with the latest ranking factors to keep you ahead.",
    icon: <Search className="h-10 w-10" />,
    color: "bg-green-500",
  },
  {
    id: 3,
    role: "AI Ad Manager",
    tagline: "Your 24/7 PPC Expert",
    specialty: "Creates and optimizes Google & Facebook ads automatically.",
    advantage: "Cuts wasted ad spend and finds high-ROI campaigns instantly.",
    impact: "Runs A/B tests and adapts instantly for better performance.",
    icon: <Zap className="h-10 w-10" />,
    color: "bg-yellow-500",
  },
  {
    id: 4,
    role: "AI Email Marketer",
    tagline: "Your Relationship Builder",
    specialty: "Crafts engaging email sequences that drive sales on autopilot.",
    advantage: "Personalizes each message based on customer behavior.",
    impact: "Runs email split tests to increase open & conversion rates.",
    icon: <Mail className="h-10 w-10" />,
    color: "bg-pink-500",
  },
  {
    id: 5,
    role: "AI Social Media Manager",
    tagline: "Your Always-On Content Creator",
    specialty: "Writes captions, generates images, and auto-schedules content.",
    advantage: "Knows what trends are working across industries.",
    impact: "Optimizes post timing and hashtags for maximum reach.",
    icon: <MessageCircle className="h-10 w-10" />,
    color: "bg-purple-500",
  },
  {
    id: 6,
    role: "AI Data Analyst",
    tagline: "The Detective Who Finds Hidden Opportunities",
    specialty: "Analyzes every campaign to find what's working best.",
    advantage: "Provides real-time suggestions to maximize ROI.",
    impact: "Detects hidden trends & helps you make smarter data-driven decisions.",
    icon: <BarChart3 className="h-10 w-10" />,
    color: "bg-indigo-500",
  },
];

const AITeamMembers = () => {
  const [, setLocation] = useLocation();
  const [active, setActive] = useState(0);
  const [typing, setTyping] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Analyzing market trends...");
  const [progress, setProgress] = useState(0);
  const loadingInterval = useRef<NodeJS.Timeout | null>(null);
  const { t } = useDirectText();
  
  const statusMessages = [
    "Analyzing market trends...",
    "Learning industry best practices...",
    "Generating insights...",
    "Optimizing strategies...",
    "Ready to transform your marketing...",
  ];

  const handleNext = () => {
    setActive((prev) => (prev + 1) % aiTeamMembers.length);
    resetLoadingAnimation();
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + aiTeamMembers.length) % aiTeamMembers.length);
    resetLoadingAnimation();
  };

  const resetLoadingAnimation = () => {
    setTyping(true);
    setProgress(0);
    
    if (loadingInterval.current) {
      clearInterval(loadingInterval.current);
    }
    
    // Simulate AI status loading with random messages
    loadingInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(loadingInterval.current as NodeJS.Timeout);
          setTyping(false);
          return 100;
        }
        setLoadingStatus(statusMessages[Math.floor((newProgress / 100) * statusMessages.length)]);
        return newProgress;
      });
    }, 200);
  };

  useEffect(() => {
    resetLoadingAnimation();
    
    return () => {
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Autoplay
    const interval = setInterval(() => {
      handleNext();
    }, 12000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Meet Your 
            <span className="text-primary">AI Marketing Team</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            A dedicated team of AI agents working together 24/7 to handle all your marketing needs
          </motion.p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* AI Status Bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between mb-2 px-4 z-20">
            <div className="flex items-center space-x-2">
              <RotateCw className={`h-4 w-4 text-primary ${typing ? 'animate-spin' : ''}`} />
              <span className="text-sm text-primary font-medium">
                {loadingStatus}
              </span>
            </div>
            <div className="w-1/3 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Interactive AI Cards */}
          <div className={`
            ${CARD_3D_STYLES.base}
            ${BORDERS.md}
            ${SHADOWS.lg}
            overflow-hidden
            bg-white dark:bg-gray-900
          `}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 md:p-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* AI Agent Profile Image/Icon */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.div 
                      whileHover={{ 
                        scale: 1.05, 
                        rotate: 2,
                        y: -5,
                        boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)" 
                      }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                      className={`
                        ${aiTeamMembers[active].color} 
                        text-white 
                        p-8 
                        rounded-3xl 
                        h-64 
                        w-64 
                        flex 
                        items-center 
                        justify-center 
                        transform 
                        transition-all 
                        duration-300
                        border-3 
                        border-black
                        ${SHADOWS.md}
                        hover:shadow-xl
                        mx-auto
                      `}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-white h-40 w-40"
                      >
                        {aiTeamMembers[active].icon}
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`
                        ${BORDERS.sm}
                        bg-primary/10 
                        dark:bg-primary/20 
                        rounded-full 
                        px-4 
                        py-1 
                        text-primary 
                        text-sm 
                        font-medium 
                        mt-4
                        ${SHADOWS.sm}
                      `}
                    >
                      AI Agent #{aiTeamMembers[active].id}
                    </motion.div>
                  </div>
                  
                  {/* AI Agent Details */}
                  <div className="flex flex-col">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`
                        mb-2 
                        flex 
                        items-center
                      `}
                    >
                      <h3 className={`
                        text-3xl 
                        font-bold
                        px-4
                        py-1
                        ${BORDERS.sm}
                        ${SHADOWS.sm}
                        bg-primary/10
                        rounded-lg
                        transform
                        -rotate-1
                      `}>
                        {aiTeamMembers[active].role}
                      </h3>
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg italic text-gray-600 dark:text-gray-400 mb-6"
                    >
                      "{aiTeamMembers[active].tagline}"
                    </motion.p>
                    
                    <div className="space-y-4 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`
                          p-3
                          ${BORDERS.sm}
                          ${SHADOWS.sm}
                          rounded-lg
                          bg-white/80
                          dark:bg-gray-800/80
                        `}
                      >
                        <h4 className="font-semibold text-primary mb-1">Specialty</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {aiTeamMembers[active].specialty}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`
                          p-3
                          ${BORDERS.sm}
                          ${SHADOWS.sm}
                          rounded-lg
                          bg-white/80
                          dark:bg-gray-800/80
                        `}
                      >
                        <h4 className="font-semibold text-primary mb-1">Advantage</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {aiTeamMembers[active].advantage}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`
                          p-3
                          ${BORDERS.sm}
                          ${SHADOWS.sm}
                          rounded-lg
                          bg-white/80
                          dark:bg-gray-800/80
                        `}
                      >
                        <h4 className="font-semibold text-primary mb-1">Impact</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {aiTeamMembers[active].impact}
                        </p>
                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button 
                        className={`
                          ${BUTTON_3D_STYLES.base}
                          ${BUTTON_3D_STYLES.primary}
                          ${BUTTON_3D_STYLES.interaction.moveOnHover}
                          mt-4
                          bg-primary 
                          hover:bg-primary/90 
                          text-white 
                          font-medium 
                          w-full 
                          md:w-auto
                        `}
                        onClick={() => setLocation("/sign-in")}
                      >
                        Assign To Work
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className={`
              bg-gradient-to-r
              from-gray-100
              to-white
              dark:from-gray-800 
              dark:to-gray-900
              ${BORDERS_RADIUS.md}
              ${BORDERS.sm}
              p-4 
              flex 
              items-center 
              justify-between
            `}>
              <div className="flex space-x-3">
                <button 
                  onClick={handlePrev}
                  className={`
                    p-2 
                    ${BORDERS.sm}
                    ${SHADOWS.sm}
                    rounded-lg
                    bg-white 
                    dark:bg-gray-700 
                    hover:bg-gray-100 
                    dark:hover:bg-gray-600 
                    transform
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-md
                    active:translate-y-0
                    active:shadow-sm
                  `}
                  aria-label="Previous AI team member"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleNext}
                  className={`
                    p-2 
                    ${BORDERS.sm}
                    ${SHADOWS.sm}
                    rounded-lg
                    bg-white 
                    dark:bg-gray-700 
                    hover:bg-gray-100 
                    dark:hover:bg-gray-600 
                    transform
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-md
                    active:translate-y-0
                    active:shadow-sm
                  `}
                  aria-label="Next AI team member"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <div className={`
                text-sm
                py-1
                px-3
                ${BORDERS.sm}
                bg-white
                dark:bg-gray-800
                rounded-full
                ${SHADOWS.sm}
              `}>
                {active + 1} / {aiTeamMembers.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Swipe to meet more team members
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: false, amount: 0.8 }}
            className={`
              text-center 
              mt-16
              ${BORDERS.md}
              ${SHADOWS.md}
              bg-gradient-to-br
              from-white/80
              to-gray-100/80
              dark:from-gray-800/80
              dark:to-gray-900/80
              p-8
              rounded-xl
              backdrop-blur-sm
              max-w-3xl
              mx-auto
            `}
          >
            <p className={`
              text-xl 
              mb-6 
              font-bold
              ${BORDERS.sm}
              ${SHADOWS.sm}
              bg-white/90
              dark:bg-gray-900/90
              p-4
              rounded-lg
              inline-block
            `}>
              Your competitors are already using AI—are you still doing marketing the hard way?
            </p>
            <Button 
              onClick={() => setLocation("/sign-in")}
              size="lg" 
              className={`
                ${BUTTON_3D_STYLES.base}
                ${BUTTON_3D_STYLES.primary}
                ${BUTTON_3D_STYLES.interaction.moveOnHover}
                px-8 
                py-6 
                text-lg 
                font-bold
              `}
            >
              Build My Complete AI Team Now
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AITeamMembers;