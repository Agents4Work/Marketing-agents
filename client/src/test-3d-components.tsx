'use client';

import React, { useEffect } from 'react';
import Modern3DButton from '@/components/ui/modern-3d-button';
import Modern3DCard from '@/components/ui/modern-3d-card';
import Modern3DHeader from '@/components/ui/modern-3d-header';
import { Card, CardContent } from '@/components/ui/card';

export default function Test3DComponents(props: any) {
  useEffect(() => {
    // Log when component mounts
    console.log('Test3DComponents mounted successfully');
    console.log('Components available:', {
      Modern3DButton: !!Modern3DButton,
      Modern3DCard: !!Modern3DCard,
      Modern3DHeader: !!Modern3DHeader
    });
    
    // Log window location information
    console.log('Current location:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    // Add a visible message to the document for debugging
    const debugInfo = document.createElement('div');
    debugInfo.style.position = 'fixed';
    debugInfo.style.top = '0';
    debugInfo.style.left = '0';
    debugInfo.style.padding = '10px';
    debugInfo.style.background = 'rgba(0,0,0,0.7)';
    debugInfo.style.color = 'white';
    debugInfo.style.zIndex = '9999';
    debugInfo.style.fontSize = '12px';
    debugInfo.textContent = `Debug: Test3D loaded at ${new Date().toISOString()}`;
    document.body.appendChild(debugInfo);
    
    return () => {
      console.log('Test3DComponents unmounting');
      if (debugInfo.parentNode) {
        debugInfo.parentNode.removeChild(debugInfo);
      }
    };
  }, []);
  
  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <Modern3DHeader 
          title="Test 3D Components" 
          subtitle="Testing our Modern 3D design system components"
          badge="Testing"
          size="xl"
        />
        
        <Modern3DCard
          title="Modern 3D Card"
          description="This is a test of our Modern 3D card component"
        >
          <div className="p-4 space-y-4">
            <p>This is a Modern3DCard component with custom content.</p>
            <div className="flex space-x-2">
              <Modern3DButton onClick={() => console.log('Default button clicked')}>
                Default Button
              </Modern3DButton>
              <Modern3DButton 
                variant="gradient" 
                gradientClass="from-blue-500 to-indigo-600"
                onClick={() => console.log('Gradient button clicked')}
              >
                Gradient Button
              </Modern3DButton>
            </div>
          </div>
        </Modern3DCard>
        
        <Card className="p-6 shadow-lg">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Button Variants</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Default Variant</h3>
                <Modern3DButton>Default Button</Modern3DButton>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Outline Variant</h3>
                <Modern3DButton variant="outline">Outline Button</Modern3DButton>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Ghost Variant</h3>
                <Modern3DButton variant="ghost">Ghost Button</Modern3DButton>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Gradient Variant</h3>
                <Modern3DButton variant="gradient">Gradient Button</Modern3DButton>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Custom Gradient</h3>
                <Modern3DButton gradientClass="from-green-500 to-emerald-600">
                  Custom Gradient
                </Modern3DButton>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Full Width</h3>
                <Modern3DButton fullWidth>Full Width Button</Modern3DButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}