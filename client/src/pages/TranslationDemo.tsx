'use client';

/**
 * Demo page for content features
 * 
 * This page showcases content organization features:
 * - Content sections
 * - Dynamic loading
 * - Performance optimization
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import LazyTranslatedContent from '../components/LazyTranslatedContent';
import { motion } from 'framer-motion';

export default function TranslationDemo() {
  // Language variables retained for compatibility with other components
  const language = 'en';
  
  // Stub function - no longer does language switching
  const toggleLanguage = () => {
    console.log("Language changing is no longer supported");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-3xl font-bold">Content Feature Demo</h1>
          <p className="text-lg mt-2">
            Showcasing dynamic content loading and performance optimization
          </p>
          
          <div className="flex items-center mt-6 space-x-4">
            <span className="text-sm">
              Current language: 
              <span className="font-semibold ml-2">
                🇺🇸 English
              </span>
            </span>
            
            <Button onClick={toggleLanguage} disabled>
              Language switching disabled
            </Button>
          </div>
        </div>
      </motion.div>
      
      <Separator className="my-8" />
      
      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="basic">Basic Features</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Loading</TabsTrigger>
          <TabsTrigger value="tech">Technical</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Content Elements</CardTitle>
              <CardDescription>
                Simple content organization with standardized elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Home</strong> - Navigation element for main page</li>
                <li><strong>Dashboard</strong> - Control center for all analytics</li>
                <li><strong>Settings</strong> - Configuration options for the platform</li>
                <li><strong>Logout</strong> - Security element for ending sessions</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Date & Number Formatting</CardTitle>
              <CardDescription>
                Standardized formatting for consistent display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Dates</h4>
                  <p>
                    {new Intl.DateTimeFormat('en-US', { 
                      dateStyle: 'full' 
                    }).format(new Date())}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Numbers</h4>
                  <p>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD'
                    }).format(1234.56)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dynamic" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              Dynamic Content Loading Demo
            </h2>
            <p className="text-gray-600">
              Click "Expand" to load content for each section dynamically. This demonstrates the lazy-loading capability of our content system.
            </p>
          </div>
          
          <LazyTranslatedContent section="marketing" />
          <LazyTranslatedContent section="dashboard" />
          <LazyTranslatedContent section="workflows" />
          <LazyTranslatedContent section="settings" />
          <LazyTranslatedContent section="billing" />
        </TabsContent>
        
        <TabsContent value="tech">
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>
                How our content system works behind the scenes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Architecture</h3>
                  <p className="mt-1">
                    Our system uses a custom-built solution without external dependencies, providing better control and performance.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Optimization</h3>
                  <p className="mt-1">
                    Content is modularized into chunks and loaded dynamically as needed, reducing the initial bundle size.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">Features</h3>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Automatic content detection</li>
                    <li>Local storage persistence</li>
                    <li>Dynamic loading of content</li>
                    <li>React integration via Context API</li>
                    <li>Formatting support for dates and numbers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                System Version: 2.0
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}