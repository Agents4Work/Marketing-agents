import React from 'react';
import SimplestContentGenerator from '@/components/SimplestContentGenerator';

const TestContentPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Content Generation Test Page</h1>
        <p className="text-gray-500">
          This page is for isolated testing of the content generation functionality
        </p>
      </div>
      
      <SimplestContentGenerator />
    </div>
  );
};

export default TestContentPage;