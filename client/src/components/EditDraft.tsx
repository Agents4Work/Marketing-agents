'use client';

import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ChevronLeft, Save, Trash2, Tag as TagIcon, X, Plus } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DraftInput, fetchDraftById, updateDraft, deleteDraft } from '@/lib/drafts';

export default function EditDraft() {
  const [, params] = useRoute('/drafts/edit/:id');
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DraftInput>({
    title: '',
    content: '',
    contentType: 'blog',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch draft data
  useEffect(() => {
    const fetchDraft = async () => {
      if (!params?.id) {
        setError('No draft ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const draft = await fetchDraftById(params.id);
        
        if (!draft) {
          setError('Draft not found');
          setIsLoading(false);
          return;
        }

        setFormData({
          title: draft.title,
          content: draft.content,
          contentType: draft.contentType,
          tags: draft.tags,
        });

        // Update word count
        const words = draft.content.trim().split(/\s+/);
        setCurrentWordCount(draft.content.trim() === '' ? 0 : words.length);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching draft:', error);
        setError('Failed to load draft');
        setIsLoading(false);
      }
    };

    fetchDraft();
  }, [params?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update word count when content changes
    if (name === 'content') {
      const words = value.trim().split(/\s+/);
      setCurrentWordCount(value.trim() === '' ? 0 : words.length);
    }
  };

  const handleContentTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      contentType: value,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      // Here you would show an error notification
      console.error('Please fill in all required fields');
      return;
    }
    
    if (!params?.id) {
      console.error('No draft ID provided');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedDraft = await updateDraft(params.id, formData);
      
      if (updatedDraft) {
        // Here you would show a success notification
        console.log('Draft updated successfully:', updatedDraft);
        setLocation('/drafts');
      } else {
        throw new Error('Failed to update draft');
      }
    } catch (error) {
      // Here you would show an error notification
      console.error('Error updating draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!params?.id) return;
    
    try {
      const success = await deleteDraft(params.id);
      
      if (success) {
        // Here you would show a success notification
        console.log('Draft deleted successfully');
        setLocation('/drafts');
      } else {
        throw new Error('Failed to delete draft');
      }
    } catch (error) {
      // Here you would show an error notification
      console.error('Error deleting draft:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            disabled
          >
            <ChevronLeft size={18} />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => setLocation('/drafts')}
          >
            <ChevronLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>

        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => setLocation('/drafts')}>
            Go Back to Drafts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => setLocation('/drafts')}
          >
            <ChevronLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold">Edit Draft</h1>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center">
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the draft
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <Input
                name="title"
                placeholder="Draft Title"
                value={formData.title}
                onChange={handleInputChange}
                className="text-xl font-medium p-4 h-auto"
                required
              />
            </div>
            
            <div>
              <Textarea
                name="content"
                placeholder="Write your content here..."
                value={formData.content}
                onChange={handleInputChange}
                className="min-h-[400px] p-4 resize-y"
                required
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm text-muted-foreground">
                  {currentWordCount} words
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4 space-y-4">
              <h3 className="font-medium">Draft Settings</h3>
              <Separator />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select 
                  value={formData.contentType} 
                  onValueChange={handleContentTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="ad">Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex rounded-md overflow-hidden">
                  <div className="relative flex-grow">
                    <TagIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      if (tagInput.trim() !== '' && !formData.tags?.includes(tagInput.trim())) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), tagInput.trim()],
                        }));
                        setTagInput('');
                      }
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                  {!formData.tags?.length && (
                    <span className="text-sm text-muted-foreground">No tags added</span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}