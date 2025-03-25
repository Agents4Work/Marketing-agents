import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Hero from "@/components/Hero";
import { renderCanvas } from "@/utils/canvas"; // Changed from lib/canvasEffect to utils/canvas
import NavigationMenu from "@/components/NavigationMenu";
import FeatureTabs from "@/components/FeatureTabs";
import MarketingProblemSection from "@/components/MarketingProblemSection";
import HowItWorks from "@/components/HowItWorks";
import KeyFeatures from "@/components/KeyFeatures";
import AIvsHumanComparison from "@/components/AIvsHumanComparison";
import AITeamMembers from "@/components/AITeamMembers";
import AnimatedTestimonials from "@/components/AnimatedTestimonials";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useDirectText } from "@/lib/direct-text";

const Home = () => {
  const { user, loading } = useAuth();
  const { t } = useDirectText();
  const [, setLocation] = useLocation();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = ["Automated", "Intelligent", "Integrated", "Personalized"];

  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    // Small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        try {
          // renderCanvas now always returns a function
          cleanupRef.current = renderCanvas();
          console.log("Canvas initialized successfully");
        } catch (err) {
          console.error("Canvas error:", err);
        }
      } else {
        console.error("Canvas element not available");
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Interactive Background Canvas */}
      <canvas
        id="canvas"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-20 pointer-events-auto"
      ></canvas>
      
      {/* Main Content */}
      <div className="relative z-30">
        {/* Navigation Menu */}
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm">
          <NavigationMenu />
        </div>
        
        {/* Hero Section with padding for navbar */}
        <div className="pt-20">
          {/* Hero Section */}
          <div className="min-h-screen flex items-center justify-center">
            <Hero />
          </div>
          
          {/* Premium Feature Tabs */}
          <FeatureTabs />
          
          {/* Marketing is Broken - AI Fixes It Section */}
          <MarketingProblemSection />
          
          {/* How It Works Section */}
          <HowItWorks />
          
          {/* Key Features Section */}
          <KeyFeatures />
          
          {/* AI vs Human Comparison Section */}
          <AIvsHumanComparison />
          
          {/* Meet Your AI Marketing Team Section */}
          <AITeamMembers />
          
          {/* Customer Testimonials Section */}
          <AnimatedTestimonials />
          
          {/* FAQ Section */}
          <FaqSection />
          
          {/* Footer Section */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;