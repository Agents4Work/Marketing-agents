import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

/**
 * @route GET /api/content
 * @desc Get all content for the current user
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

    // Get user's campaigns (content)
    const campaigns = await storage.getCampaignsByUserId(user.id);
    
    res.json({ campaigns });
  } catch (error: any) {
    console.error('Get content error:', error);
    res.status(500).json({
      message: 'Failed to get content',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/content
 * @desc Create a new content/campaign
 * @access Private
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, status, type, data } = req.body;
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create campaign
    const campaign = await storage.createCampaign({
      userId: user.id,
      name,
      description: description || '',
      status: status || 'draft',
      type: type || 'campaign', 
      data: data || {}
    });
    
    res.status(201).json({ campaign });
  } catch (error: any) {
    console.error('Create content error:', error);
    res.status(500).json({
      message: 'Failed to create content',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/content/:id
 * @desc Get a specific content by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this campaign' });
    }
    
    res.json({ campaign });
  } catch (error: any) {
    console.error('Get content error:', error);
    res.status(500).json({
      message: 'Failed to get content',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/content/:id
 * @desc Update a specific content by ID
 * @access Private
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this campaign' });
    }
    
    const { name, description, status, type, data } = req.body;
    
    // Update campaign
    const updatedCampaign = await storage.updateCampaign(campaignId, {
      name,
      description,
      status,
      type,
      data
    });
    
    res.json({ campaign: updatedCampaign });
  } catch (error: any) {
    console.error('Update content error:', error);
    res.status(500).json({
      message: 'Failed to update content',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/content/:id
 * @desc Delete a specific content by ID
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this campaign' });
    }
    
    // Delete campaign
    const deleted = await storage.deleteCampaign(campaignId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete campaign' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error: any) {
    console.error('Delete content error:', error);
    res.status(500).json({
      message: 'Failed to delete content',
      error: error.message,
    });
  }
});

export const contentRouter = router;