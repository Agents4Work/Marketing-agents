import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { AnimatedSection } from '../components/ui/animated-section';
import GoogleDocsIntegration from '../components/integrations/GoogleDocsIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';

export default function GoogleDocs() {
  const { toast } = useToast();

  const handleImport = (content: string) => {
    toast({
      title: "Content Imported",
      description: "Content has been successfully imported from Google Docs",
    });
  };

  const handleExport = (content: string) => {
    toast({
      title: "Content Exported",
      description: "Content has been successfully exported to Google Docs",
    });
  };

  return (
    <MainLayout>
      <AnimatedSection className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Google Docs Integration</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Seamlessly integrate with Google Docs to import or export your content
          </p>
        </div>

        <Tabs defaultValue="integration">
          <TabsList>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="recent">Recent Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integration" className="space-y-6 pt-4">
            <GoogleDocsIntegration 
              onImport={handleImport}
              onExport={handleExport}
            />
          </TabsContent>
          
          <TabsContent value="recent" className="pt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Documents</h3>
              <p className="text-gray-500">
                Your recent Google Docs would appear here when the integration is fully implemented.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="pt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Google Docs Integration Settings</h3>
              <p className="text-gray-500">
                Configure your Google Docs integration preferences here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </AnimatedSection>
    </MainLayout>
  );
}