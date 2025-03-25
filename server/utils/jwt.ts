/**
 * JWT Security Utilities
 * 
 * This module provides enhanced JWT security utilities for token generation,
 * validation, and related security functions.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Default JWT secret for development 
// (Override with environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'development-jwt-secret-key-change-in-production';

// Access token expiry time (15 minutes)
const ACCESS_TOKEN_EXPIRY = '15m';

// Refresh token expiry time (7 days)
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate a secure random secret suitable for JWT signing
 */
function generateSecureSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Generate an access token for a user
 */
export function generateAccessToken(payload: object): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate a refresh token for a user
 * Includes a unique token ID (jti) for token revocation capability
 */
export function generateRefreshToken(payload: object): string {
  const jti = crypto.randomBytes(16).toString('hex');
  
  return jwt.sign(
    { ...payload, jti },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Generate both access and refresh tokens for a user
 */
export function generateTokenPair(payload: object): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: Date.now() + 15 * 60 * 1000 // 15 minutes in milliseconds
  };
}

/**
 * Create a token hash for storage
 * This prevents storing the actual tokens in the database
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Extract a token from the Authorization header
 */
export function extractTokenFromHeader(header?: string): string | null {
  if (!header) {
    return null;
  }
  
  // Check for Bearer token
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}