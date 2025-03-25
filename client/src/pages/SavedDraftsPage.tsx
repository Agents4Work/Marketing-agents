'use client';

import { useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from 'wouter';
import SidebarOptimized from '../components/SidebarOptimized';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Plus, 
  FileText, 
  Star, 
  Calendar,
  Clock,
  Trash2,
  Edit,
  Star as StarIcon,
  CheckCircle,
  Archive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Simplified Draft interface
interface SimpleDraft {
  id: string;
  title: string;
  content: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  status: 'draft' | 'published' | 'archived';
}

// Standalone drafts page that doesn't depend on other components
export default function SavedDraftsPage(_props: RouteComponentProps) {
  const [drafts, setDrafts] = useState<SimpleDraft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Debug logging
  useEffect(() => {
    document.title = 'Saved Drafts | AI Marketing Platform';
    console.log("SavedDraftsPage component rendered - Standalone Version");
    console.log("Current URL:", window.location.href);
    
    // Generate mock drafts for demonstration
    setTimeout(() => {
      const mockDrafts: SimpleDraft[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `draft-${i}`,
        title: i % 2 === 0 ? 'Marketing Strategy Document' : 'Social Media Campaign',
        content: `This is sample content for draft ${i + 1}...`,
        contentType: i % 2 === 0 ? 'document' : 'social',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
        wordCount: 100 + i * 50,
        status: i % 3 === 0 ? 'published' : 'draft',
      }));
      
      setDrafts(mockDrafts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter drafts based on search query
  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.contentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to create new draft
  const handleCreateNew = () => {
    console.log("Create new draft clicked");
    setLocation('/drafts/new');
  };

  // Navigate to edit draft
  const handleEditDraft = (id: string) => {
    console.log(`Edit draft ${id} clicked`);
    setLocation(`/drafts/edit/${id}`);
  };

  // Get color for content type
  const getContentTypeColor = (type: string): string => {
    switch (type) {
      case 'document': return 'text-blue-600 border-blue-200';
      case 'social': return 'text-green-600 border-green-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  // Loading skeleton component
  const renderSkeletons = () => (
    Array(3).fill(0).map((_, i) => (
      <Card key={`skeleton-${i}`} className="w-full mb-4 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-16 w-full bg-gray-200 rounded"></div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
          </div>
        </CardFooter>
      </Card>
    ))
  );

  return (
    <div className="flex">
      <SidebarOptimized />
      <div className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-black">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Saved Drafts</h1>
                <p className="text-gray-500">Manage your content drafts</p>
              </div>
              <Button onClick={handleCreateNew} className="flex items-center gap-2 bg-blue-600">
                <Plus size={16} />
                New Draft
              </Button>
            </div>

            <div className="w-full mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search drafts..." 
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                renderSkeletons()
              ) : filteredDrafts.length > 0 ? (
                filteredDrafts.map(draft => (
                  <Card key={draft.id} className="w-full mb-4 border-2 hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{draft.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleEditDraft(draft.id)}
                          >
                            <Edit size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <FileText size={14} className="text-gray-500" /> 
                        <Badge variant="outline" className={`font-normal ${getContentTypeColor(draft.contentType)}`}>
                          {draft.contentType.charAt(0).toUpperCase() + draft.contentType.slice(1)}
                        </Badge>
                        <span>•</span>
                        <span>{draft.wordCount} words</span>
                        <span>•</span>
                        <Badge variant={draft.status === 'published' ? 'default' : 'outline'} className="ml-1">
                          {draft.status === 'published' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {draft.status === 'archived' && <Archive className="mr-1 h-3 w-3" />}
                          {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-gray-600 line-clamp-2">{draft.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} /> 
                        <span>Created {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} /> 
                        <span>Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No drafts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No drafts match your search "${searchQuery}"`
                      : "You haven't created any drafts yet."
                    }
                  </p>
                  <Button onClick={handleCreateNew}>Create New Draft</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}