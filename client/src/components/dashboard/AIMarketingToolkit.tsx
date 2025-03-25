'use client';

import React, { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import Modern3DCard from '@/components/ui/modern-3d-card';
import Modern3DHeader from '@/components/ui/modern-3d-header';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modern3DButton from '@/components/ui/modern-3d-button';

interface AIMarketingToolkitProps {
  featuredCategories: {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    apps: string[];
  }[];
}

const AIMarketingToolkit: React.FC<AIMarketingToolkitProps> = ({ 
  featuredCategories 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-12">
      <div className="flex justify-between items-end mb-4">
        <Modern3DHeader
          title="AI Marketing Toolkit"
          size="md"
          accentColor="from-blue-600 to-indigo-600"
          description="Specialized tools for different marketing needs"
        />
        
        {/* Navigation arrows for horizontal scroll - Modern 3D style */}
        <div className="hidden md:flex space-x-2">
          <Button
            onClick={scrollLeft}
            size="icon"
            className="h-8 w-8 p-0 bg-white dark:bg-gray-800 border-2 border-black rounded-full
                      shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                      transform hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={scrollRight}
            size="icon"
            className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-2 border-black rounded-full
                      shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                      transform hover:-translate-y-0.5 transition-all"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Horizontally scrollable container - with shadows and depth */}
      <div className="relative">
        {/* Shadow indicator for scrollable content */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none z-10"></div>
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none z-10"></div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-5 space-x-4 hide-scrollbar"
        >
          {featuredCategories.map((category, index) => (
            <div key={category.id} className="min-w-[280px] flex-shrink-0 relative">
              {/* Shadow element - smaller and more subtle */}
              <div className="absolute inset-0 bg-black rounded-xl translate-x-1.5 translate-y-1.5"></div>
              
              {/* Card content */}
              <div className="relative bg-white dark:bg-gray-800 rounded-xl border-2 border-black overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${category.color}`}></div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white border-2 border-black
                                   shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]`}>
                      {category.icon}
                    </div>
                    <Badge className="border-2 border-black px-2 py-0.5 text-xs font-medium shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]">
                      {`${category.apps.length} tools`}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1.5">{category.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{category.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {category.apps.slice(0, 3).map((app, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className="border border-gray-200 text-xs hover:border-gray-300 cursor-pointer"
                      >
                        {app}
                      </Badge>
                    ))}
                    {category.apps.length > 3 && (
                      <Badge variant="outline" className="border border-gray-200 text-xs">
                        +{category.apps.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-black
                              shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                              transform hover:-translate-y-0.5 transition-all text-xs h-7 px-2.5"
                      size="sm"
                    >
                      Explore
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIMarketingToolkit;