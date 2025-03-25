/**
 * CSRF Protection Middleware
 * 
 * This module provides robust CSRF protection using token validation.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Constants
const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE = 'csrf_token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a secure CSRF token
 * The token is a combination of a random value and an expiration timestamp
 */
export function generateToken(): string {
  const randomValue = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now() + TOKEN_EXPIRY;
  const tokenData = `${randomValue}|${timestamp}`;
  
  // Create HMAC for token verification
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY || 'csrf-secret-key');
  hmac.update(tokenData);
  const signature = hmac.digest('hex');
  
  return `${tokenData}|${signature}`;
}

/**
 * Verify a CSRF token
 * Checks that the token has a valid signature and hasn't expired
 */
export function verifyToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('|');
  if (parts.length !== 3) {
    return false;
  }
  
  const [randomValue, timestampStr, receivedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  
  // Check if token has expired
  if (isNaN(timestamp) || Date.now() > timestamp) {
    return false;
  }
  
  // Verify signature
  const tokenData = `${randomValue}|${timestamp}`;
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY || 'csrf-secret-key');
  hmac.update(tokenData);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Middleware to issue a new CSRF token
 * Adds the token to cookies and response headers
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = generateToken();
  
  // Set in cookie
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY
  });
  
  // Set in response header for SPA to access
  res.setHeader(CSRF_HEADER, token);
  
  next();
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 * Checks for a valid token in the request headers, body, or query params
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip validation for safe methods
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(req.method);
  if (safeMethod) {
    return next();
  }
  
  // Get token from headers, body, or query
  const token = 
    req.headers[CSRF_HEADER.toLowerCase()] || 
    req.body?._csrf || 
    req.query?._csrf || 
    '';
  
  // Verify the token
  if (!verifyToken(token as string)) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'Invalid or expired security token. Please refresh the page and try again.'
    });
  }
  
  next();
}

/**
 * Handler for CSRF token endpoint
 * Returns a new CSRF token
 */
export function csrfTokenHandler(req: Request, res: Response) {
  const token = generateToken();
  
  // Set in cookie
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY
  });
  
  // Return token in response for client to store
  res.json({ token });
}