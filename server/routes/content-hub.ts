import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';
import { insertContentItemSchema } from '@shared/schema';

const router = Router();

/**
 * @route GET /api/content-hub
 * @desc Get all content items for the current user
 * @access Private
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all content items for this user
    const contentItems = await storage.getContentItemsByUserId(user.id);
    
    res.json({ contentItems });
  } catch (error: any) {
    console.error('Get content items error:', error);
    res.status(500).json({
      message: 'Failed to get content items',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/content-hub/type/:type
 * @desc Get content items by type for the current user
 * @access Private
 */
router.get('/type/:type', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const contentType = req.params.type;

    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get content items by type for this user
    const contentItems = await storage.getContentItemsByType(user.id, contentType);
    
    res.json({ contentItems });
  } catch (error: any) {
    console.error('Get content items by type error:', error);
    res.status(500).json({
      message: 'Failed to get content items by type',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/content-hub/category/:category
 * @desc Get content items by category for the current user
 * @access Private
 */
router.get('/category/:category', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const category = req.params.category;

    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get content items by category for this user
    const contentItems = await storage.getContentItemsByCategory(user.id, category);
    
    res.json({ contentItems });
  } catch (error: any) {
    console.error('Get content items by category error:', error);
    res.status(500).json({
      message: 'Failed to get content items by category',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/content-hub/tag/:tag
 * @desc Get content items by tag for the current user
 * @access Private
 */
router.get('/tag/:tag', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tag = req.params.tag;

    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get content items by tag for this user
    const contentItems = await storage.getContentItemsByTag(user.id, tag);
    
    res.json({ contentItems });
  } catch (error: any) {
    console.error('Get content items by tag error:', error);
    res.status(500).json({
      message: 'Failed to get content items by tag',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/content-hub
 * @desc Create a new content item
 * @access Private
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate request body
    const validatedData = insertContentItemSchema.parse({
      ...req.body,
      userId: user.id 
    });

    // Create content item
    const contentItem = await storage.createContentItem(validatedData);
    
    res.status(201).json({ contentItem });
  } catch (error: any) {
    console.error('Create content item error:', error);
    
    // Handle validation errors specifically
    if (error.errors) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: 'Failed to create content item',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/content-hub/:id
 * @desc Get a specific content item by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const contentItemId = parseInt(req.params.id);
    
    if (isNaN(contentItemId)) {
      return res.status(400).json({ message: 'Invalid content item ID' });
    }
    
    // Get content item
    const contentItem = await storage.getContentItem(contentItemId);
    
    if (!contentItem) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || contentItem.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this content item' });
    }
    
    res.json({ contentItem });
  } catch (error: any) {
    console.error('Get content item error:', error);
    res.status(500).json({
      message: 'Failed to get content item',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/content-hub/:id
 * @desc Update a specific content item by ID
 * @access Private
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const contentItemId = parseInt(req.params.id);
    
    if (isNaN(contentItemId)) {
      return res.status(400).json({ message: 'Invalid content item ID' });
    }
    
    // Get content item
    const contentItem = await storage.getContentItem(contentItemId);
    
    if (!contentItem) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || contentItem.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this content item' });
    }
    
    // Update content item (excluding userId)
    const updatedContentItem = await storage.updateContentItem(contentItemId, {
      ...req.body,
      userId: contentItem.userId // Ensure userId cannot be changed
    });
    
    res.json({ contentItem: updatedContentItem });
  } catch (error: any) {
    console.error('Update content item error:', error);
    
    // Handle validation errors
    if (error.errors) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: 'Failed to update content item',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/content-hub/:id
 * @desc Delete a specific content item by ID
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const contentItemId = parseInt(req.params.id);
    
    if (isNaN(contentItemId)) {
      return res.status(400).json({ message: 'Invalid content item ID' });
    }
    
    // Get content item
    const contentItem = await storage.getContentItem(contentItemId);
    
    if (!contentItem) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || contentItem.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this content item' });
    }
    
    // Delete content item
    const deleted = await storage.deleteContentItem(contentItemId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete content item' });
    }
    
    res.json({ message: 'Content item deleted successfully' });
  } catch (error: any) {
    console.error('Delete content item error:', error);
    res.status(500).json({
      message: 'Failed to delete content item',
      error: error.message,
    });
  }
});

export const contentHubRouter = router;