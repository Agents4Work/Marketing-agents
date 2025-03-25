/**
 * Security Middleware
 * 
 * This module provides basic security middleware functions
 * without any CSRF token functionality.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Apply security headers to protect against common web vulnerabilities
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Control framing of the page
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy - can be expanded as needed
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
  }
  
  next();
}

/**
 * Validates the content type of requests to prevent unexpected input
 */
export function contentTypeCheck(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  
  // Only check content-type for POST, PUT, PATCH requests with body
  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && 
      Object.keys(req.body || {}).length > 0) {
    
    const contentType = req.headers['content-type'] || '';
    
    // Ensure proper JSON content type for API requests
    if (!contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data') && 
        !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Expected application/json, multipart/form-data, or application/x-www-form-urlencoded'
      });
    }
  }
  
  next();
}

/**
 * CSRF protection middleware
 * This provides protection against Cross-Site Request Forgery attacks
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // This is a placeholder that should be replaced with actual CSRF middleware
  // See the csrf.ts file for full implementation
  next();
}

/**
 * Middleware to set a new CSRF token
 * This should be used on routes that render forms or on initial page load
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  // This is a placeholder that should be replaced with actual CSRF token setter
  // See the csrf.ts file for full implementation
  next();
}

/**
 * Complete security middleware that combines all protections
 * Apply this to routes that need full security
 */
export function applyFullSecurity(req: Request, res: Response, next: NextFunction) {
  securityHeaders(req, res, () => {
    contentTypeCheck(req, res, () => {
      // The actual csrfProtection from csrf.ts should be used here
      next();
    });
  });
}