import { apiRequest } from '@/lib/queryClient';
import { ContentItem } from '@shared/schema';

const API_BASE = '/api/content-hub';

// Get all content items for the current user
export async function getAllContentItems() {
  return apiRequest(API_BASE);
}

// Get content items by content type
export async function getContentItemsByType(contentType: string) {
  return apiRequest(`${API_BASE}/type/${contentType}`);
}

// Get content items by category
export async function getContentItemsByCategory(category: string) {
  return apiRequest(`${API_BASE}/category/${category}`);
}

// Get content items by tag
export async function getContentItemsByTag(tag: string) {
  return apiRequest(`${API_BASE}/tag/${tag}`);
}

// Get a specific content item by ID
export async function getContentItemById(id: number) {
  return apiRequest(`${API_BASE}/${id}`);
}

// Create a new content item
export async function createContentItem(data: Omit<ContentItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  return apiRequest(API_BASE, 'POST', data);
}

// Update an existing content item
export async function updateContentItem(id: number, data: Partial<Omit<ContentItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
  return apiRequest(`${API_BASE}/${id}`, 'PUT', data);
}

// Delete a content item
export async function deleteContentItem(id: number) {
  return apiRequest(`${API_BASE}/${id}`, 'DELETE');
}

// Save generated content as a content item
export async function saveGeneratedContent({
  title,
  content,
  contentType,
  category,
  tags = []
}: {
  title: string;
  content: string;
  contentType: string;
  category?: string | null;
  tags?: string[] | null;
}) {
  return createContentItem({
    title,
    content,
    contentType,
    category: category || null,
    tags: tags || null,
    status: 'draft',
    description: `Generated ${contentType} content`,
    metadata: { generatedAt: new Date().toISOString() },
  });
}