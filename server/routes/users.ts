import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { ZodError } from 'zod';

const router = Router();

/**
 * @route GET /api/users/:uid
 * @desc Get a user by Firebase UID
 * @access Public (for testing purposes)
 */
router.get('/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    console.log('Fetching user with UID:', uid);
    
    // Try to get user from storage
    const user = await storage.getUserByUid(uid);
    
    if (!user) {
      console.log('User not found with UID:', uid);
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
});

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Public (for testing purposes)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = insertUserSchema.parse(req.body);
    
    // Create the user
    const user = await storage.createUser(validatedData);
    
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle validation errors
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user data',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update an existing user
 * @access Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    // Update the user with the storage instance
    const userUpdated = await storage.updateUser(parseInt(id), userData);
    
    if (!userUpdated) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: userUpdated
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle validation errors
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user data',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
});

export const usersRouter = router;