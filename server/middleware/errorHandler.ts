/**
 * Error Handler Middleware
 * 
 * This middleware provides consistent error handling for API routes,
 * with detailed error responses and appropriate status codes.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Extended Error interface that includes API specific properties
 */
export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
  code?: string;
  isOperational?: boolean;
}

/**
 * Create a custom API error with status code and details
 */
export function createApiError(
  message: string,
  statusCode: number = 500,
  details?: any,
  code: string = 'INTERNAL_ERROR'
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.details = details;
  error.code = code;
  error.isOperational = true; // Mark as an expected operational error
  return error;
}

/**
 * Main error handler middleware
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', err);
  
  // Print stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Determine HTTP status code
  const statusCode = err.statusCode || 500;
  
  // Build error response object
  const errorResponse = {
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };
  
  // Include additional details in development environment
  if (process.env.NODE_ENV === 'development' && err.details) {
    Object.assign(errorResponse, { details: err.details });
  }
  
  // Send response with appropriate status code
  res.status(statusCode).json(errorResponse);
}

/**
 * Error handler for async route handlers
 * Wraps route handlers to catch errors and pass them to the error middleware
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler for routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = createApiError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    { availableRoutes: 'Check API documentation for available routes' },
    'NOT_FOUND'
  );
  next(error);
}