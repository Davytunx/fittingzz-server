import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { successResponse } from '../../utils/response.js';
import { asyncHandler } from '../../middleware/error.middleware.js';
import { cookies } from '../../utils/cookies.js';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export class UserController {
  constructor(private userService = new UserService()) {}

  /**
   * Register new user
   */
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.register(req.body);
    
    // Set secure HTTP-only cookie
    cookies.set(res, 'auth_token', result.token, { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
    
    successResponse(res, { user: result.user }, 'User registered successfully', 201);
  });



  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.login(req.body);
    
    // Set secure HTTP-only cookie
    cookies.set(res, 'auth_token', result.token, { maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
    
    successResponse(res, { user: result.user }, 'Login successful');
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    cookies.clear(res, 'auth_token');
    successResponse(res, null, 'Logout successful');
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as unknown as AuthenticatedRequest).user.userId;
    const user = await this.userService.getProfile(userId);
    
    successResponse(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as unknown as AuthenticatedRequest).user.userId;
    const user = await this.userService.updateProfile(userId, req.body);
    
    successResponse(res, user, 'Profile updated successfully');
  });

  /**
   * Delete user account
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as unknown as AuthenticatedRequest).user.userId;
    await this.userService.deleteAccount(userId);
    
    // Clear auth cookie
    cookies.clear(res, 'auth_token');
    
    successResponse(res, null, 'Account deleted successfully');
  });
}

export const userController = new UserController();

// Export individual methods for easier testing
export const { register, login, logout, getProfile, updateProfile, deleteAccount } = userController;