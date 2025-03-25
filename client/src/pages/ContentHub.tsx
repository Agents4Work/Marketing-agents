import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import AIContentHub from "@/components/AIContentHub";
import SidebarOptimized from "@/components/SidebarOptimized";

export default function ContentHub() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Content Hub</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Generate professional marketing content with AI assistance
              </p>
            </div>
            
            <div className="space-y-6">
              <AIContentHub />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}