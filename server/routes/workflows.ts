import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

/**
 * @route GET /api/workflows
 * @desc Get all workflows for the current user's campaign
 * @access Private
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { campaignId } = req.query;
    
    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }
    
    const campaignIdNumber = parseInt(campaignId);
    
    if (isNaN(campaignIdNumber)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    // Get campaign to ensure it exists
    const campaign = await storage.getCampaign(campaignIdNumber);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this campaign' });
    }
    
    // Get workflows for campaign
    const workflows = await storage.getWorkflowsByCampaignId(campaignIdNumber);
    
    res.json({ workflows });
  } catch (error: any) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      message: 'Failed to get workflows',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/workflows
 * @desc Create a new workflow for a campaign
 * @access Private
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { campaignId, name, description, nodes, edges } = req.body;
    
    if (!campaignId || !name) {
      return res.status(400).json({ message: 'Campaign ID and name are required' });
    }
    
    // Get campaign to ensure it exists
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this campaign' });
    }
    
    // Create workflow
    const workflow = await storage.createWorkflow({
      campaignId,
      name,
      description: description || '',
      status: 'draft',
      nodes: nodes || [],
      edges: edges || []
    });
    
    res.status(201).json({ workflow });
  } catch (error: any) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      message: 'Failed to create workflow',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/workflows/:id
 * @desc Get a specific workflow by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ message: 'Invalid workflow ID' });
    }
    
    // Get workflow
    const workflow = await storage.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    // Get campaign to ensure user has access
    const campaign = await storage.getCampaign(workflow.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this workflow' });
    }
    
    res.json({ workflow });
  } catch (error: any) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      message: 'Failed to get workflow',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/workflows/:id
 * @desc Update a specific workflow by ID
 * @access Private
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ message: 'Invalid workflow ID' });
    }
    
    // Get workflow
    const workflow = await storage.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    // Get campaign to ensure user has access
    const campaign = await storage.getCampaign(workflow.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this workflow' });
    }
    
    const { name, description, status, nodes, edges } = req.body;
    
    // Update workflow
    const updatedWorkflow = await storage.updateWorkflow(workflowId, {
      name,
      description,
      status,
      nodes,
      edges
    });
    
    res.json({ workflow: updatedWorkflow });
  } catch (error: any) {
    console.error('Update workflow error:', error);
    res.status(500).json({
      message: 'Failed to update workflow',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/workflows/:id
 * @desc Delete a specific workflow by ID
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const workflowId = parseInt(req.params.id);
    
    if (isNaN(workflowId)) {
      return res.status(400).json({ message: 'Invalid workflow ID' });
    }
    
    // Get workflow
    const workflow = await storage.getWorkflow(workflowId);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    // Get campaign to ensure user has access
    const campaign = await storage.getCampaign(workflow.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get user from database to ensure they exist
    const user = await storage.getUserByUid(req.user.uid);
    
    if (!user || campaign.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this workflow' });
    }
    
    // Delete workflow
    const deleted = await storage.deleteWorkflow(workflowId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete workflow' });
    }
    
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error: any) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      message: 'Failed to delete workflow',
      error: error.message,
    });
  }
});

export const workflowsRouter = router;