import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllContentItems, 
  getContentItemsByType, 
  getContentItemsByCategory, 
  getContentItemsByTag,
  getContentItemById,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  saveGeneratedContent
} from '@/api/contentHubApi';
import { ContentItem } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useContentHub() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all content items for the current user
  const useAllContentItems = () => {
    return useQuery({
      queryKey: ['/api/content-hub'],
      queryFn: async () => {
        const response = await getAllContentItems();
        return response.contentItems;
      }
    });
  };

  // Get content items by type
  const useContentItemsByType = (contentType: string) => {
    return useQuery({
      queryKey: ['/api/content-hub/type', contentType],
      queryFn: async () => {
        const response = await getContentItemsByType(contentType);
        return response.contentItems;
      },
      enabled: !!contentType
    });
  };

  // Get content items by category
  const useContentItemsByCategory = (category: string) => {
    return useQuery({
      queryKey: ['/api/content-hub/category', category],
      queryFn: async () => {
        const response = await getContentItemsByCategory(category);
        return response.contentItems;
      },
      enabled: !!category
    });
  };

  // Get content items by tag
  const useContentItemsByTag = (tag: string) => {
    return useQuery({
      queryKey: ['/api/content-hub/tag', tag],
      queryFn: async () => {
        const response = await getContentItemsByTag(tag);
        return response.contentItems;
      },
      enabled: !!tag
    });
  };

  // Get a specific content item by ID
  const useContentItem = (id: number) => {
    return useQuery({
      queryKey: ['/api/content-hub/item', id],
      queryFn: async () => {
        const response = await getContentItemById(id);
        return response.contentItem;
      },
      enabled: !!id
    });
  };

  // Create a new content item
  const useCreateContentItem = () => {
    return useMutation({
      mutationFn: (data: Omit<ContentItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        return createContentItem(data);
      },
      onSuccess: () => {
        // Invalidate content hub queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['/api/content-hub'] });
        toast({
          title: "Content created",
          description: "Your content has been saved successfully",
          duration: 3000
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error creating content",
          description: error.message || "Something went wrong",
          variant: "destructive",
          duration: 5000
        });
      }
    });
  };

  // Update an existing content item
  const useUpdateContentItem = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number, data: Partial<Omit<ContentItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> }) => {
        return updateContentItem(id, data);
      },
      onSuccess: (_data, variables) => {
        // Invalidate specific content item query and list queries
        queryClient.invalidateQueries({ queryKey: ['/api/content-hub/item', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/content-hub'] });
        toast({
          title: "Content updated",
          description: "Your content has been updated successfully",
          duration: 3000
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating content",
          description: error.message || "Something went wrong",
          variant: "destructive",
          duration: 5000
        });
      }
    });
  };

  // Delete a content item
  const useDeleteContentItem = () => {
    return useMutation({
      mutationFn: (id: number) => {
        return deleteContentItem(id);
      },
      onSuccess: () => {
        // Invalidate content hub queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['/api/content-hub'] });
        toast({
          title: "Content deleted",
          description: "Your content has been deleted successfully",
          duration: 3000
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error deleting content",
          description: error.message || "Something went wrong",
          variant: "destructive",
          duration: 5000
        });
      }
    });
  };

  // Save generated content
  const useSaveGeneratedContent = () => {
    return useMutation({
      mutationFn: (data: {
        title: string;
        content: string;
        contentType: string;
        category?: string;
        tags?: string[];
      }) => {
        return saveGeneratedContent(data);
      },
      onSuccess: () => {
        // Invalidate content hub queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['/api/content-hub'] });
        toast({
          title: "Content saved",
          description: "Your generated content has been saved successfully",
          duration: 3000
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error saving content",
          description: error.message || "Something went wrong",
          variant: "destructive",
          duration: 5000
        });
      }
    });
  };

  return {
    useAllContentItems,
    useContentItemsByType,
    useContentItemsByCategory,
    useContentItemsByTag,
    useContentItem,
    useCreateContentItem,
    useUpdateContentItem,
    useDeleteContentItem,
    useSaveGeneratedContent
  };
}