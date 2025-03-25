import React from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Lightbulb, Play } from "lucide-react";
import SidebarOptimized from "@/components/SidebarOptimized";

export default function AIAcademy() {
  const params = useParams<{ section?: string }>();
  
  // Default to courses if no specific section is selected
  const activeSection = params.section || "courses";
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Marketing Academy</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Learn how to get the most out of your AI marketing platform
              </p>
            </div>
            
            <Tabs defaultValue={activeSection} className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>AI Training Courses</span>
                </TabsTrigger>
                <TabsTrigger value="guides" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Best Practices & Guides</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="courses" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CourseCard 
                    title="AI Marketing Fundamentals"
                    description="Learn the basics of using AI for marketing campaigns"
                    lessons={8}
                    duration="2 hours"
                    level="Beginner"
                  />
                  <CourseCard 
                    title="Advanced AI Content Creation"
                    description="Master the art of AI-powered content generation"
                    lessons={12}
                    duration="3 hours"
                    level="Intermediate"
                  />
                  <CourseCard 
                    title="AI Workflow Optimization"
                    description="Build sophisticated marketing workflows with AI teams"
                    lessons={10}
                    duration="2.5 hours"
                    level="Advanced"
                  />
                  <CourseCard 
                    title="AI Image & Visual Marketing"
                    description="Create compelling visual assets with AI tools"
                    lessons={6}
                    duration="1.5 hours"
                    level="Beginner"
                  />
                  <CourseCard 
                    title="AI for Social Media Marketing"
                    description="Automate and optimize your social media strategy"
                    lessons={9}
                    duration="2 hours"
                    level="Intermediate"
                  />
                  <CourseCard 
                    title="Analytics & AI-Driven Insights"
                    description="Leverage AI to extract actionable marketing insights"
                    lessons={7}
                    duration="1.5 hours"
                    level="Advanced"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="guides" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GuideCard 
                    title="AI Prompt Engineering Guide"
                    description="Master the art of writing effective prompts for AI content"
                    category="Content Creation"
                    readTime="15 min"
                  />
                  <GuideCard 
                    title="Setting Up Your AI Brand Voice"
                    description="Configure your AI to match your brand's tone and style"
                    category="Branding"
                    readTime="10 min"
                  />
                  <GuideCard 
                    title="AI SEO Best Practices"
                    description="Optimize your content for search engines with AI assistance"
                    category="SEO"
                    readTime="12 min"
                  />
                  <GuideCard 
                    title="Email Marketing Automation with AI"
                    description="Build personalized email campaigns at scale"
                    category="Email Marketing"
                    readTime="20 min"
                  />
                  <GuideCard 
                    title="AI-Generated Visual Asset Guidelines"
                    description="Best practices for creating images and graphics with AI"
                    category="Visual Design"
                    readTime="15 min"
                  />
                  <GuideCard 
                    title="Marketing Compliance & AI Ethics"
                    description="Ensure your AI marketing efforts remain ethical and compliant"
                    category="Legal & Ethics"
                    readTime="25 min"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

interface CourseCardProps {
  title: string;
  description: string;
  lessons: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

function CourseCard({ title, description, lessons, duration, level }: CourseCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className={`h-2 ${
        level === 'Beginner' ? 'bg-green-500' :
        level === 'Intermediate' ? 'bg-blue-500' :
        'bg-purple-500'
      }`} />
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Play className="h-4 w-4" />
          <span>{lessons} lessons</span>
          <span>•</span>
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className={`text-xs px-2 py-1 rounded-full ${
            level === 'Beginner' ? 'bg-green-100 text-green-800' :
            level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {level}
          </span>
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <Button className="w-full">Start Course</Button>
      </div>
    </Card>
  );
}

interface GuideCardProps {
  title: string;
  description: string;
  category: string;
  readTime: string;
}

function GuideCard({ title, description, category, readTime }: GuideCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
            {category}
          </span>
          <span className="text-xs text-gray-500">{readTime} read</span>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-gray-700">Tips & best practices</span>
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <Button variant="outline" className="w-full">Read Guide</Button>
      </div>
    </Card>
  );
}