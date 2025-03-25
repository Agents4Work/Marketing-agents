'use client';

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Save, Tag as TagIcon, X, Plus } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DraftInput, createDraft } from '@/lib/drafts';

export default function CreateDraft() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DraftInput>({
    title: '',
    content: '',
    contentType: 'blog',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [currentWordCount, setCurrentWordCount] = useState(0);

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

    setIsSubmitting(true);

    try {
      const createdDraft = await createDraft(formData);

      if (createdDraft) {
        // Here you would show a success notification
        console.log('Draft created successfully:', createdDraft);
        setLocation('/drafts');
      } else {
        throw new Error('Failed to create draft');
      }
    } catch (error) {
      // Here you would show an error notification
      console.error('Error creating draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      window.location.href = `/drafts/${data.document.id}`;
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };


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
        <h1 className="text-2xl font-bold">Create New Draft</h1>
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
              Save Draft
            </Button>
          </div>
        </div>
      </form>
      <Button onClick={handleCreateDocument}>Create Document</Button> {/* Added button to trigger document creation */}
    </div>
  );
}