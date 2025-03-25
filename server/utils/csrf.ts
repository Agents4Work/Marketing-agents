/**
 * CSRF Protection Utilities
 * 
 * This module provides enhanced CSRF protection utilities for
 * generating, validating, and managing CSRF tokens.
 */

import crypto from 'crypto';
import { Request } from 'express';

// Default token expiry time (2 hours)
const DEFAULT_EXPIRY = 7200000; // 2 hours in milliseconds

/**
 * Generate a CSRF token
 * Creates a signed token with an expiration timestamp
 */
export function generateToken(secret: string, expiry: number = DEFAULT_EXPIRY): string {
  const timestamp = Date.now() + expiry;
  const payload = `${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify a CSRF token
 * Checks the token's signature and expiration time
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    const [timestamp, signature] = token.split('.');
    
    // Check if token has expired
    if (parseInt(timestamp, 10) < Date.now()) {
      return false;
    }
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(timestamp).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
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
  headerName: string = 'x-csrf-token',
  bodyField: string = '_csrf',
  queryField: string = '_csrf'
): string | null {
  // Check headers first (most secure)
  const headerToken = req.headers[headerName.toLowerCase()] as string;
  if (headerToken) {
    return headerToken;
  }
  
  // Check body (for form submissions)
  if (req.body && req.body[bodyField]) {
    return req.body[bodyField];
  }
  
  // Check query parameters (least secure)
  if (req.query && req.query[queryField]) {
    return req.query[queryField] as string;
  }
  
  return null;
}