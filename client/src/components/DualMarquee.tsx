import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  AnimatePresence,
} from "framer-motion";
import { wrap } from "@motionone/utils";
import { cn } from "@/lib/utils";

// Horizontal scrolling marquee component
const ScrollingMarquee = ({ 
  children, 
  baseVelocity = 5 
}: { 
  children: React.ReactNode; 
  baseVelocity?: number;
}) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(0, -100, v)}%`);

  useAnimationFrame((t, delta) => {
    const moveBy = -baseVelocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        <span className="block mr-6 font-medium">{children}</span>
        <span className="block mr-6 font-medium">{children}</span>
        <span className="block mr-6 font-medium">{children}</span>
        <span className="block mr-6 font-medium">{children}</span>
      </motion.div>
    </div>
  );
};

type PremiumMarqueeProps = {
  messages: string[];
  transitionDuration?: number;
};

function PremiumMarquee({
  messages = [
    "Scale your brand without hiring a single marketer",
    "AI works 24/7—your marketing never stops growing!",
    "24/7 marketing execution",
    "AI maximizes ROI automatically"
  ],
  transitionDuration = 5
}: PremiumMarqueeProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Automatically transition between messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, transitionDuration * 1000);
    
    return () => clearInterval(interval);
  }, [messages.length, transitionDuration]);

  // Modern color themes with gradient backgrounds
  const themes = [
    {
      bg: "linear-gradient(135deg, #1a365d 0%, #2563eb 100%)",
      textColor: "white"
    },
    {
      bg: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
      textColor: "white"
    },
    {
      bg: "linear-gradient(135deg, #7928ca 0%, #4f46e5 100%)",
      textColor: "white"
    },
    {
      bg: "linear-gradient(135deg, #991b1b 0%, #f97316 100%)",
      textColor: "white"
    }
  ];

  return (
    <div className="overflow-hidden relative">
      {/* Premium background with subtle pattern */}
      <div className="absolute inset-0 bg-black opacity-5 
                     [mask-image:repeating-linear-gradient(45deg,_#000_0px,_#000_1px,_transparent_1px,_transparent_6px)]">
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center justify-center min-h-[100px] py-4 px-4"
          style={{ 
            background: themes[currentMessageIndex % themes.length].bg,
            color: themes[currentMessageIndex % themes.length].textColor,
          }}
        >
          <ScrollingMarquee baseVelocity={3}>
            {messages[currentMessageIndex]}
          </ScrollingMarquee>
          
          <div className="mt-2 flex space-x-1">
            {messages.map((_, idx) => (
              <span 
                key={idx} 
                className={cn(
                  "inline-block h-1 rounded-full transition-all duration-300 w-4",
                  idx === currentMessageIndex ? "bg-white opacity-90" : "bg-white opacity-30"
                )}
              ></span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DualMarquee() {
  return <PremiumMarquee 
    messages={[
      "Scale your brand without hiring a single marketer",
      "AI works 24/7—your marketing never stops growing!",
      "24/7 marketing execution",
      "AI maximizes ROI automatically"
    ]} 
  />;
}

export { PremiumMarquee, DualMarquee };