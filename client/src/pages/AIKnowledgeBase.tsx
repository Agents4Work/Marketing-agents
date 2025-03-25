import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, BookCopy, FileText } from "lucide-react";
import SidebarOptimized from "@/components/SidebarOptimized";

export default function AIKnowledgeBase() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Knowledge Base</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Your centralized marketing knowledge repository with AI search
              </p>
            </div>
            
            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>AI Search</span>
                </TabsTrigger>
                <TabsTrigger value="guides" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Marketing Guides</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <BookCopy className="h-4 w-4" />
                  <span>Your Documents</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Knowledge Search</CardTitle>
                    <CardDescription>Ask questions or search your marketing knowledge base</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Ask any marketing question, and AI will search across your documents and resources
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Ask a marketing question" className="flex-1" />
                      <Button>Search</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="guides" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Guides</CardTitle>
                    <CardDescription>Expert guides on digital marketing best practices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Coming soon - Access expert marketing guides and tutorials to improve your marketing strategies.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Social Media Strategy Guide</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">SEO Fundamentals Guide</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Email Marketing Playbook</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Content Marketing Guide</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Templates</CardTitle>
                    <CardDescription>Ready-to-use templates for various marketing assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Coming soon - Access professional templates for social media posts, email campaigns, ads, and more.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Social Media Templates</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Email Campaign Templates</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Ad Copy Templates</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>Upload and manage your marketing documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Coming soon - Upload your marketing documents and assets for AI-powered search and analysis.
                    </p>
                    <Button variant="outline">Upload Document</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}