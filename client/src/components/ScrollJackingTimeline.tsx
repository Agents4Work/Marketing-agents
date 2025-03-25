"use client";
import { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useInView, 
  AnimatePresence 
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  color: string;
}

const ScrollJackingTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // Define timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      id: "step-1",
      title: "Replace Your Marketing Team",
      subtitle: "Meet Your New AI Workforce",
      description: "Fire your entire marketing department and replace them with AI employees who work 24/7, never call in sick, and execute flawlessly.",
      details: [
        "AI employees take over specific human marketing roles",
        "Complete workforce replacement, not just tools or automation",
        "5-minute setup, then the AI handles everything autonomously"
      ],
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "blue"
    },
    {
      id: "step-2",
      title: "Meet Your AI Employees",
      subtitle: "Your Digital Marketing Department",
      description: "Our AI platform consists of specialized employees with distinct roles—working 24/7/365 without office politics or miscommunication.",
      details: [
        "AI SEO Specialist: Researches keywords, optimizes content, builds backlinks 24/7",
        "AI Copywriter: Creates blogs, ads, emails, and social content at scale",
        "AI Ad Strategist: Manages budgets, tests variations, optimizes campaigns",
        "AI Analytics Expert: Analyzes performance and recommends optimizations",
        "AI Marketing Manager: Coordinates all AI employees without human input"
      ],
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "purple"
    },
    {
      id: "step-3",
      title: "AI Agent Collaboration",
      subtitle: "Seamless Communication & Coordination",
      description: "Unlike human teams with communication gaps, our AI employees share a unified intelligence to create perfectly aligned campaigns.",
      details: [
        "SEO AI instantly feeds insights to the Copywriter AI",
        "Ad Strategist AI coordinates with Content AI for promotions",
        "Analytics AI provides real-time feedback to all other AI agents",
        "The AI agent network makes thousands of micro-decisions per hour",
        "Complex marketing tasks completed in minutes instead of days or weeks"
      ],
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      ),
      color: "green"
    },
    {
      id: "step-4",
      title: "Autonomous Execution",
      subtitle: "24/7 Marketing Implementation",
      description: "Your AI workforce operates around the clock, executing tasks while you sleep. No direction or oversight needed.",
      details: [
        "Researches keywords and competitor strategies automatically",
        "Writes, edits, and publishes content across all channels",
        "Creates, tests, and optimizes ad campaigns continuously",
        "Adjusts budget allocation based on real-time performance data",
        "Updates strategies based on market changes without human input"
      ],
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "red"
    },
    {
      id: "step-5",
      title: "AI Decision Engine",
      subtitle: "Superhuman Marketing Intelligence",
      description: "Unlike human marketers with limited experience, our AI makes decisions by analyzing millions of data points in real-time.",
      details: [
        "Processes vast amounts of market and competitor data simultaneously",
        "No cognitive biases – decisions based purely on performance data",
        "Predictive intelligence anticipates market shifts before they happen",
        "Self-improvement – learns from every campaign, continuously improving",
        "Makes thousands of micro-optimizations per day humans would never catch"
      ],
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "amber"
    },
    {
      id: "step-6",
      title: "Your New Marketing Reality",
      subtitle: "A World Without Marketing Employees",
      description: "Your AI workforce autonomously launches campaigns, optimizes performance, and drives results while you focus on business growth.",
      details: [
        "New optimized content published daily without human input",
        "Ad campaigns constantly tested and refined for maximum ROI",
        "New market opportunities identified and targeted automatically",
        "Social media engagement handled 24/7 with perfect brand voice",
        "Complete analytics reports with actionable recommendations"
      ],
      icon: (
        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "teal"
    },
  ];

  // Set up scroll based animation
  useEffect(() => {
    // Update viewport height for mobile considerations
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };
    
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  // Set up scroll jacking with IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const sectionRefs = Array.from(containerRef.current.querySelectorAll('.step-section'));
    
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px",
      threshold: 0
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepIndex = parseInt(entry.target.getAttribute('data-step-index') || '0');
          setActiveStep(stepIndex);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sectionRefs.forEach(section => {
      observer.observe(section);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [viewportHeight]);
  
  // Helper function to get color class based on step
  const getColorClass = (color: string, element: 'bg' | 'text' | 'border', opacity?: number) => {
    const opacityClass = opacity ? `-${opacity}` : '';
    return `${element}-${color}${opacityClass}`;
  };

  return (
    <div ref={containerRef} className="relative bg-gray-50 dark:bg-neutral-950 pt-20 overflow-hidden">
      {/* Intro Section */}
      <div className="h-screen flex items-center justify-center text-center px-4 sticky top-0">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 px-3 py-1.5 text-base bg-primary/10 text-primary border-primary/20">
            Replace Your Marketing Team
          </Badge>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Fire Your Marketing Department.<br />
            <span className="text-primary">Hire Our AI Workforce</span> Instead.
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Not just automation—a true employee replacement. Our AI agents function as a 
            complete marketing department working 24/7/365, with no salary or benefits.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-800 dark:text-gray-200">Complete workforce replacement</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-800 dark:text-gray-200">True AI employees, not tools</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-gray-800 dark:text-gray-200">24/7 autonomous execution</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="animate-bounce mt-16 text-gray-400"
          >
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <p className="text-sm mt-2">Scroll to see how it works</p>
          </motion.div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col space-y-5">
          {timelineSteps.map((step, index) => (
            <button
              key={step.id}
              className="group flex items-center"
              onClick={() => {
                const element = document.getElementById(`section-${index}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === index 
                    ? getColorClass(step.color, 'bg') 
                    : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400"
                }`}
              />
              <div className={`ml-3 text-sm font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                activeStep === index 
                  ? getColorClass(step.color, 'text') 
                  : "text-gray-500"
              }`}>
                {step.title}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Step Sections */}
      {timelineSteps.map((step, index) => (
        <section
          id={`section-${index}`}
          key={step.id}
          data-step-index={index}
          className="step-section min-h-screen flex items-center justify-center px-4 sticky top-0"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <AnimatePresence mode="wait">
                  {activeStep === index && (
                    <motion.div
                      key={`content-${step.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="step-content"
                    >
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${getColorClass(step.color, 'bg', 100)}`}>
                        <div className={`${getColorClass(step.color, 'text')}`}>
                          {step.icon}
                        </div>
                      </div>
                      
                      <Badge className={`mb-4 px-3 py-1 ${getColorClass(step.color, 'bg', 100)} ${getColorClass(step.color, 'text')} ${getColorClass(step.color, 'border', 200)}`}>
                        Step {index + 1}
                      </Badge>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        {step.title}
                      </h2>
                      
                      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
                        {step.subtitle}
                      </h3>
                      
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        {step.description}
                      </p>
                      
                      <div className="space-y-4 mb-8">
                        {step.details.map((detail, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                          >
                            <div className={`flex-shrink-0 h-6 w-6 ${getColorClass(step.color, 'text')} mt-0.5`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="ml-3 text-base text-gray-700 dark:text-gray-300">
                              {detail}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="order-1 lg:order-2">
                <AnimatePresence mode="wait">
                  {activeStep === index && (
                    <motion.div
                      key={`visual-${step.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`rounded-2xl overflow-hidden shadow-2xl aspect-square flex items-center justify-center bg-gradient-to-br ${getColorClass(step.color, 'bg', 50)} to-white dark:to-black/50 p-8`}
                    >
                      {/* Here we would add illustrations for each step */}
                      <div className={`w-40 h-40 md:w-60 md:h-60 ${getColorClass(step.color, 'text')} opacity-90`}>
                        {step.icon}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      ))}
      
      {/* Call to Action */}
      <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-950 dark:to-black">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Badge className="mb-6 px-3 py-1.5 text-base bg-primary/10 text-primary border-primary/20">
              AI Workforce Replacement
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-white">
              Let AI Replace Your Marketing Employees
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                className="bg-white dark:bg-black/50 rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold text-primary mb-2">$0</h3>
                <p className="text-gray-700 dark:text-gray-300">Payroll Costs</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-black/50 rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold text-primary mb-2">24/7</h3>
                <p className="text-gray-700 dark:text-gray-300">Work Hours</p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-black/50 rounded-lg p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl font-bold text-primary mb-2">100%</h3>
                <p className="text-gray-700 dark:text-gray-300">Workforce Replacement</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Button size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary-dark transition-all">
                Replace Your Team Now
              </Button>
              
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                Join 2,500+ businesses that have already replaced their marketing employees with our AI workforce
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ScrollJackingTimeline;