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
  

  
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


