import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors.js';
import { userService } from '../modules/user/user.service.js';
import { cookies } from '../utils/cookies.js';

/**
 * Authentication middleware - supports both Bearer token and cookies
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = cookies.get(req, 'auth_token');
    }

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = userService.verifyToken(token);
    
    // Add user info to request
    (req as Request & { user: typeof decoded }).user = decoded;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware for specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: { role: string } }).user;
    
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (!roles.includes(user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    
    next();
  };
};

/**
 * Optional authentication - doesn't throw error if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = cookies.get(req, 'auth_token');
    }

    if (token) {
      const decoded = userService.verifyToken(token);
      (req as Request & { user: typeof decoded }).user = decoded;
    }
    
    next();
  } catch {
    // Continue without authentication
    next();
  }
};