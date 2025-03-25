'use client';

import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Calendar, 
  Edit, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  X,
  Star,
  Clock,
  Tag,
  Filter
} from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Type definitions
interface Draft {
  id: string;
  title: string;
  content: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  starred: boolean;
  wordCount: number;
  status: 'draft' | 'published' | 'archived';
}

export default function SavedDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [, setLocation] = useLocation();

  useEffect(() => {
    // In a real app, this would fetch from your API
    const fetchDrafts = async () => {
      try {
        setIsLoading(true);
        // For demo purposes, generate mock drafts
        const mockDrafts: Draft[] = Array.from({ length: 8 }).map((_, i) => ({
          id: `draft-${i}`,
          title: i % 3 === 0 
            ? 'Marketing Campaign Proposal'
            : i % 3 === 1 
              ? 'Social Media Content Strategy' 
              : 'SEO Optimization Plan',
          content: `This is a sample content for draft ${i + 1}...`,
          contentType: i % 4 === 0 ? 'blog' : i % 4 === 1 ? 'social' : i % 4 === 2 ? 'email' : 'ad',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
          tags: i % 2 === 0 ? ['marketing', 'strategy'] : ['content', 'social-media'],
          starred: i % 5 === 0,
          wordCount: 100 + i * 50,
          status: i % 7 === 0 ? 'published' : i % 5 === 0 ? 'archived' : 'draft',
        }));
        
        setDrafts(mockDrafts);
        setTimeout(() => setIsLoading(false), 1000); // Simulate loading
      } catch (error) {
        console.error('Error fetching drafts:', error);
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectDraft = (id: string) => {
    setSelectedDrafts(prev => 
      prev.includes(id) 
        ? prev.filter(draftId => draftId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrafts.length === filteredDrafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(filteredDrafts.map(draft => draft.id));
    }
  };

  const handleDeleteSelected = () => {
    setDrafts(prev => prev.filter(draft => !selectedDrafts.includes(draft.id)));
    setSelectedDrafts([]);
  };

  const handleToggleStar = (id: string) => {
    setDrafts(prev => prev.map(draft => 
      draft.id === id ? { ...draft, starred: !draft.starred } : draft
    ));
  };

  const handleEditDraft = (id: string) => {
    // Navigate to the edit page
    setLocation(`/drafts/edit/${id}`);
  };

  const handleCreateNewDraft = () => {
    // Navigate to create new draft page
    setLocation('/drafts/new');
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'blog':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'social':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'email':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ad':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Filter drafts based on search query and active filter
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = 
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'starred') return matchesSearch && draft.starred;
    if (activeTab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && draft.updatedAt > oneWeekAgo;
    }
    
    return matchesSearch && draft.contentType === activeTab;
  });

  const renderSkeletons = () => (
    Array(4).fill(0).map((_, i) => (
      <Card key={`skeleton-${i}`} className="w-full mb-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </CardFooter>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Drafts</h1>
          <p className="text-muted-foreground">Manage and organize your content drafts</p>
        </div>
        <Button onClick={handleCreateNewDraft} className="flex items-center gap-2">
          <Plus size={16} />
          New Draft
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-2/3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search drafts..." 
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="w-full md:w-1/3 flex gap-2">
          <Select 
            value={activeFilter} 
            onValueChange={setActiveFilter}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drafts</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
              <SelectItem value="blog">Blog Posts</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="ad">Advertisements</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedDrafts.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ad">Ads</TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedDrafts.length > 0 && (
        <div className="mb-4 p-2 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedDrafts.length} {selectedDrafts.length === 1 ? 'draft' : 'drafts'} selected
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDrafts([])}
            className="h-8"
          >
            <X size={14} className="mr-1" />
            Clear
          </Button>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <Checkbox 
          checked={selectedDrafts.length === filteredDrafts.length && filteredDrafts.length > 0}
          onCheckedChange={handleSelectAll}
          id="select-all"
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select All
        </label>
        <span className="text-muted-foreground text-sm ml-auto">
          {filteredDrafts.length} {filteredDrafts.length === 1 ? 'draft' : 'drafts'} found
        </span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          renderSkeletons()
        ) : filteredDrafts.length > 0 ? (
          filteredDrafts.map(draft => (
            <Card key={draft.id} className={`w-full transition-all ${selectedDrafts.includes(draft.id) ? 'border-primary bg-primary-foreground/5' : ''}`}>
              <CardHeader className="pb-2 flex-row flex items-start justify-between space-y-0">
                <div className="flex gap-2 items-start">
                  <Checkbox 
                    checked={selectedDrafts.includes(draft.id)}
                    onCheckedChange={() => handleSelectDraft(draft.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">
                        {draft.title}
                      </CardTitle>
                      {draft.starred && (
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <FileText size={14} /> 
                      <Badge variant="outline" className={`font-normal ${getContentTypeColor(draft.contentType)}`}>
                        {draft.contentType.charAt(0).toUpperCase() + draft.contentType.slice(1)}
                      </Badge>
                      <span>•</span>
                      <span>{draft.wordCount} words</span>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditDraft(draft.id)}>
                      <Edit size={14} className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStar(draft.id)}>
                      <Star size={14} className="mr-2" /> {draft.starred ? 'Unstar' : 'Star'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => {
                      setDrafts(prev => prev.filter(d => d.id !== draft.id));
                    }}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {draft.content}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {draft.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FileText size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No drafts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No drafts match your search "${searchQuery}"`
                : "You haven't created any drafts yet, or none match your current filters."
              }
            </p>
            <Button onClick={handleCreateNewDraft}>Create New Draft</Button>
          </div>
        )}
      </div>
    </div>
  );
}