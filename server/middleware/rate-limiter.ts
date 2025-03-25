/**
 * Simple Rate Limiter Middleware
 * 
 * This implements a basic in-memory rate limiting solution to protect API endpoints
 * from abuse and brute force attacks. This is a simplified version that doesn't require
 * external dependencies.
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitOptions {
  windowMs?: number;       // Time window in milliseconds
  max?: number;            // Maximum number of requests in the time window
  message?: string;        // Error message to return
  statusCode?: number;     // HTTP status code for rate limit exceeded
  keyGenerator?: (req: Request) => string; // Function to generate a unique key for the request
}

/**
 * IP-based rate limiter middleware
 */
export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // Default: 1 minute
  const max = options.max || 100; // Default: 100 requests per minute
  const message = options.message || 'Too many requests, please try again later.';
  const statusCode = options.statusCode || 429; // 429 Too Many Requests
  
  // Default key generator uses IP address
  const keyGenerator = options.keyGenerator || ((req: Request) => {
    const ip = req.ip || 
               req.headers['x-forwarded-for'] || 
               req.socket.remoteAddress || 
               'unknown';
    return typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : 'unknown';
  });
  
  // In-memory store for rate limiting
  const store: RateLimitStore = {};
  
  // Cleanup old entries periodically
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, windowMs);
  
  // Prevent the Node.js process from exiting while cleanup is active
  cleanup.unref();
  
  return function(req: Request, res: Response, next: NextFunction) {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Increment the counter
    store[key].count += 1;
    
    // Set headers to inform clients about rate limits
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000).toString());
    
    // Check if rate limit exceeded
    if (store[key].count > max) {
      return res.status(statusCode).json({
        error: 'Rate limit exceeded',
        message: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

/**
 * Stricter rate limiter for sensitive routes like authentication
 */
export function authRateLimiter() {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many login attempts, please try again later.',
    keyGenerator: (req: Request) => {
      // Use IP + URL path as key for more specific limiting
      const ip = req.ip || 
                req.headers['x-forwarded-for'] || 
                req.socket.remoteAddress || 
                'unknown';
      const ipStr = typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : 'unknown';
      return `${ipStr}:${req.path}`;
    }
  });
}

/**
 * API rate limiter for general API endpoints
 */
export function apiRateLimiter() {
  return rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute - increased for development
  });
}