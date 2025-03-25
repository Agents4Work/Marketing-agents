import { Request, Response, NextFunction } from 'express';
import { admin, verifyIdToken } from '../firebase';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
    namespace Express {
      interface Request {
        user?: {
          uid: string;
          email?: string;
        };
      }
    }
}

/**
 * Authentication middleware to protect routes
 * This middleware verifies the Firebase ID token from the Authorization header
 * and adds the decoded user to the request object
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // For development, allow skipping auth if this header is present
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-bypass-auth'] === 'true') {
      console.log('🔄 Auth bypassed for development');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
      };
      return next();
    }
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }
    
    // Extract token from the Authorization header
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // First try to verify as a Firebase ID token
    try {
      const decodedToken = await verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      return next();
    } catch (firebaseError) {
      // If Firebase verification fails, try as a custom JWT token
      const jwtPayload = verifyToken(token);
      
      if (jwtPayload && jwtPayload.uid) {
        // Verify this is an access token, not a refresh token
        if (jwtPayload.tokenType !== 'access') {
          return res.status(401).json({ 
            message: 'Invalid token type',
            details: 'Refresh token cannot be used for authentication'
          });
        }
        
        req.user = {
          uid: jwtPayload.uid,
          email: jwtPayload.email
        };
        return next();
      }
      
      console.error('Token verification failed:', firebaseError);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Optional auth middleware - sets user if token is valid but doesn't reject if no token
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development, allow skipping auth if this header is present
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-bypass-auth'] === 'true') {
      console.log('🔄 Optional auth bypassed for development');
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
      };
      return next();
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }
    
    try {
      // First try to verify as a Firebase ID token
      try {
        const decodedToken = await verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
        };
      } catch (firebaseError) {
        // If Firebase verification fails, try as a custom JWT token
        const jwtPayload = verifyToken(token);
        
        if (jwtPayload && jwtPayload.uid) {
          req.user = {
            uid: jwtPayload.uid,
            email: jwtPayload.email
          };
        } else {
          // Just continue without setting the user if neither work
          console.log('🔄 Optional auth token verification skipped');
        }
      }
    } catch (error) {
      // Just continue without setting the user
      console.log('🔄 Optional auth token verification skipped due to error');
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};