import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  FileText, 
  Image, 
  Search, 
  LineChart, 
  Mail, 
  MousePointer, 
  BarChart, 
  Users, 
  BrainCircuit
} from "lucide-react";
import { useLocation } from "wouter";

import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { SHADOWS, BORDERS, ANIMATIONS, BUTTON_3D_STYLES, CARD_3D_STYLES } from "@/styles/modern-3d-design-system";

// These are AI agents that function as employees, not just features
const aiAgents = [
  {
    title: "Hire AI Copywriter",
    description: "Your 24/7 content creator. Writes blogs, ads & emails without breaks or salary.",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Hire AI Designer",
    description: "Your creative professional. Creates stunning visuals without the agency fees.",
    icon: <Image className="w-6 h-6" />,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Hire AI SEO Expert",
    description: "Your ranking specialist. Outranks competitors while you focus on growth.",
    icon: <Search className="w-6 h-6" />,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Hire AI Ad Manager",
    description: "Your campaign optimizer. Manages ad spend with better ROI than human teams.",
    icon: <LineChart className="w-6 h-6" />,
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    title: "Hire AI Email Pro",
    description: "Your email marketing team. Writes, tests & sends emails that get responses.",
    icon: <Mail className="w-6 h-6" />,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "Hire AI Analyst",
    description: "Your data scientist. Uncovers growth opportunities humans would miss.",
    icon: <BarChart className="w-6 h-6" />,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "Hire AI Strategy Team",
    description: "Replace your entire marketing department with an AI team that never sleeps.",
    icon: <Users className="w-6 h-6" />,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Build Custom AI Agent",
    description: "Design your perfect AI employee with exactly the skills your business needs.",
    icon: <BrainCircuit className="w-6 h-6" />,
    color: "bg-teal-500/10 text-teal-500",
  },
];

const KeyFeatures = () => {
  const [, setLocation] = useLocation();
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: false, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
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
              bg-purple-500
              rounded-xl
              transform 
              rotate-[1deg]
            `}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white">
              AI Marketing Team
            </h2>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 mt-6"
          >
            Hire <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">AI Employees</span> For Your Business
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
            Hire AI agents that work like employees—no salaries, no breaks, just incredible results
          </motion.div>
        </div>

        <BentoGrid className="max-w-7xl mx-auto">
          {aiAgents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.1 }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 } 
              }}
              className={`
                ${CARD_3D_STYLES.base}
                ${BORDERS.md}
                ${SHADOWS.md}
                transition-all duration-300
                hover:shadow-xl
                transform-gpu
              `}
            >
              <BentoCard
                title={agent.title}
                description={agent.description}
                icon={
                  <div className={`
                    p-3 
                    rounded-lg 
                    ${BORDERS.sm}
                    ${agent.color}
                  `}>
                    {agent.icon}
                  </div>
                }
                href="/sign-in"
                cta={
                  <span className={`
                    ${BUTTON_3D_STYLES.base}
                    ${BUTTON_3D_STYLES.primary}
                    px-4 py-2
                    text-sm
                    font-medium
                    rounded-md
                    inline-block
                  `}>
                    Hire Now
                  </span>
                }
                className={`
                  backdrop-blur-sm
                  bg-white/70
                  dark:bg-gray-800/70
                `}
              />
            </motion.div>
          ))}
        </BentoGrid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.8 }}
          className={`
            text-center 
            mt-16 
            p-8 
            ${BORDERS.lg} 
            ${SHADOWS.lg} 
            bg-gradient-to-r
            from-blue-500/10
            to-purple-500/10
            backdrop-blur-sm
            rounded-xl
            max-w-3xl
            mx-auto
          `}
        >
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`
              text-2xl 
              mb-8 
              font-bold
              py-3
              px-4
              ${BORDERS.md}
              ${SHADOWS.sm}
              bg-white/80
              dark:bg-gray-800/80
              rounded-lg
              inline-block
            `}
          >
            Smart companies are replacing expensive human teams with AI agents. 
            <span className="block mt-2 text-primary font-black">Will you?</span>
          </motion.p>
          
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
            Build Your AI Team Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default KeyFeatures;