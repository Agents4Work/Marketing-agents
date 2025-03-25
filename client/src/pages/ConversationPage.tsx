import React, { useState, useEffect } from 'react';
import { RouteComponentProps, useLocation } from 'wouter';
import { getConversation, Conversation } from '@/lib/conversation-memory';
import ConversationView from '@/components/ConversationView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, MessageSquare } from 'lucide-react';

interface ConversationPageProps extends RouteComponentProps {
  id?: string;
}

export default function ConversationPage({ id }: ConversationPageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function loadConversation() {
      if (!id) {
        setError('No conversation ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const conversationData = await getConversation(id);
        if (conversationData) {
          setConversation(conversationData);
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [id]);

  // Handle conversation updates
  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setConversation(updatedConversation);
  };

  // Navigate back to content hub
  const handleNavigateBack = () => {
    navigate('/content-hub');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <div className="flex items-center mb-6">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 w-64 ml-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-[600px]"></div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {error || 'Conversation not found'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't find the conversation you're looking for.
          </p>
          <Button onClick={handleNavigateBack}>
            Back to Content Hub
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handleNavigateBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Content Hub
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[calc(100vh-180px)]">
        <ConversationView 
          conversation={conversation}
          onUpdate={handleConversationUpdate}
          enableFeedback={true}
          agentName="AI Content Assistant"
        />
      </div>
    </div>
  );
}