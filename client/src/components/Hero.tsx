import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Sparkles, Bot, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { SHADOWS, BORDERS, ANIMATIONS, BUTTON_3D_STYLES } from "@/styles/modern-3d-design-system";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [, setLocation] = useLocation();
  
  // Animation titles - English only
  const titles = useMemo(
    () => ["automated", "intelligent", "optimized", "scalable", "effortless"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button 
              className="
                gap-4 
                text-blue-600 
                dark:text-blue-400 
                border-2 
                border-black 
                shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] 
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]
                transform 
                hover:-translate-y-0.5 
                hover:-translate-x-0.5
                transition-all
                duration-200
                font-bold
                bg-white
                dark:bg-gray-800
              "
            >
              AI-Powered Marketing <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl sm:text-5xl md:text-7xl max-w-xl sm:max-w-2xl tracking-tighter text-center font-regular px-2">
              <span className="text-primary-600">Marketing that's </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center h-12 sm:h-16 md:h-20 md:pb-4 md:pt-1">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <div className="
              text-base
              sm:text-lg 
              md:text-xl 
              leading-relaxed 
              tracking-tight 
              text-muted-foreground 
              w-full
              max-w-xs
              sm:max-w-lg
              md:max-w-2xl 
              text-center 
              mt-8 
              px-4
              sm:px-6 
              py-6
              sm:py-8 
              rounded-xl 
              bg-gradient-to-r 
              from-blue-50 
              to-purple-50 
              border-2
              sm:border-3 
              border-black 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]
              sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
              mx-2
            ">
              <span className="block text-lg sm:text-xl font-bold text-indigo-700 mb-2">
                Marketing Team
              </span>
              <span className="text-gray-700">
                Replace your entire marketing department with a team of AI agents specialized in different marketing disciplines, working together to create integrated campaigns.
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-xs sm:max-w-2xl md:max-w-3xl mt-8 px-4 sm:px-0">
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="
                flex 
                flex-col 
                items-center 
                p-4
                sm:p-6 
                rounded-xl 
                overflow-hidden 
                border-2
                sm:border-3 
                border-black 
                shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
                transition-all
                duration-300
                mx-auto
                w-full
              "
              style={{ background: "linear-gradient(120deg, #e0f2fe, #dbeafe)" }}
            >
              <div className="bg-blue-500 rounded-full p-3 sm:p-4 mb-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg text-blue-700">Magical Helpers</h3>
              <p className="text-sm text-center text-blue-700 mt-2">AI assistants that understand your goals and execute tasks with precision</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="
                flex 
                flex-col 
                items-center 
                p-4
                sm:p-6 
                rounded-xl 
                overflow-hidden 
                border-2
                sm:border-3
                border-black 
                shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
                transition-all
                duration-300
                mx-auto
                w-full
              "
              style={{ background: "linear-gradient(120deg, #f3e8ff, #ede9fe)" }}
            >
              <div className="bg-purple-500 rounded-full p-3 sm:p-4 mb-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6l6 6-6 6M15 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-purple-700">Build Like Lego</h3>
              <p className="text-sm text-center text-purple-700 mt-2">Create custom workflows by connecting AI modules together like building blocks</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="
                flex 
                flex-col 
                items-center 
                p-4
                sm:p-6 
                rounded-xl 
                overflow-hidden 
                border-2
                sm:border-3
                border-black 
                shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
                transition-all
                duration-300
                mx-auto
                w-full
                sm:col-span-2
                md:col-span-1
              "
              style={{ background: "linear-gradient(120deg, #dcfce7, #d1fae5)" }}
            >
              <div className="bg-green-500 rounded-full p-3 sm:p-4 mb-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <BarChart4 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="font-bold text-lg text-green-700">Magical Results</h3>
              <p className="text-sm text-center text-green-700 mt-2">Track performance with real-time analytics and optimize campaigns automatically</p>
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 mt-8 w-full max-w-md sm:max-w-none mx-auto">
            <Button 
              onClick={() => setLocation("/sign-in")}
              className="
                gap-4 
                text-indigo-700 
                font-bold 
                border-2 
                border-black 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] 
                hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] 
                active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                transform 
                hover:-translate-y-0.5 
                hover:-translate-x-0.5 
                active:translate-y-0.5 
                active:translate-x-0.5
                transition-all 
                duration-200
                bg-white
                dark:bg-gray-800
                dark:text-indigo-400
                text-lg
                px-6
                py-3
                w-full sm:w-auto
              "
            >
              Learn More Powers <MoveRight className="w-4 h-4 flex-shrink-0" />
            </Button>
            
            <Button 
              onClick={() => setLocation("/sign-in")}
              className="
                gap-4 
                bg-blue-500 
                text-white 
                font-bold 
                border-2 
                border-black 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] 
                hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] 
                active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                transform 
                hover:-translate-y-0.5 
                hover:-translate-x-0.5 
                active:translate-y-0.5 
                active:translate-x-0.5
                transition-all 
                duration-200
                text-lg
                px-6
                py-3
                w-full sm:w-auto
              "
            >
              Try For Free <Sparkles className="w-4 h-4 flex-shrink-0" />
            </Button>
            
            <Button 
              onClick={() => setLocation("/sign-in")}
              className="
                relative 
                gap-4 
                px-6 
                py-6 
                text-xl 
                font-bold 
                bg-gradient-to-r 
                from-green-500 
                to-emerald-600 
                text-white
                border-3 
                border-black 
                shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] 
                hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] 
                active:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]
                transform 
                hover:-translate-y-1 
                hover:-translate-x-0.5 
                active:translate-y-0.5 
                active:translate-x-0.5
                transition-all 
                duration-200
                rounded-xl
                animate-pulse 
                hover:animate-none
                w-full sm:w-auto
              "
            >
              <span className="truncate">Create Magical Team</span>
              <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;