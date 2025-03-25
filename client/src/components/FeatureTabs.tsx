import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ANIMATIONS, SHADOWS, BORDERS, CARD_3D_STYLES } from '@/styles/modern-3d-design-system';
import { useLocation } from 'wouter';

interface TabContentProps {
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  ctaText: string;
  onCtaClick: () => void;
  imageAlt: string;
}

const FeatureTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [, setLocation] = useLocation();

  const tabs = [
    {
      badge: "Automated Marketing Workforce",
      title: "Your AI Marketing Team, Ready to Work",
      description: "Your business just onboarded an unstoppable marketing team—AI employees that execute ads, SEO, and content 24/7. No hiring. No salaries. Just pure performance.",
      benefits: [
        "Hire AI employees that run your marketing 24/7—no salaries, no breaks, just results.",
        "They strategize, execute, and optimize like a world-class team—fully automated.",
        "Smarter than any human, working faster than any agency."
      ],
      ctaText: "Hire AI Employees Now",
      imageAlt: "A futuristic AI-powered marketing team in action"
    },
    {
      badge: "Optimized for ROI",
      title: "Marketing at a Fraction of the Cost",
      description: "AI replaces expensive agencies and in-house teams, running hyper-efficient campaigns that deliver results while cutting costs.",
      benefits: [
        "Save thousands—AI delivers expert marketing for less than a single hire.",
        "No wasted ad spend—every campaign is optimized for max ROI.",
        "Scale without extra costs—AI works smarter, not harder."
      ],
      ctaText: "Calculate Your Savings",
      imageAlt: "A sleek dashboard showing AI-driven cost savings"
    },
    {
      badge: "AI-Powered Domination",
      title: "Unmatched Competitive Advantage",
      description: "AI doesn't just help you keep up—it puts you ahead. While others struggle with slow execution and human limitations, your AI team is running, learning, and scaling in real-time.",
      benefits: [
        "AI executes campaigns instantly—no delays, no bottlenecks.",
        "Outpace competitors—AI optimizes faster than any human team.",
        "Stay ahead—AI continuously learns and improves performance."
      ],
      ctaText: "Dominate Your Industry",
      imageAlt: "An AI-driven business soaring ahead of competitors"
    }
  ];

  // Generate image placeholder with gradient patterns
  const getImageBackground = (index: number) => {
    const backgrounds = [
      "bg-gradient-to-br from-blue-600 to-indigo-900",
      "bg-gradient-to-br from-emerald-600 to-teal-900",
      "bg-gradient-to-br from-purple-600 to-violet-900"
    ];
    return backgrounds[index % backgrounds.length];
  };
  
  // Tab illustrations based on index
  const getIllustration = (index: number) => {
    if (index === 0) {
      return (
        <div className="relative w-full h-full p-6 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid-pattern)"></rect>
            </svg>
          </div>
          <div className="relative z-10 text-white flex flex-col items-center space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <span className="text-white/80 uppercase tracking-wider text-sm font-semibold">AI Marketing Team</span>
            <div className="w-32 h-1 bg-gradient-to-r from-white/0 via-white/80 to-white/0"></div>
          </div>
        </div>
      );
    } else if (index === 1) {
      return (
        <div className="relative w-full h-full p-6 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="none" stroke="white" strokeWidth="0.5"></circle>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#circles)"></rect>
            </svg>
          </div>
          <div className="relative z-10 text-white flex flex-col items-center max-w-xs">
            <div className="w-full p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium">Marketing Cost</div>
                <div className="text-white/60 text-xs">-78%</div>
              </div>
              <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[22%] bg-gradient-to-r from-white/80 to-white/50 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3">
                <div className="text-xs text-white/70 mb-1">Traditional</div>
                <div className="text-lg font-bold">$8,500</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3">
                <div className="text-xs text-white/70 mb-1">AI Marketing</div>
                <div className="text-lg font-bold">$1,899</div>
              </div>
            </div>
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 w-full">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">ROI Increase</div>
                <div className="text-white/90 font-semibold text-sm">+320%</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-full p-6 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white"></circle>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)"></rect>
            </svg>
          </div>
          <div className="relative z-10 text-white">
            <div className="flex space-x-2 items-end mb-6">
              <div className="w-12 h-20 bg-white/10 backdrop-blur-sm rounded-t-lg border border-white/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-[25%] bg-white/30"></div>
                <span className="absolute bottom-2 text-xs font-medium">Comp</span>
              </div>
              <div className="w-12 h-32 bg-white/10 backdrop-blur-sm rounded-t-lg border border-white/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-[40%] bg-white/30"></div>
                <span className="absolute bottom-2 text-xs font-medium">Comp</span>
              </div>
              <div className="w-12 h-24 bg-white/10 backdrop-blur-sm rounded-t-lg border border-white/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-[30%] bg-white/30"></div>
                <span className="absolute bottom-2 text-xs font-medium">Comp</span>
              </div>
              <div className="w-12 h-44 bg-white/10 backdrop-blur-sm rounded-t-lg border border-white/20 flex items-center justify-center relative overflow-hidden glow">
                <div className="absolute bottom-0 w-full h-[90%] bg-gradient-to-t from-white/50 to-white/10"></div>
                <span className="absolute bottom-2 text-xs font-medium">YOU</span>
                <div className="absolute top-2 left-0 right-0 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="uppercase tracking-wider text-sm font-semibold mb-1">Competitive Edge</div>
              <div className="w-full h-1 bg-gradient-to-r from-white/0 via-white/80 to-white/0"></div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-Powered Marketing That Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our platform delivers premium marketing automation through intelligent AI agents that work together to drive your business growth.
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap mb-12 justify-center gap-4">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "px-6 py-3 rounded-lg transition-all duration-200 mx-2 mb-2 relative group",
                  BORDERS.md,
                  SHADOWS.md,
                  activeTab === index
                    ? cn("bg-primary text-white", ANIMATIONS.pulse)
                    : cn("bg-white text-gray-700 hover:bg-gray-50")
                )}
                style={{
                  transform: activeTab === index ? 'translateY(2px)' : 'translateY(0px)',
                  boxShadow: activeTab === index ? SHADOWS.inner : SHADOWS.md
                }}
              >
                <span className="text-sm md:text-base font-medium relative z-10">{tab.badge}</span>
                {activeTab === index && (
                  <div
                    className={cn("absolute inset-0 rounded-lg bg-primary", ANIMATIONS.pulse)}
                    style={{ zIndex: -1 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            <div key={activeTab} className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", ANIMATIONS.fadeIn)}>
              {/* Left Content */}
              <div className="flex flex-col">
                <div className="mb-5">
                  <Badge className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {tabs[activeTab].badge}
                  </Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                  {tabs[activeTab].title}
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {tabs[activeTab].description}
                </p>
                <div className="space-y-5 mb-8">
                  {tabs[activeTab].benefits.map((benefit, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-start bg-gray-50 p-4 rounded-lg border border-gray-100",
                        ANIMATIONS.fadeInLeft, 
                        "animate-delay-[" + (idx * 100) + "ms]"
                      )}
                    >
                      <div className="flex-shrink-0 h-6 w-6 text-primary mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700 font-medium">{benefit}</p>
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/sign-in")}
                  className={cn(
                    "self-start mt-2 px-8 py-6 rounded-lg text-base font-medium",
                    SHADOWS.md,
                    "shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  )}
                >
                  {tabs[activeTab].ctaText}
                </Button>
              </div>

              {/* Right Content - Illustration */}
              <div className={cn(
                "rounded-xl overflow-hidden shadow-xl aspect-[4/3] flex items-center justify-center",
                BORDERS.md,
                getImageBackground(activeTab),
                CARD_3D_STYLES.interactive
              )}>
                {getIllustration(activeTab)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTabs;