import React from 'react';
import { cn } from "../../lib/utils";
import SidebarOptimized from '../SidebarOptimized';
import { Toaster } from '../ui/toaster';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
  hideHeader?: boolean;
}

/**
 * Main layout component that provides consistent structure with sidebar and content area
 */
export default function MainLayout({
  children,
  className,
  contentClassName,
  fullWidth = false,
  hideHeader = false
}: MainLayoutProps) {
  return (
    <div className={cn(
      "flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden",
      className
    )}>
      {/* Sidebar */}
      <SidebarOptimized />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - can be hidden for specific pages */}
        {!hideHeader && (
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6">
            <div className="w-full flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {/* Page title would be injected by individual page components */}
              </h1>
              
              <div className="flex items-center space-x-4">
                {/* Header actions can be added here */}
              </div>
            </div>
          </header>
        )}
        
        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-y-auto",
          fullWidth ? "" : "p-6",
          contentClassName
        )}>
          {children}
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}