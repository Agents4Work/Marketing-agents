/**
 * Drafts Service
 * 
 * This module provides functionality to work with saved drafts, including
 * fetching, creating, updating, and deleting drafts.
 */

export interface Draft {
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
  userId: string;
}

export interface DraftInput {
  title: string;
  content: string;
  contentType: string;
  tags?: string[];
}

/**
 * Fetch all drafts for the current user
 */
export async function fetchDrafts(): Promise<Draft[]> {
  try {
    const response = await fetch('/api/drafts');
    if (!response.ok) {
      throw new Error(`Error fetching drafts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch drafts:', error);
    return [];
  }
}

/**
 * Fetch a specific draft by ID
 */
export async function fetchDraftById(id: string): Promise<Draft | null> {
  try {
    const response = await fetch(`/api/drafts/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching draft: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch draft ${id}:`, error);
    return null;
  }
}

/**
 * Create a new draft
 */
export async function createDraft(draft: DraftInput): Promise<Draft | null> {
  try {
    const response = await fetch('/api/drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error(`Error creating draft: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create draft:', error);
    return null;
  }
}

/**
 * Update an existing draft
 */
export async function updateDraft(id: string, draft: Partial<DraftInput>): Promise<Draft | null> {
  try {
    const response = await fetch(`/api/drafts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error(`Error updating draft: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update draft ${id}:`, error);
    return null;
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/drafts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting draft: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete draft ${id}:`, error);
    return false;
  }
}

/**
 * Toggle star status of a draft
 */
export async function toggleStarDraft(id: string, starred: boolean): Promise<Draft | null> {
  try {
    const response = await fetch(`/api/drafts/${id}/star`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ starred }),
    });

    if (!response.ok) {
      throw new Error(`Error starring draft: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to star draft ${id}:`, error);
    return null;
  }
}

/**
 * Update draft status (draft, published, archived)
 */
export async function updateDraftStatus(id: string, status: 'draft' | 'published' | 'archived'): Promise<Draft | null> {
  try {
    const response = await fetch(`/api/drafts/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Error updating draft status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update draft status ${id}:`, error);
    return null;
  }
}