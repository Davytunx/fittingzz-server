import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { users } from './user.schema.js';
import type { Database } from '../../config/database.js';
import { IUserRepository } from '../../interfaces/repository.interface.js';

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
