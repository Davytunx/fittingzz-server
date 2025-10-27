import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { users } from './user.schema.js';
import type { Database } from '../../config/database.js';
import { IUserRepository } from '../../interfaces/repository.interface.js';
import logger from '../../config/logger.js';

export class UserRepository implements IUserRepository {
  private db: Database;

  constructor(database: Database = db) {
    this.db = database;
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

    return result[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    return result[0] || null;
  }

  /**
   * Find all users
   */
  async findAll() {
    return await this.db.select().from(users);
  }

  /**
   * Create new user
   */
  async create(userData: typeof users.$inferInsert) {
    const result = await this.db.insert(users).values(userData).returning();

    return result[0];
  }

  /**
   * Create user (omit password from response)
   */
  async createAndReturn(userData: typeof users.$inferInsert) {
    const result = await this.create(userData);
    if (!result) throw new Error('Failed to create user');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = result;
    return userWithoutPassword;
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<typeof users.$inferInsert>) {
    const result = await this.db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();

    return result[0] || null;
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string) {
    return this.update(id, { lastLoginAt: new Date() });
  }

  /**
   * Set email verification code
   */
  async setEmailVerificationCode(id: string, code: string, expiresAt: Date) {
    return this.update(id, {
      emailVerificationCode: code,
      emailVerificationExpiresAt: expiresAt
    });
  }

  /**
   * Verify email with code
   */
  async verifyEmailWithCode(email: string, code: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    if (!user || !user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      return null;
    }

    if (user.emailVerificationCode !== code) {
      // Log failed attempt for monitoring
      logger.warn('Invalid verification code attempt', {
        email: user.email,
        attemptedCode: code,
        userId: user.id
      });
      return null; // Invalid code
    }

    if (new Date() > user.emailVerificationExpiresAt) {
      return null; // Code expired
    }

    // Mark as verified and clear code
    await this.update(user.id, {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpiresAt: null
    });

    return user;
  }

  /**
   * Set password reset code
   */
  async setPasswordResetCode(email: string, code: string, expiresAt: Date) {
    const result = await this.db
      .update(users)
      .set({
        passwordResetCode: code,
        passwordResetExpiresAt: expiresAt
      })
      .where(eq(users.email, email))
      .returning();

    return result[0] || null;
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(email: string, code: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    if (!user || !user.passwordResetCode || !user.passwordResetExpiresAt) {
      return null;
    }

    if (user.passwordResetCode !== code) {
      logger.warn('Invalid password reset code attempt', {
        email: user.email,
        attemptedCode: code,
        userId: user.id
      });
      return null;
    }

    if (new Date() > user.passwordResetExpiresAt) {
      return null; // Code expired
    }

    return user;
  }

  /**
   * Reset password with code
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.verifyPasswordResetCode(email, code);
    if (!user) {
      return null;
    }

    // Update password and clear reset code
    const result = await this.db
      .update(users)
      .set({
        password: newPassword,
        passwordResetCode: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();

    return result[0] || null;
  }



  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0;
  }


}

export const userRepository = new UserRepository();
