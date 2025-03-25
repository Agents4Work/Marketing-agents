/**
 * CSRF Token Middleware
 * 
 * This file implements robust CSRF protection using secure token generation
 * and verification. It provides middleware for generating and validating CSRF tokens.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Constants
const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_COOKIE = 'csrf_token';
const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-key';

/**
 * Generate a CSRF token with expiration and signature
 */
export function generateToken(secret: string = SECRET, expiry: number = DEFAULT_EXPIRY): string {
  const randomToken = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + expiry;
  const data = `${randomToken}|${expires}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  return `${data}|${signature}`;
}

/**
 * Verify a CSRF token
 * Checks the token's signature and expiration time
 */
export function verifyToken(token: string, secret: string = SECRET): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('|');
  if (parts.length !== 3) {
    return false;
  }
  
  const [randomToken, expiresStr, receivedSignature] = parts;
  const expires = parseInt(expiresStr, 10);
  
  // Check expiration
  if (isNaN(expires) || Date.now() > expires) {
    return false;
  }
  
  // Verify signature
  const data = `${randomToken}|${expires}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const expectedSignature = hmac.digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (err) {
    return false;
  }
}

/**
 * Generate a CSRF secret suitable for use with this module
 */
export function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get token from request
 * Extracts token from header, body or query params in that order
 */
export function getTokenFromRequest(
  req: Request,
  headerName: string = CSRF_HEADER,
  bodyField: string = '_csrf',
  queryField: string = '_csrf'
): string | undefined {
  // Check header (case insensitive)
  const token = 
    req.headers[headerName.toLowerCase()] || 
    req.headers[headerName] ||
    req.body?.[bodyField] || 
    req.query?.[queryField];
  
  return token as string | undefined;
}

/**
 * Middleware to attach a CSRF token to the response
 * This adds the token as both a cookie and a response header
 */
export function attachCsrfToken(req: Request, res: Response, next: NextFunction) {
  const token = generateToken();
  
  // Set cookie
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DEFAULT_EXPIRY
  });
  
  // Set header for SPA to access
  res.setHeader(CSRF_HEADER, token);
  
  next();
}

/**
 * Middleware to verify a CSRF token
 * This validates tokens from headers, body, or query parameters
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip validation for safe methods (GET, HEAD, OPTIONS)
  if (/^(GET|HEAD|OPTIONS)$/i.test(req.method)) {
    return next();
  }
  
  const token = getTokenFromRequest(req);
  
  if (!token || !verifyToken(token)) {
    return res.status(403).json({
      error: 'Invalid CSRF Token',
      message: 'Invalid or expired security token. Please refresh the page and try again.'
    });
  }
  
  next();
}

/**
 * API endpoint handler that returns a new CSRF token
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const token = generateToken();
  
  // Set cookie
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DEFAULT_EXPIRY
  });
  
  // Return in response body
  res.json({ token });
}