/**
 * Middleware Index
 * 
 * This file exports all middleware functions and provides helper functions
 * to apply security middleware in the correct order.
 */

import * as express from 'express';
import { securityHeaders, contentTypeCheck } from './security';
import { validateCsrfToken, attachCsrfToken } from './csrf-middleware';
import { errorHandler } from './errorHandler';

export {
  securityHeaders,
  contentTypeCheck,
  validateCsrfToken,
  attachCsrfToken,
  errorHandler
};

/**
 * Apply security middleware to an Express application
 * This function applies all necessary security middleware in the correct order
 */
export function applySecurityMiddleware(app: express.Application, isProduction: boolean = false) {
  // Set security headers
  app.use(securityHeaders);
  
  // Validate content type on requests
  app.use(contentTypeCheck);
  
  // Add CSRF token endpoints
  app.get('/api/csrf-token', attachCsrfToken, (req, res) => {
    res.json({ csrfToken: req.headers['x-csrf-token'] || '' });
  });
  
  // Apply CSRF validation to API routes
  if (isProduction) {
    app.use('/api', validateCsrfToken);
  } else {
    // In development, only apply to specific test endpoints
    app.use('/api/secure-test', validateCsrfToken);
    app.use('/api/security-verification', validateCsrfToken);
  }
  
  // Global error handler should be last
  app.use(errorHandler);
}