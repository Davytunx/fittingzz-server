import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../interfaces/repository.interface.js';
import { UserRepository } from './user.repository.js';
import { SignupDto, LoginDto, UserResponseDto } from './user.dto.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import config from '../../config/index.js';
import logger from '../../config/logger.js';
import { jwtToken } from '../../utils/jwt.js';
import { emailQueue, analyticsQueue } from '../../services/queue.service.js';

export class UserService {
  constructor(private userRepo: IUserRepository = new UserRepository()) {}

  /**
   * Register new user
   */
  async register(userData: SignupDto): Promise<{ user: UserResponseDto; token: string }> {
    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password (optimized for speed)
    const hashedPassword = await bcrypt.hash(userData.password, config.bcrypt.saltRounds);

    // Create user
    const user = await this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await this.userRepo.setEmailVerificationCode(user.id, verificationCode, verificationExpiresAt);

    // Generate JWT token
    const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

    // Queue background jobs (fire-and-forget)
    process.nextTick(() => this.queueBackgroundJobs(user, verificationCode));

    // Return user without sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user;

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user: userResponse as UserResponseDto,
      token,
    };
  }

  /**
   * Login user
   */
  async login(loginData: LoginDto): Promise<{ user: UserResponseDto; token: string }> {
    // Find user by email
    const user = await this.userRepo.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepo.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

    // Queue login analytics (fire-and-forget)
    process.nextTick(() => this.queueLoginAnalytics(user));

    // Return user without sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user;

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user: userResponse as UserResponseDto,
      token,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<SignupDto>): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, config.bcrypt.saltRounds);
    }

    const updatedUser = await this.userRepo.update(userId, updateData);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = updatedUser;
    return userResponse as UserResponseDto;
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepo.delete(userId);
    logger.info('User account deleted', { userId });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      return jwtToken.verify(token) as { userId: string; email: string; role: string };
    } catch {
      throw new UnauthorizedError('Invalid token');
    }
  }

  /**
   * Verify email with code
   */
  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.verifyEmailWithCode(email, code);
    
    if (!user) {
      return { success: false, message: 'Invalid or expired verification code' };
    }

    logger.info('Email verified successfully', { userId: user.id, email: user.email });
    return { success: true, message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If the email exists, a verification code has been sent' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email is already verified' };
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await this.userRepo.setEmailVerificationCode(user.id, verificationCode, verificationExpiresAt);

    // Send verification email
    try {
      if (emailQueue) {
        emailQueue.add('verification-email', {
          type: 'verification',
          email: user.email,
          data: { businessName: user.businessName, verificationCode }
        });
      } else {
        const { emailService } = await import('../../services/email.service.js');
        await emailService.sendVerificationEmail(user.email, user.businessName, verificationCode);
      }

      logger.info('Verification email resent', { userId: user.id, email: user.email });
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      logger.error('Failed to resend verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Queue background jobs for new user registration
   */
  private queueBackgroundJobs(user: { id: string; email: string; businessName: string }, verificationCode?: string): void {
    try {
      if (emailQueue) {
        // Send verification email first
        if (verificationCode) {
          emailQueue.add('verification-email', {
            type: 'verification',
            email: user.email,
            data: { businessName: user.businessName, verificationCode }
          }, { delay: 500 });
        }

        // Send welcome email after verification
        emailQueue.add('welcome-email', {
          type: 'welcome',
          email: user.email,
          data: { businessName: user.businessName }
        }, { delay: 2000 });
      } else {
        // Fallback to direct email sending
        process.nextTick(async () => {
          try {
            const { emailService } = await import('../../services/email.service.js');
            if (verificationCode) {
              await emailService.sendVerificationEmail(user.email, user.businessName, verificationCode);
            }
            await emailService.sendWelcomeEmail(user.email, user.businessName);
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.warn('Failed to send emails', { error: msg });
          }
        });
      }

      if (analyticsQueue) {
        analyticsQueue.add('user-registered', {
          type: 'user_registered',
          userId: user.id,
          metadata: { role: 'business', timestamp: new Date() }
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn('Failed to queue background jobs', { error: msg });
    }
  }

  /**
   * Queue login analytics
   */
  private queueLoginAnalytics(user: { id: string; lastLoginAt?: Date | null }): void {
    try {
      if (analyticsQueue) {
        analyticsQueue.add('user-login', {
          type: 'user_login',
          userId: user.id,
          metadata: { timestamp: new Date(), lastLogin: user.lastLoginAt }
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn('Failed to queue login analytics', { error: msg });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If the email exists, a reset code has been sent' };
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await this.userRepo.setPasswordResetCode(email, resetCode, resetExpiresAt);

    // Send reset email
    try {
      if (emailQueue) {
        emailQueue.add('password-reset-email', {
          type: 'password_reset',
          email: user.email,
          data: { businessName: user.businessName, resetCode }
        });
      } else {
        const { emailService } = await import('../../services/email.service.js');
        await emailService.sendPasswordResetEmail(user.email, user.businessName, resetCode);
      }

      logger.info('Password reset requested', { userId: user.id, email: user.email });
      return { success: true, message: 'Password reset code sent to your email' };
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Verify reset code - Step 1: Validate code and return temporary token
   */
  async verifyResetCode(email: string, code: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const user = await this.userRepo.verifyPasswordResetCode(email, code);
    
    if (!user) {
      return { success: false, message: 'Invalid or expired reset code' };
    }

    // Generate temporary reset token (5 minutes)
    const resetToken = jwtToken.sign(
      { userId: user.id, email: user.email, purpose: 'password_reset' },
      { expiresIn: '5m' }
    );

    logger.info('Reset code verified', { userId: user.id, email: user.email });
    return { 
      success: true, 
      message: 'Code verified. You can now set your new password.',
      resetToken
    };
  }

  /**
   * Reset password - Step 2: Use token to set new password
   */
  async resetPasswordWithToken(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify reset token
      const decoded = jwtToken.verify(resetToken) as { userId: string; email: string; purpose: string };
      
      if (decoded.purpose !== 'password_reset') {
        return { success: false, message: 'Invalid reset token' };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
      
      // Update password and clear reset code
      const user = await this.userRepo.update(decoded.userId, {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpiresAt: null
      });
      
      if (!user) {
        return { success: false, message: 'Failed to reset password' };
      }

      logger.info('Password reset successfully', { userId: decoded.userId, email: decoded.email });
      return { success: true, message: 'Password reset successfully' };
    } catch {
      return { success: false, message: 'Invalid or expired reset token' };
    }
  }
}

export const userService = new UserService();