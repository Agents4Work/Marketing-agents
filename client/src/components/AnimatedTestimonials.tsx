import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { 
  SHADOWS, 
  BORDERS, 
  BORDERS_RADIUS, 
  ANIMATIONS, 
  BUTTON_3D_STYLES, 
  CARD_3D_STYLES 
} from "@/styles/modern-3d-design-system";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  company: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "Switching to AI marketing was the best business decision we've made. We've 3X'd our lead generation while cutting costs by 60%. The AI agents work 24/7 and deliver better results than our old team of 5 marketers.",
    name: "Sarah Johnson",
    designation: "Marketing Director",
    company: "TechFlow Solutions"
  },
  {
    quote: "We were skeptical about AI replacing our marketing team, but after seeing the results, we're true believers. Our conversion rates increased by 47% in just two months, and now we're scaling campaigns that would have taken months to set up manually.",
    name: "Michael Chen",
    designation: "CEO",
    company: "Horizon Ventures"
  },
  {
    quote: "As a small business, we could never afford a full marketing team. With AI marketing agents, we now have expert-level SEO, content creation, and ad management for a fraction of what one employee would cost. The ROI has been incredible.",
    name: "Lucia Rodriguez",
    designation: "Founder",
    company: "Artisan Boutique"
  },
  {
    quote: "The AI copywriter is a game-changer. It writes content that resonates with our audience better than anything we've created before. We've seen engagement rates increase by 85% across all our campaigns since implementing the AI marketing team.",
    name: "David Thompson",
    designation: "CMO",
    company: "EcoSense Brands"
  },
];

export const AnimatedTestimonials = ({
  autoplay = true,
  className,
}: {
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 8000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  return (
    <div className={`max-w-6xl mx-auto px-4 py-20 ${className}`}>
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className={`inline-block px-6 py-3 mb-4 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm} bg-gradient-to-r from-blue-500/10 to-purple-500/10`}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Businesses who've replaced traditional marketing with AI-powered automation
        </motion.p>
      </div>

      <div className={`relative grid grid-cols-1 gap-8 bg-white dark:bg-gray-900 ${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} p-6 md:p-10 overflow-hidden`}>
        {/* Decorative accent in the corner */}
        <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-30 blur-xl"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 relative">
              <div className={`p-4 rounded-full ${BORDERS.md} ${SHADOWS.sm} bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6 mx-auto`}>
                <Quote className="h-8 w-8 text-primary" />
              </div>
              
              <motion.div
                className={`text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto ${BORDERS_RADIUS.lg} p-6 relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${BORDERS.light.sm} ${SHADOWS.soft}`}
              >
                {testimonials[active].quote.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <motion.div 
              className={`mt-6 ${BORDERS.md} ${BORDERS_RADIUS.lg} ${SHADOWS.sm} p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transform transition-all duration-300 hover:-translate-y-1`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {testimonials[active].name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {testimonials[active].designation}, {testimonials[active].company}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className={`h-10 w-10 rounded-full flex items-center justify-center ${BUTTON_3D_STYLES.outline} ${ANIMATIONS.transition.default} ${ANIMATIONS.active.press}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`h-3 ${BORDERS.sm} transition-all ${
                  active === index
                    ? `w-10 bg-gradient-to-r from-blue-500 to-purple-500 ${BORDERS_RADIUS.full}`
                    : `w-3 bg-gray-300 dark:bg-gray-700 ${BORDERS_RADIUS.full}`
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className={`h-10 w-10 rounded-full flex items-center justify-center ${BUTTON_3D_STYLES.outline} ${ANIMATIONS.transition.default} ${ANIMATIONS.active.press}`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;