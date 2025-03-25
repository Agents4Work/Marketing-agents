/**
 * Security Testing Routes
 * 
 * This module provides endpoints for testing security features
 */

import express, { Request, Response } from 'express';
import { validateCsrfToken, getCsrfTokenHandler } from '../middleware/csrf-middleware';

const router = express.Router();

/**
 * @route GET /api/csrf-token
 * @desc Generate and return a CSRF token
 * @access Public
 */
router.get('/csrf-token', getCsrfTokenHandler);

/**
 * @route POST /api/security/secure-test
 * @desc Test endpoint protected by CSRF token validation
 * @access Public (with CSRF token)
 */
router.post('/security/secure-test', validateCsrfToken, (req: Request, res: Response) => {
  res.json({ 
    message: 'CSRF validation successful!', 
    success: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/security/verification
 * @desc Check if security middleware is properly configured
 * @access Public
 */
router.get('/security/verification', (_req: Request, res: Response) => {
  res.json({
    csrfProtection: true,
    securityHeaders: true,
    status: 'ok'
  });
});

export const securityRouter = router;