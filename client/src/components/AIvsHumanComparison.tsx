import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Clock, Zap, Brain, BarChart, Layers, DollarSign, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  SHADOWS, 
  BORDERS, 
  BORDERS_RADIUS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES, 
  CARD_3D_STYLES 
} from "@/styles/modern-3d-design-system";
// No translation imports needed

// Hardcoded comparison data with direct English text
const comparisonData = [
  {
    category: "Cost",
    icon: <DollarSign className="h-6 w-6" />,
    ai: {
      title: "Fixed Monthly Subscription",
      description: "Predictable cost that scales with your business needs. No benefits, overtime, or HR overhead."
    },
    human: {
      title: "Expensive Full-Time Salary",
      description: "High costs including salary, benefits, office space, equipment, and ongoing training expenses."
    },
    aiAdvantage: "AI costs 90% less than traditional marketing employees with predictable monthly pricing"
  },
  {
    category: "Work Hours",
    icon: <Clock className="h-6 w-6" />,
    ai: {
      title: "24/7 Execution",
      description: "Works around the clock without breaks, vacations, or sick days. Always available when you need it."
    },
    human: {
      title: "Limited Hours",
      description: "Standard 40-hour work week with time off, vacations, and sick days. Limited availability."
    },
    aiAdvantage: "AI works tirelessly 24/7/365 with no downtime or vacation"
  },
  {
    category: "Knowledge",
    icon: <Brain className="h-6 w-6" />,
    ai: {
      title: "Trained on Marketing Best Practices",
      description: "Leverages knowledge from millions of marketing campaigns to create optimized content for your specific needs."
    },
    human: {
      title: "Limited by Personal Experience",
      description: "Knowledge limited to personal experience and can only keep up with a fraction of new marketing trends."
    },
    aiAdvantage: "AI has been trained on millions of successful marketing campaigns across all industries"
  },
  {
    category: "Speed",
    icon: <Zap className="h-6 w-6" />,
    ai: {
      title: "Instant Execution",
      description: "Creates campaigns, analyzes data, and generates content in seconds rather than hours or days."
    },
    human: {
      title: "Slow Manual Processes",
      description: "Takes hours or days to complete tasks that AI can do in seconds. Limited by human typing speed."
    },
    aiAdvantage: "AI completes marketing tasks in seconds that would take humans hours or days"
  },
  {
    category: "Optimization",
    icon: <BarChart className="h-6 w-6" />,
    ai: {
      title: "Real-Time Testing & Optimization",
      description: "Constantly tests variations and optimizes campaigns in real-time based on performance data."
    },
    human: {
      title: "Manual Trial & Error",
      description: "Limited ability to test variations, with slow implementation and analysis of results."
    },
    aiAdvantage: "AI continuously tests and optimizes content in real-time for maximum performance"
  },
  {
    category: "Scalability",
    icon: <Layers className="h-6 w-6" />,
    ai: {
      title: "Unlimited Capacity",
      description: "Handles increasing workloads without adding costs. One platform can do the work of an entire team."
    },
    human: {
      title: "Team Size Limits Output",
      description: "Scaling requires hiring more team members, leading to increased costs and management complexity."
    },
    aiAdvantage: "AI scales instantly to handle any workload without hiring additional staff"
  },
];

const AIvsHumanComparison = () => {
  const [, setLocation] = useLocation();
  const [currentCategory, setCurrentCategory] = useState(0);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: false, amount: 0.2 });

  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % comparisonData.length);
  };

  const prevCategory = () => {
    setCurrentCategory((prev) => (prev - 1 + comparisonData.length) % comparisonData.length);
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-24 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900"
    >
      <div className="container mx-auto px-4">
        <div ref={titleRef} className="text-center mb-16 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Hire the Smartest AI Marketing Team on the Planet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            Our AI agents work 24/7 to grow your business at a fraction of the cost of human employees
          </motion.p>
        </div>

        {/* Mobile Comparison Carousel */}
        <div className="md:hidden mb-12">
          <div className={`relative bg-white dark:bg-gray-900 overflow-hidden ${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <div className="flex items-center mb-4 text-primary">
                  <div className={`p-2 ${BORDERS.sm} ${BORDERS_RADIUS.md} bg-primary/10 text-primary ${SHADOWS.sm}`}>
                    {comparisonData[currentCategory].icon}
                  </div>
                  <h3 className="text-xl font-semibold ml-3">{comparisonData[currentCategory].category}</h3>
                </div>
                
                <div className="mb-8 space-y-6">
                  <div className={`mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm} transform transition-all duration-200 hover:-translate-y-1`}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center bg-blue-500 text-white p-2 rounded-full mr-2 ${BORDERS.sm} border-black`}>AI</div>
                      <h4 className="font-bold">{comparisonData[currentCategory].ai.title}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 ml-10">
                      {comparisonData[currentCategory].ai.description}
                    </p>
                  </div>
                  
                  <div className={`bg-gray-50 dark:bg-gray-800 p-4 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm} transform transition-all duration-200 hover:-translate-y-1`}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center bg-gray-500 text-white p-2 rounded-full mr-2 ${BORDERS.sm} border-black`}>👤</div>
                      <h4 className="font-bold">{comparisonData[currentCategory].human.title}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 ml-10">
                      {comparisonData[currentCategory].human.description}
                    </p>
                  </div>
                </div>
                
                <div className={`bg-green-50 dark:bg-green-900/20 p-3 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm} text-center font-medium text-green-700 dark:text-green-400`}>
                  ✓ {comparisonData[currentCategory].aiAdvantage}
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className={`flex justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 ${BORDERS.prominent} border-b-0 border-l-0 border-r-0`}>
              <button 
                onClick={prevCategory}
                className={`p-2 rounded-full bg-white dark:bg-gray-700 ${BUTTON_3D_STYLES.outline} ${ANIMATIONS.transition.default} flex items-center justify-center`}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-bold">
                {currentCategory + 1} / {comparisonData.length}
              </div>
              <button 
                onClick={nextCategory}
                className={`p-2 rounded-full bg-white dark:bg-gray-700 ${BUTTON_3D_STYLES.outline} ${ANIMATIONS.transition.default} flex items-center justify-center`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Comparison Table */}
        <div className="hidden md:block overflow-hidden">
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="p-4"></div>
            <div className={`p-4 text-center font-bold text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} transform transition-all duration-300 hover:-translate-y-1`}>
              AI Agents
            </div>
            <div className={`p-4 text-center font-bold text-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} transform transition-all duration-300 hover:-translate-y-1 hover:scale-[0.98]`}>
              Human Employees
            </div>
          </div>

          {comparisonData.map((item: any, index: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
              key={index}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              <div className={`flex items-center p-4 bg-gray-50 dark:bg-gray-900 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm}`}>
                <div className={`p-2 ${BORDERS.sm} ${BORDERS_RADIUS.md} bg-primary/10 text-primary mr-3 ${SHADOWS.sm}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold">{item.category}</h3>
              </div>
              
              <div className={`group p-5 bg-blue-50 dark:bg-blue-900/20 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} transform transition-all duration-300 hover:-translate-y-1 hover:${SHADOWS.lg}`}>
                <h4 className="font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  {item.ai.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.ai.description}
                </p>
              </div>
              
              <div className={`group p-5 bg-gray-100 dark:bg-gray-800 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} transform transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 dark:hover:bg-gray-700`}>
                <h4 className="font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                  {item.human.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.human.description}
                </p>
              </div>
            </motion.div>
          ))}
          
          <div className="grid grid-cols-3 gap-6 mt-10">
            <div></div>
            <div className={`col-span-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-5 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.md} text-center`}>
              <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
                AI costs 90% less than traditional marketing employees with predictable monthly pricing
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false, amount: 0.8 }}
          className={`text-center mt-20 max-w-3xl mx-auto p-10 ${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800`}
        >
          <motion.div 
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 relative inline-block">
              Traditional Hiring is Dead in the Age of AI
            </h3>
          </motion.div>
          <p className="text-xl mb-10 text-gray-600 dark:text-gray-400">
            Your competitors are already using AI to outperform and outpace human marketing teams
          </p>
          <Button 
            onClick={() => setLocation("/sign-in")}
            size="lg" 
            className={`${BUTTON_3D_STYLES.primary} ${ANIMATIONS.hover.scale} ${ANIMATIONS.active.press} px-8 py-6 text-lg`}
          >
            Build Your AI Team Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default AIvsHumanComparison;