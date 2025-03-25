import React from 'react';
import { HeroHighlight, Highlight } from './HeroHighlight';
import { SHADOWS, BORDERS, ANIMATIONS, CARD_3D_STYLES } from '@/styles/modern-3d-design-system';

const GlitchText = ({ text }: { text: string }) => {
  return (
    <span className="relative inline-block text-glitch">
      {text}
    </span>
  );
};

const PainPoint = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <li 
      className={`
        flex 
        items-start 
        mb-4 
        opacity-0 
        animate-fadeInLeft
        p-3
        ${BORDERS.sm}
        ${SHADOWS.sm}
        bg-white/70
        dark:bg-gray-800/70
        backdrop-blur-sm
        rounded-lg
        transform
        transition-all
        duration-300
        hover:scale-105
        hover:rotate-[-0.5deg]
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className={`
        text-red-500 
        mr-3 
        text-xl
        flex
        items-center
        justify-center
        h-7
        w-7
        bg-red-100
        dark:bg-red-900/30
        ${BORDERS.sm}
        rounded-full
      `}>✗</span>
      <span>{children}</span>
    </li>
  );
};

const MarketingProblemSection = () => {
  return (
    <HeroHighlight containerClassName="py-20 h-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className={`text-center mb-14 ${ANIMATIONS.fadeIn} animate-fadeIn`}>
          <div className={`
            inline-block
            p-2
            mb-6
            ${BORDERS.md}
            ${SHADOWS.md}
            bg-red-500
            rounded-xl
            transform 
            rotate-[-1deg]
          `}>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Marketing is <GlitchText text="Broken" />
            </h2>
          </div>
          
          <div className={`
            inline-block
            p-2
            mb-6
            ml-4
            ${BORDERS.md}
            ${SHADOWS.md}
            bg-green-500
            rounded-xl
            transform 
            rotate-[1deg]
          `}>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              <Highlight>AI Fixes It</Highlight>
            </h2>
          </div>
          
          <p className={`
            text-lg 
            text-gray-700
            dark:text-gray-300 
            max-w-3xl 
            mx-auto
            p-4
            mt-8
            ${BORDERS.md}
            ${SHADOWS.sm}
            bg-white/80
            dark:bg-gray-800/50
            backdrop-blur-sm
            rounded-xl
          `}>
            Today's businesses waste time and resources on outdated marketing methods that deliver diminishing returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div 
            className={`
              ${CARD_3D_STYLES.base}
              bg-white/50 dark:bg-black/50 
              backdrop-blur-sm p-8 
              ${ANIMATIONS.fadeInUp} animate-fadeInUp
            `}
          >
            <h3 className="text-2xl font-semibold mb-6 text-red-600 dark:text-red-400">The Problems</h3>
            <ul className="space-y-4 text-lg">
              <PainPoint delay={0.2}>Marketing is <strong>expensive and inefficient</strong>, with unpredictable ROI.</PainPoint>
              <PainPoint delay={0.4}>Producing high-quality <strong>content, ads, and copy</strong> requires specialized skills.</PainPoint>
              <PainPoint delay={0.6}>Hiring skilled talent is <strong>costly</strong> and takes too long.</PainPoint>
              <PainPoint delay={0.8}>Without the right team, businesses <strong>waste time and money</strong> on tactics that don't convert.</PainPoint>
            </ul>
            
            <div 
              className={`
                mt-8 
                opacity-0
                ${ANIMATIONS.fadeIn}
                animate-fadeIn
                transform
                rotate-[-1deg]
              `}
              style={{ animationDelay: '1.2s' }}
            >
              <p className={`
                text-lg 
                italic 
                font-medium
                p-4
                ${BORDERS.md}
                ${SHADOWS.md}
                bg-red-50
                dark:bg-red-900/20
                text-gray-700 
                dark:text-gray-300
                rounded-lg
                relative
                before:content-['"']
                before:absolute
                before:top-0
                before:left-4
                before:text-3xl
                before:text-red-400
                before:font-serif
                before:font-bold
                before:opacity-50
                after:content-['"']
                after:absolute
                after:bottom-0
                after:right-4
                after:text-3xl
                after:text-red-400
                after:font-serif
                after:font-bold
                after:opacity-50
              `}>
                Sticking to outdated methods means falling behind competitors.
              </p>
            </div>
          </div>
          
          <div 
            className={`
              ${CARD_3D_STYLES.base}
              bg-white/50 dark:bg-black/50 
              backdrop-blur-sm p-8 
              ${ANIMATIONS.fadeInUp} animate-fadeInUp
            `}
            style={{ animationDelay: '0.4s' }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-primary">The AI Solution</h3>
            <div 
              className={`
                relative 
                opacity-0 
                scale-95 
                ${ANIMATIONS.scaleIn} 
                animate-scaleIn
              `}
              style={{ animationDelay: '0.6s' }}
            >
              <div className={`
                rounded-lg 
                overflow-hidden 
                relative 
                aspect-video 
                bg-gradient-to-br 
                from-indigo-50 
                to-purple-100 
                dark:from-indigo-900 
                dark:to-purple-900 
                flex 
                items-center 
                justify-center
                ${BORDERS.md}
                ${SHADOWS.md}
              `}>
                <div className="absolute inset-0 flex items-center justify-center flex-col p-4">
                  <div 
                    className={`
                      text-center 
                      opacity-0 
                      ${ANIMATIONS.fadeInUp} 
                      animate-fadeInUp
                    `}
                    style={{ animationDelay: '0.8s' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="text-xl font-bold mb-2">AI-Powered Marketing Team</h4>
                    <p className="text-sm md:text-base">Our platform deploys a complete AI workforce that works 24/7, scales instantly, and never requires hiring, training or management.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <ul 
              className={`
                mt-6 
                space-y-3 
                opacity-0 
                ${ANIMATIONS.fadeIn} 
                animate-fadeIn
              `}
              style={{ animationDelay: '1s' }}
            >
              {[
                "Produces high-quality content at scale",
                "Optimizes campaigns continuously",
                "Adapts to your brand voice and audience",
                "Works across all marketing channels"
              ].map((item, index) => (
                <li 
                  key={index}
                  className={`
                    flex 
                    items-start 
                    opacity-0 
                    animate-fadeInLeft
                    p-3
                    ${BORDERS.sm}
                    ${SHADOWS.sm}
                    bg-white/70
                    dark:bg-gray-800/70
                    backdrop-blur-sm
                    rounded-lg
                    transform
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:rotate-[0.5deg]
                  `}
                  style={{ animationDelay: `${1 + (index * 0.1)}s` }}
                >
                  <span className={`
                    text-green-500 
                    mr-3 
                    text-xl
                    flex
                    items-center
                    justify-center
                    h-7
                    w-7
                    bg-green-100
                    dark:bg-green-900/30
                    ${BORDERS.sm}
                    rounded-full
                  `}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </HeroHighlight>
  );
};

// Add CSS for GlitchText to index.css using the class name
const glitchTextStyle = `
@keyframes textGlitch {
  0% {
    filter: blur(0px);
    transform: translate(0, 0);
  }
  20% {
    filter: blur(2px);
    transform: translate(-2px, 1px);
  }
  30% {
    filter: blur(0px);
    transform: translate(3px, -1px);
  }
  40% {
    filter: blur(3px);
    transform: translate(-3px, 2px);
  }
  100% {
    filter: blur(0px);
    transform: translate(0, 0);
  }
}

.text-glitch {
  animation: textGlitch 2.5s ease-in-out infinite alternate;
}
`;

// Find and add this to index.css if not present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = glitchTextStyle;
  document.head.appendChild(style);
}

export default MarketingProblemSection;