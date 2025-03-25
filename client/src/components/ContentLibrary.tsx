import React, { useState } from 'react';
import { ContentItem } from '@shared/schema';
import { useContentHub } from '@/hooks/useContentHub';
import ContentItemCard from './ContentItemCard';
import ContentItemDialog from './ContentItemDialog';
import ContentItemViewer from './ContentItemViewer';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  Search,
  Filter,
  X, 
  Loader2,
  FileText
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ContentLibrary() {
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Get content hub hooks
  const {
    useAllContentItems,
    useContentItemsByType,
    useContentItemsByCategory,
    useCreateContentItem,
    useUpdateContentItem,
    useDeleteContentItem,
  } = useContentHub();

  // Get content items based on active filter
  const allContentItemsQuery = useAllContentItems();
  const contentByTypeQuery = useContentItemsByType(selectedType || '');
  const contentByCategoryQuery = useContentItemsByCategory(selectedCategory || '');

  // Use appropriate query based on active filter
  const getActiveQuery = () => {
    if (selectedType) return contentByTypeQuery;
    if (selectedCategory) return contentByCategoryQuery;
    return allContentItemsQuery;
  };

  const activeQuery = getActiveQuery();
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;
  
  // Get content items
  const contentItems = activeQuery.data || [];

  // Filter by search query
  const filteredItems = contentItems.filter((item: ContentItem) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.content.toLowerCase().includes(query) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  });

  // Filter by tab (status)
  const tabFilteredItems = filteredItems.filter((item: ContentItem) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  // Create content mutation
  const createMutation = useCreateContentItem();
  
  // Update content mutation
  const updateMutation = useUpdateContentItem();
  
  // Delete content mutation
  const deleteMutation = useDeleteContentItem();

  // Event handlers
  const handleOpenCreateDialog = () => {
    setSelectedItem(null);
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (item: ContentItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleOpenViewDialog = (item: ContentItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: ContentItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  
  // This function adapts our handler to match the expected signature in ContentItemCard
  const handleDeleteContentById = (id: number) => {
    const itemToDelete = contentItems.find((item: ContentItem) => item.id === id);
    if (itemToDelete) {
      handleOpenDeleteDialog(itemToDelete);
    }
  };

  const handleCreateContent = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateContent = (data: any) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleDeleteContent = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedType(null);
    setActiveFilter(null);
  };

  // Render content items in a grid
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Content Library</h2>
          <p className="text-gray-500">
            Browse and manage your content catalog
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" /> Create Content
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search content..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="w-[180px]">
            <Select
              value={selectedType || ""}
              onValueChange={(value) => {
                setSelectedType(value || null);
                setSelectedCategory(null);
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="blog">Blog Posts</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="ad">Ads</SelectItem>
                <SelectItem value="website">Website Copy</SelectItem>
                <SelectItem value="product">Product Content</SelectItem>
                <SelectItem value="pr">PR & Communications</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-[180px]">
            <Select
              value={selectedCategory || ""}
              onValueChange={(value) => {
                setSelectedCategory(value || null);
                setSelectedType(null);
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="content-type">Content Type</SelectItem>
                <SelectItem value="marketing-function">Marketing Function</SelectItem>
                <SelectItem value="funnel-stage">Funnel Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedType || selectedCategory) && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter tags display */}
      {(searchQuery || selectedType || selectedCategory) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {selectedType}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedType(null)}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCategory(null)}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Content grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading content library...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-500 mb-2">Error loading content</div>
          <p className="text-gray-500 mb-4">{(error as Error).message}</p>
          <Button onClick={() => activeQuery.refetch()}>Try Again</Button>
        </div>
      ) : tabFilteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No content found</h3>
          {searchQuery || selectedType || selectedCategory || activeTab !== 'all' ? (
            <p className="text-gray-500 max-w-md mb-4">
              No content matches your current filters. Try adjusting your search criteria
              or clear the filters to see all content.
            </p>
          ) : (
            <p className="text-gray-500 max-w-md mb-4">
              Your content library is empty. Create your first content item to get started.
            </p>
          )}
          {(searchQuery || selectedType || selectedCategory || activeTab !== 'all') ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="h-4 w-4 mr-2" /> Create Content
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tabFilteredItems.map((item: ContentItem) => (
            <ContentItemCard
              key={item.id}
              item={item}
              onEdit={handleOpenEditDialog}
              onDelete={handleDeleteContentById}
              onView={handleOpenViewDialog}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <ContentItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateContent}
      />

      {/* Edit dialog */}
      <ContentItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={selectedItem || undefined}
        onSave={handleUpdateContent}
      />

      {/* View dialog */}
      <ContentItemViewer
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={selectedItem}
        onEdit={handleOpenEditDialog}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteContent}
        title="Delete Content"
        description={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}