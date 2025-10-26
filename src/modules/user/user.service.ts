import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../interfaces/repository.interface.js';
import { UserRepository } from './user.repository.js';
import { SignupDto, LoginDto, UserResponseDto } from './user.dto.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import config from '../../config/index.js';
import logger from '../../config/logger.js';
import { jwtToken } from '../../utils/jwt.js';

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

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, config.bcrypt.saltRounds);

    // Create user
    const user = await this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

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

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await this.userRepo.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

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
}

export const userService = new UserService();