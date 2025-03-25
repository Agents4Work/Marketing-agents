import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateContent } from '@/lib/openai';

/**
 * Simple isolated component to test content generation
 */
const SimplestContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Clear function for debugging
  const handleClear = () => {
    setContent('');
    setError('');
  };
  
  // Generate content directly using the API
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Generating content with prompt:', prompt.substring(0, 100) + '...');
      console.log('Content type:', contentType);
      
      const response = await generateContent(prompt, contentType);
      console.log('API response received:', response);
      
      if (response.error) {
        console.warn('Error from API:', response.error);
        setError(response.error);
      }
      
      if (response.content) {
        console.log('Setting content, length:', response.content.length);
        setContent(response.content);
      } else {
        setError('No content received from API');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Simple Content Generator</CardTitle>
          <CardDescription>
            Test the content generation functionality in isolation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content Type</label>
            <select 
              className="w-full p-2 border rounded"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="blog">Blog Post</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="ad">Advertisement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your content brief or instructions here..."
              className="min-h-[150px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !prompt}
            >
              {loading ? 'Generating...' : 'Generate Content'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
            >
              Clear Results
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        
        {content && (
          <CardFooter className="flex-col items-start">
            <div className="mb-2 font-medium">Generated Content:</div>
            <div className="p-4 bg-gray-50 w-full rounded border whitespace-pre-wrap">
              {content}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SimplestContentGenerator;