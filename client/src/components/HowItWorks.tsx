import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SHADOWS, BORDERS, ANIMATIONS, BUTTON_3D_STYLES, CARD_3D_STYLES } from "@/styles/modern-3d-design-system";

type Step = {
  number: number;
  title: string;
  description: string;
  tagline: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    number: 1,
    title: "Choose What You Need",
    description: "Tell AI what marketing channels to focus on—SEO, paid ads, content, email, or all of them at once.",
    tagline: "Your AI workforce specializes in everything marketing.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    number: 2,
    title: "AI Copywriting & Content Creation",
    description: "Generate high-converting copy, blog posts, and ads in seconds with AI-driven content creation.",
    tagline: "Never write copy or hire copywriters again.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    number: 3,
    title: "Automate Workflows & Execution",
    description: "AI agents handle everything from campaign setup to real-time adjustments across all platforms.",
    tagline: "Your AI team manages everything, so you never touch a campaign again.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    number: 4,
    title: "Your AI Employees Work 24/7",
    description: "No hiring, no salaries—AI-powered employees execute marketing strategies around the clock, without breaks.",
    tagline: "Marketing that never sleeps, never asks for a raise, and never takes vacations.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    number: 5,
    title: "Real-Time Optimization",
    description: "AI learns, adapts, and improves performance based on live data—constantly maximizing your ROI.",
    tagline: "AI runs, tests, and refines campaigns—beating human marketers at their own game.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    number: 6,
    title: "See Everything in One Dashboard",
    description: "Track results, tweak strategies, and scale effortlessly with a centralized command center.",
    tagline: "Complete visibility with zero complexity—just results.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

const StepCard = ({ step, isEven }: { step: Step, isEven: boolean }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.5 });
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''} mb-20 last:mb-0`}
    >
      {/* Step Icon */}
      <div className="w-full md:w-1/3 mb-6 md:mb-0">
        <div className={`
          ${CARD_3D_STYLES.base}
          bg-white 
          dark:bg-gray-800 
          p-8 
          mx-auto 
          max-w-xs 
          flex 
          flex-col 
          items-center 
          justify-center 
          ${isEven ? 'md:ml-8' : 'md:mr-8'}
        `}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`
              text-primary 
              h-20 
              w-20 
              flex 
              items-center 
              justify-center 
              bg-blue-100 
              dark:bg-blue-900/30 
              rounded-full 
              mb-4 
              ${BORDERS.md} 
              ${SHADOWS.md}
            `}
          >
            {step.icon}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className={`
              text-lg 
              font-bold 
              py-1 
              px-4 
              rounded-lg 
              bg-blue-500 
              text-white 
              ${BORDERS.sm} 
              ${SHADOWS.sm}
            `}
          >
            Step {step.number}
          </motion.div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="w-full md:w-2/3 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, x: isEven ? 20 : -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? 20 : -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3 text-lg">{step.description}</p>
          <p className="text-primary italic font-medium bg-blue-50 dark:bg-blue-900/20 py-2 px-3 rounded-lg border border-blue-200 dark:border-blue-800">✨ {step.tagline}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const HowItWorks = () => {
  const [, setLocation] = useLocation();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: false, amount: 0.2 });
  
  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className={`
              inline-block
              px-6
              py-3
              mb-4
              ${BORDERS.md}
              ${SHADOWS.md}
              bg-blue-500
              rounded-xl
              transform 
              rotate-[-1deg]
            `}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white">
              How It Works
            </h2>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 mt-6"
          >
            AI Handles Everything – <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">So You Can Focus on Growth</span>
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`
              text-xl 
              text-gray-700 
              dark:text-gray-300 
              max-w-3xl 
              mx-auto 
              p-4 
              rounded-xl 
              ${BORDERS.sm}
              bg-gray-50
              dark:bg-gray-800/50
            `}
          >
            Our AI marketing workforce replaces human teams with a fully automated system that works 24/7.
          </motion.div>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} isEven={index % 2 !== 0} />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-center mt-16"
        >
          <div className={`
            p-6 
            bg-white/80
            dark:bg-gray-800/80 
            backdrop-blur-sm 
            rounded-xl 
            ${BORDERS.md} 
            ${SHADOWS.lg}
            max-w-xl 
            mx-auto
          `}>
            <p className="text-xl mb-6 font-bold">AI is ready to run your marketing. Let's build your first campaign.</p>
            <Button 
              onClick={() => setLocation("/sign-in")}
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
              Get Started with AI Marketing
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;