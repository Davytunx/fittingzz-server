import { eq, and, ilike, count, desc, asc } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { clients } from './client.schema.js';
import type { Database } from '../../config/database.js';
import logger from '../../config/logger.js';

export class ClientRepository {
  private db: Database;

  constructor(database: Database = db) {
    this.db = database;
  }

  async findById(id: string, adminId: string) {
    const result = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.adminId, adminId)))
      .limit(1);
    return result[0] || null;
  }

  async findByAdminId(adminId: string, options?: { offset?: number; limit?: number; search?: string }) {
    const { offset = 0, limit = 50, search } = options || {};
    
    if (search) {
      return await this.db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.adminId, adminId),
            ilike(clients.name, `%${search}%`)
          )
        )
        .orderBy(desc(clients.createdAt))
        .offset(offset)
        .limit(limit);
    }
    
    return await this.db
      .select()
      .from(clients)
      .where(eq(clients.adminId, adminId))
      .orderBy(desc(clients.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async countByAdminId(adminId: string, search?: string) {
    if (search) {
      const result = await this.db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.adminId, adminId),
            ilike(clients.name, `%${search}%`)
          )
        );
      return result[0]?.count || 0;
    }
    
    const result = await this.db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.adminId, adminId));
    
    return result[0]?.count || 0;
  }

  async create(clientData: typeof clients.$inferInsert) {
    const result = await this.db.insert(clients).values(clientData).returning();
    return result[0];
  }

  async update(id: string, adminId: string, clientData: Partial<typeof clients.$inferInsert>) {
    const result = await this.db
      .update(clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.adminId, adminId)))
      .returning();
    return result[0] || null;
  }

  async delete(id: string, adminId: string) {
    const result = await this.db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.adminId, adminId)))
      .returning();
    return result[0] || null;
  }

  async bulkCreate(adminId: string, clientsData: Array<{ name: string; phone: string; email: string; gender: string }>) {
    const dataWithAdminId = clientsData.map(client => ({
      ...client,
      adminId
    }));
    
    try {
      const result = await this.db
        .insert(clients)
        .values(dataWithAdminId)
        .returning();
      
      logger.info('Bulk clients created', { adminId, count: result.length });
      return result;
    } catch (error) {
      logger.error('Bulk create failed', { error, adminId, count: clientsData.length });
      throw error;
    }
  }

  async getStats(adminId: string) {
    const [totalClients, recentClients] = await Promise.all([
      this.db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.adminId, adminId)),
      
      this.db
        .select({ count: count() })
        .from(clients)
        .where(
          and(
            eq(clients.adminId, adminId),
            // Last 30 days
            // gte(clients.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )
    ]);
    
    const total = totalClients[0]?.count || 0;
    const recent = recentClients[0]?.count || 0;
    
    return {
      total,
      recent,
      growth: total > 0 ? ((recent / total) * 100).toFixed(1) : '0'
    };
  }

  async searchClients(adminId: string, searchTerm: string, limit = 10) {
    return await this.db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.adminId, adminId),
          ilike(clients.name, `%${searchTerm}%`)
        )
      )
      .limit(limit)
      .orderBy(asc(clients.name));
  }
}

export const clientRepository = new ClientRepository();

// Connection health check
setInterval(async () => {
  try {
    await db.select().from(clients).limit(1);
  } catch (error) {
    logger.error('Database connection health check failed', { error });
  }
}, 60000); // Check every minute