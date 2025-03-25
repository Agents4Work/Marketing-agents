import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, PlusCircle, MinusCircle, HelpCircle } from "lucide-react";
import { 
  SHADOWS, 
  BORDERS, 
  BORDERS_RADIUS, 
  ANIMATIONS,
  BUTTON_3D_STYLES,
  CARD_3D_STYLES 
} from "@/styles/modern-3d-design-system";

// Define FAQ items with questions, answers, and categories
const faqItems = [
  {
    question: "How does AI replace my content team?",
    answer: "AI acts as a full-scale content production team, creating high-quality blogs, ads, SEO content, social media posts, and more. It handles the heavy lifting of content creation—so you don't need a large writing team. It writes, refines, and improves content instantly based on best practices. You still set the content direction—AI simply executes at an elite level.",
    category: "AI Functionality"
  },
  {
    question: "Will I still have control over my content?",
    answer: "100%—you approve, edit, and customize everything. AI generates content, but you make final decisions. You can adjust tone, style, and branding to match your company's voice. AI adapts to your inputs, feedback, and past content performance.",
    category: "Control"
  },
  {
    question: "What types of content can AI produce?",
    answer: "AI generates SEO blogs, ad copy, product descriptions, email sequences, and social media posts. It can write long-form articles, website copy, and landing pages. It creates engaging ad headlines, captions, and CTA-driven messaging. It generates social media content optimized for engagement. AI suggests keywords, hashtags, and formatting based on best practices.",
    category: "Capabilities"
  },
  {
    question: "Does AI understand my brand's tone and style?",
    answer: "Yes! AI learns and mimics your brand's voice. It analyzes your past content to ensure consistency. You can adjust tone settings (professional, casual, witty, etc.). AI can follow custom guidelines & company messaging preferences.",
    category: "Customization"
  },
  {
    question: "How many AI content specialists do I get?",
    answer: "20+ AI-powered agents, each specializing in different content tasks. AI Copywriter ✍️ → Writes high-converting ads & landing pages. AI SEO Specialist 🔎 → Optimizes content for Google rankings. AI Blog Writer 📄 → Produces high-quality long-form content. AI Social Media Creator 📢 → Generates captions, hashtags & images. AI Email Marketer 📧 → Crafts engaging email campaigns. AI Image Generator 🎨 → Creates high-quality branded visuals.",
    category: "Team Size"
  },
  {
    question: "How does AI ensure content quality?",
    answer: "AI is trained on millions of top-performing marketing pieces and constantly optimizes content based on real-world results. It cross-checks industry best practices and eliminates weak copy. AI learns from data, engagement metrics, and A/B tests to improve content over time. Human review is always available—you can refine AI's output as needed.",
    category: "Quality"
  },
  {
    question: "Does AI-generated content sound robotic?",
    answer: "No—AI writes in a natural, engaging way that feels human. It studies millions of human-written articles, blogs, and ads to mimic real writing styles. You can adjust tone settings (casual, professional, persuasive, etc.). AI avoids repetitive phrasing and uses diverse sentence structures.",
    category: "Quality"
  },
  {
    question: "Will AI content be unique?",
    answer: "Yes—AI generates original, plagiarism-free content. Every piece of content is created from scratch (not copied). AI cross-checks for duplication and ensures originality. You can use built-in plagiarism detection to verify uniqueness.",
    category: "Quality"
  },
  {
    question: "Is my data secure?",
    answer: "Yes—AI content production is fully secure and private. All content data is encrypted and protected with enterprise-grade security. AI never shares or exposes company-specific insights. Fully GDPR & CCPA compliant to meet global privacy standards.",
    category: "Security"
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes—AI content production is on-demand. No contracts. No hidden fees. Cancel or pause anytime. AI scales up or down based on business needs. Unlike human employees, there's no severance or rehiring process.",
    category: "Billing"
  }
];

const FaqSection: React.FC = () => {
  const [, setLocation] = useLocation();
  const [showChat, setShowChat] = React.useState(false);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className={`p-3 ${BORDERS_RADIUS.full} ${SHADOWS.md} bg-gradient-to-r from-blue-600/20 to-purple-600/20 ${BORDERS.light.md}`}>
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          
          <h2 className={`relative inline-block text-4xl md:text-5xl font-bold mb-6 bg-clip-text`}>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Have Questions?
            </span>
            <span className="relative ml-2">
              We've Got Answers
              <motion.div 
                className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </span>
            <div className={`absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[130%] rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl`} />
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto p-4 ${BORDERS_RADIUS.lg} backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 ${SHADOWS.sm}`}
          >
            Everything you need to know about AI-powered content creation
          </motion.p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            viewport={{ once: false, amount: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: false, amount: 0.1 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className={cn(
                      "mb-6 rounded-xl overflow-hidden",
                      "bg-white dark:bg-gray-800",
                      BORDERS.md,
                      SHADOWS.md,
                      "group hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-6 py-5 text-left hover:no-underline",
                        "data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-white dark:data-[state=open]:from-gray-900 dark:data-[state=open]:to-gray-800",
                        "transition-all duration-300",
                        "rounded-t-xl",
                        ANIMATIONS.transition.fast
                      )}
                    >
                      <div className="flex flex-col gap-2 relative">
                        <Badge
                          variant="outline"
                          className={`w-fit text-xs font-normal bg-primary/10 text-primary ${BORDERS.sm} px-3 py-1`}
                        >
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors duration-200">
                            {item.question}
                          </h3>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${BORDERS.light.sm} ${SHADOWS.sm} bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-700 transition-all duration-300 group-hover:bg-primary/10`}>
                          <PlusCircle className="h-5 w-5 text-primary flex-shrink-0 group-data-[state=open]:hidden" />
                          <MinusCircle className="h-5 w-5 text-primary flex-shrink-0 hidden group-data-[state=open]:block" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent 
                      className={`px-6 pt-4 pb-6 text-gray-600 dark:text-gray-300 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-900 rounded-b-lg`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`leading-relaxed p-4 ${BORDERS_RADIUS.lg} ${BORDERS.light.sm} ${SHADOWS.inner} bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm`}
                      >
                        <p>
                          {item.answer}
                        </p>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: false, amount: 0.8 }}
            className={`mt-16 text-center p-6 ${BORDERS.md} ${BORDERS_RADIUS.xl} ${SHADOWS.md} bg-gradient-to-br from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-800`}
          >
            <div className="absolute -z-10 top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            
            <div className={`text-xl mb-8 font-medium`}>
              Still have questions? <span className="relative text-blue-600 font-bold">
                We're here to help
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full block"></span>
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/sign-in")}
                size="lg" 
                className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white ${BORDERS.md} ${SHADOWS.md} ${ANIMATIONS.transition.default} hover:-translate-y-1 hover:shadow-lg group`}
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-r from-blue-700 to-blue-800 transition-transform duration-300"></div>
              </Button>
              
              <Button 
                onClick={() => setShowChat(true)}
                size="lg" 
                className={`gap-2 ${BUTTON_3D_STYLES.outline} ${ANIMATIONS.transition.default} ${ANIMATIONS.active.press}`}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Ask an Expert</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Chat Button (3D styled) */}
      {!showChat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowChat(true)}
              size="icon"
              className={`h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white ${BORDERS.md} ${SHADOWS.md} ${ANIMATIONS.transition.default} relative overflow-hidden group`}
            >
              <MessageCircle className="h-6 w-6 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-white/20 rounded-full blur-md"></div>
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Modern 3D Chat Modal (placeholder) */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 ${BORDERS_RADIUS.xl} ${SHADOWS.lg} z-50 ${BORDERS.md} overflow-hidden`}
        >
          <div className={`flex items-center justify-between p-4 border-b-2 border-black/80 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${BORDERS_RADIUS.full} ${BORDERS.sm} flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600`}>
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">Chat with AI Expert</h3>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowChat(false)}
              className={`h-7 w-7 ${BORDERS.sm} ${SHADOWS.sm} ${ANIMATIONS.active.press}`}
            >
              ✕
            </Button>
          </div>
          <div className={`p-6 h-80 flex items-center justify-center ${SHADOWS.inner} bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800`}>
            <div className={`text-center p-6 ${BORDERS.light.sm} ${BORDERS_RADIUS.lg} ${SHADOWS.soft} bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm`}>
              <div className="flex justify-center mb-4">
                <div className={`p-3 ${BORDERS_RADIUS.full} ${SHADOWS.sm} bg-gradient-to-br from-blue-500/20 to-purple-500/20`}>
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                This is a demo chat interface. In a real implementation, 
                you would connect this to your AI support system.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default FaqSection;