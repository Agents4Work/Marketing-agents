import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import SidebarOptimized from "@/components/SidebarOptimized";
import AIAgentsMarketplace from "@/components/AIAgentsMarketplace";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { SHADOWS, BORDERS, ANIMATIONS, BUTTON_3D_STYLES } from "@/styles/modern-3d-design-system";

// This component is now a wrapper around the AgentMarketplace component
// We're keeping it for backward compatibility
const AITeam = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to the agent marketplace after component mounts
  useEffect(() => {
    // Log that this component is deprecated
    console.log("The AITeam component is deprecated and will be removed in future versions. Please use AgentMarketplace instead.");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`bg-white dark:bg-gray-800 ${BORDERS.prominent} ${SHADOWS.pronounced} relative z-10`}>
          <div className="container mx-auto px-6 py-5 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Agents Marketplace</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Build your dream marketing team with specialized AI agents</p>
            </motion.div>
            
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="outline"
                className={`flex items-center gap-2 ${BUTTON_3D_STYLES.outline} transition-all duration-300 border-2`}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Create Custom Agent</span>
              </Button>
              
              <Button
                className={`flex items-center gap-2 bg-primary text-white ${BUTTON_3D_STYLES.primary} transition-all duration-300`}
                onClick={() => setLocation("/workflow")}
              >
                <Users size={16} />
                <span className="hidden sm:inline">Build Agent Workflow</span>
              </Button>
            </motion.div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <AIAgentsMarketplace />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AITeam;