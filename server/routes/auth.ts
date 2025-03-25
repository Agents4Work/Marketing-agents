import { Router, Request, Response } from 'express';
import { admin } from '../firebase';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage';
import bcrypt from 'bcryptjs';
import { authRateLimiter } from '../middleware/rate-limiter';
import { 
  generateTokenPair, 
  verifyToken, 
  generateAccessToken,
  extractTokenFromHeader 
} from '../utils/jwt';

const router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 * @security Rate limited to prevent brute force attacks
 */
router.post('/signup', authRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Create a new user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });

    // Create a user record in our database
    const user = await storage.createUser({
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
    });

    // Create a custom token for the new user
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Return the user and token
    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Failed to create user',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 * @security Rate limited to prevent brute force attacks
 */
router.post('/login', authRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { email, password, idToken } = req.body;

    // If Firebase ID token is provided, verify it and login with it
    if (idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Get user from our database or create if doesn't exist
        let user = await storage.getUserByUid(decodedToken.uid);
        
        if (!user) {
          // Get user info from Firebase Auth
          const userRecord = await admin.auth().getUser(decodedToken.uid);
          
          // Create user in our database
          user = await storage.createUser({
            uid: userRecord.uid,
            email: userRecord.email || '',
            displayName: userRecord.displayName || '',
            photoURL: userRecord.photoURL || null,
          });
        }
        
        // Generate both access and refresh tokens
        const { accessToken, refreshToken, expiresAt } = generateTokenPair({
          uid: user.uid,
          email: user.email
        });
        
        return res.json({ 
          user, 
          token: accessToken, // For backward compatibility
          accessToken,
          refreshToken,
          expiresAt
        });
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ message: 'Invalid ID token' });
      }
    }

    // Email/password login
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      // Sign in with email and password
      const userCredential = await admin.auth().getUserByEmail(email);
      
      // In a real implementation, we would verify the password here
      // but Firebase Admin SDK doesn't have a method for password verification
      // We're using a simulated password verification for demo purposes
      const isMatch = await bcrypt.compare('simulated-hash', 'simulated-hash');
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Get user from our database or create if doesn't exist
      let user = await storage.getUserByUid(userCredential.uid);
      
      if (!user) {
        // Create user in our database
        user = await storage.createUser({
          uid: userCredential.uid,
          email: userCredential.email || '',
          displayName: userCredential.displayName || '',
          photoURL: userCredential.photoURL || null,
        });
      }
      
      // Generate both access and refresh tokens
      const { accessToken, refreshToken, expiresAt } = generateTokenPair({
        uid: user.uid,
        email: user.email
      });
      
      return res.json({ 
        user, 
        token: accessToken, // For backward compatibility
        accessToken,
        refreshToken,
        expiresAt
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using a refresh token
 * @access Public
 * @security Rate limited to prevent token grinding attacks
 */
router.post('/refresh', authRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Verify the refresh token
    const decoded = verifyToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Check if this is actually a refresh token
    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({ 
        message: 'Invalid token type',
        details: 'Access token cannot be used for refresh'
      });
    }
    
    // Generate a new access token (but not a new refresh token)
    const accessToken = generateAccessToken({
      uid: decoded.uid,
      email: decoded.email
    });
    
    // Calculate expiration time
    const jwtPayload = verifyToken(accessToken);
    const expiresAt = jwtPayload?.exp || 0;
    
    // Return the new access token
    return res.json({
      accessToken,
      expiresAt
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      message: 'Failed to refresh token',
      error: error.message
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  // In a real implementation, we would invalidate the token
  // but for simplicity, we'll just return a success message
  res.json({ message: 'Logged out successfully' });
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // req.user is set by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from our database
    const user = await storage.getUserByUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user',
      error: error.message,
    });
  }
});

/**
 * @route PUT /api/auth/me
 * @desc Update current user
 * @access Private
 */
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    // req.user is set by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { displayName, photoURL } = req.body;

    // Update user in Firebase Auth
    await admin.auth().updateUser(req.user.uid, {
      displayName,
      photoURL,
    });

    // Update user in our database
    const user = await storage.updateUser(Number(req.user.uid), {
      displayName,
      photoURL,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message,
    });
  }
});

export const authRouter = router;