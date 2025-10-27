import { pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

/**
 * Users table - stores user authentication and profile information
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password'), // Optional for social auth
  contactNumber: varchar('contact_number', { length: 20 }),
  address: text('address'),
  role: varchar('role', { length: 50 }).notNull().default('business'),
  
  emailVerificationCode: varchar('email_verification_code', { length: 6 }),
  emailVerificationExpiresAt: timestamp('email_verification_expires_at'),
  
  passwordResetCode: varchar('password_reset_code', { length: 6 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at'),
  
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


