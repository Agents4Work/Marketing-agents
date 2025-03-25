'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LazyTranslatedContentProps {
  section: string;
}

// This simplified component replaces the dynamic translation loading capability
// with a basic English-only implementation
const LazyTranslatedContent: React.FC<LazyTranslatedContentProps> = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Mock content for different sections
  const sectionContent = {
    marketing: {
      title: 'Marketing Content',
      description: 'Content strategies and campaign management tools.',
      items: [
        'AI-generated marketing copy',
        'Campaign performance analytics',
        'Multi-channel distribution',
        'Target audience analysis'
      ]
    },
    dashboard: {
      title: 'Dashboard Tools',
      description: 'Centralized control center for your marketing activities.',
      items: [
        'Real-time performance metrics',
        'Customizable widgets',
        'AI recommendation engine',
        'Team collaboration tools'
      ]
    },
    workflows: {
      title: 'Automated Workflows',
      description: 'Streamline your marketing processes with AI-powered automation.',
      items: [
        'Content approval workflows',
        'Scheduled publishing',
        'Multi-step campaigns',
        'Integration with external platforms'
      ]
    },
    settings: {
      title: 'Platform Settings',
      description: 'Configure your AI marketing assistant to match your needs.',
      items: [
        'User preferences',
        'API connections',
        'Brand voice settings',
        'Security & permissions'
      ]
    },
    billing: {
      title: 'Subscription & Billing',
      description: 'Manage your subscription and payment details.',
      items: [
        'Plan comparison',
        'Usage analytics',
        'Payment methods',
        'Billing history'
      ]
    }
  };

  // Get the content for the current section, defaulting to a generic content if section not found
  const content = sectionContent[section as keyof typeof sectionContent] || {
    title: 'Section Content',
    description: 'Content for this section.',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4']
  };

  return (
    <Card className="overflow-hidden transition-all duration-300">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {content.title}
          </CardTitle>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {content.description}
          </p>
          
          <ul className="list-disc pl-5 space-y-1">
            {content.items.map((item, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-200">
                {item}
              </li>
            ))}
          </ul>
          
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LazyTranslatedContent;