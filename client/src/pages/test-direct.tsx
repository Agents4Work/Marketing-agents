import React, { useEffect } from 'react';
import type { RouteComponentProps } from 'wouter';

export default function TestDirectPage(props: RouteComponentProps) {
  useEffect(() => {
    // Log when component mounts
    console.log('TestDirectPage mounted successfully');
    
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
    debugInfo.textContent = `Debug: TestDirectPage loaded at ${new Date().toISOString()}`;
    document.body.appendChild(debugInfo);
    
    return () => {
      console.log('TestDirectPage unmounting');
      if (debugInfo.parentNode) {
        debugInfo.parentNode.removeChild(debugInfo);
      }
    };
  }, []);
  
  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Test Direct Page</h1>
        <p className="mb-4">This is a simple test page to verify routing and rendering.</p>
        <p className="text-green-600 font-bold">If you can see this page, routing is working correctly!</p>
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
              }
            }, null, 2)}
          </pre>
        </div>
        <div className="mt-6">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              console.log('Test button clicked');
              alert('Test button clicked! JavaScript is working correctly.');
            }}
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}