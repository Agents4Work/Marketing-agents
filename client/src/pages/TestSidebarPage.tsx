'use client';

import { useEffect } from 'react';
import { RouteComponentProps } from 'wouter';
import SidebarOptimized from '../components/SidebarOptimized';

export default function TestSidebarPage(_props: RouteComponentProps) {
  useEffect(() => {
    document.title = 'Test Sidebar | AI Marketing Platform';
    console.log("TestSidebarPage component rendered");
    
    // Log that we're attempting to use the SidebarOptimized component
    console.log("SidebarOptimized component will be used:", typeof SidebarOptimized);
  }, []);

  return (
    <div className="flex">
      <SidebarOptimized />
      <div className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-black">
            <h1 className="text-3xl font-bold">Test Sidebar Page</h1>
            <p className="text-gray-500 mt-2">This is a simple test page to verify that the SidebarOptimized component is working correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}