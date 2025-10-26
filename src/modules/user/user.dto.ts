import { users } from './user.schema.js';

/**
 * Signup DTO - matches required fields for registration
 */
export interface SignupDto {
  businessName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: string;
}



/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * User response (exclude sensitive data)
 */
export interface UserResponseDto {
  id: string;
  businessName: string;
  email: string;
  contactNumber?: string;
  address?: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type inference from schema
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
