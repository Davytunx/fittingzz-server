import { z } from 'zod';

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  businessName: z
    .string({ message: 'Business name is required' })
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name must not exceed 255 characters')
    .trim(),

  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  contactNumber: z
    .string({ message: 'Contact number is required' })
    .min(10, 'Contact number must be at least 10 characters')
    .max(20, 'Contact number must not exceed 20 characters')
    .trim(),

  address: z
    .string({ message: 'Address is required' })
    .min(10, 'Address must be at least 10 characters')
    .trim(),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  businessName: z.string().min(2).max(255).trim().optional(),
  contactNumber: z.string().min(10).max(20).trim().optional(),
  address: z.string().min(10).trim().optional(),
});

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * Verify email schema
 */
export const verifyEmailSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  code: z
    .string({ message: 'Verification code is required' })
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

/**
 * Request password reset schema
 */
export const requestPasswordResetSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * Verify password reset code schema
 */
export const verifyPasswordResetSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  code: z
    .string({ message: 'Reset code is required' })
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Reset code must contain only digits'),
});

/**
 * Verify reset code schema
 */
export const verifyResetCodeSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  code: z
    .string({ message: 'Reset code is required' })
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Reset code must contain only digits'),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  resetToken: z
    .string({ message: 'Reset token is required' })
    .min(1, 'Reset token cannot be empty'),
  newPassword: z
    .string({ message: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});



/**
 * Infer types from schemas
 */
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
