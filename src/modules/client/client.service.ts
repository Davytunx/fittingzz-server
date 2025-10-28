import { ClientRepository } from './client.repository.js';
import { AppError } from '../../utils/errors.js';
import logger from '../../config/logger.js';


export class ClientService {
  private readonly BATCH_SIZE = 100;
  
  constructor(private clientRepo: ClientRepository) {}

  private async withPerformanceTracking<T>(
    operation: string,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    // Simple execution - no tracking overhead
    try {
      return await fn();
    } catch (error) {
      logger.error(`${operation} failed`, { userId, error: (error as Error).message });
      throw error;
    }
  }

  async createClient(adminId: string, clientData: { name: string; phone: string; email: string; gender: string }) {
    return this.withPerformanceTracking('createClient', async () => {
      // Input validation
      if (!adminId || !clientData.name?.trim() || !clientData.email?.trim()) {
        throw new AppError('Invalid client data', 400);
      }

      const client = await this.clientRepo.create({
        ...clientData,
        adminId,
      });



      // Simple logging instead of queue
      logger.info('Client created', { adminId, clientId: client.id });

      return { success: true, data: client };
    });
  }

  async getClients(adminId: string, options?: { page?: number; limit?: number; search?: string }) {
    return this.withPerformanceTracking('getClients', async () => {
      const { page = 1, limit = 50, search } = options || {};
      const offset = (page - 1) * limit;
      
      // Direct database query - no caching complexity
      const [clients, total] = await Promise.all([
        this.clientRepo.findByAdminId(adminId, { offset, limit, search }),
        this.clientRepo.countByAdminId(adminId, search)
      ]);
      
      const result = {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
      return { success: true, data: result };
    });
  }

  async getClientById(id: string, adminId: string) {
    return this.withPerformanceTracking('getClientById', async () => {
      if (!id || !adminId) {
        throw new AppError('Invalid parameters', 400);
      }

      // Direct database query
      const client = await this.clientRepo.findById(id, adminId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      return { success: true, data: client };
    });
  }

  async updateClient(id: string, adminId: string, updateData: Partial<{ name: string; phone: string; email: string; gender: string }>) {
    return this.withPerformanceTracking('updateClient', async () => {
      if (!id || !adminId || !Object.keys(updateData).length) {
        throw new AppError('Invalid update parameters', 400);
      }

      // Optimistic update with validation
      const client = await this.clientRepo.update(id, adminId, updateData);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      // No cache to invalidate
      
      // Simple logging
      logger.info('Client updated', { adminId, clientId: id, changes: Object.keys(updateData) });
      
      return { success: true, data: client };
    });
  }

  async deleteClient(id: string, adminId: string) {
    return this.withPerformanceTracking('deleteClient', async () => {
      if (!id || !adminId) {
        throw new AppError('Invalid parameters', 400);
      }

      const client = await this.clientRepo.delete(id, adminId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      // No cache to cleanup
      
      // Simple logging
      logger.info('Client deleted', { adminId, clientId: id, clientName: client.name });
      
      return { success: true, message: 'Client deleted successfully' };
    });
  }

  async bulkCreateClients(adminId: string, clientsData: Array<{ name: string; phone: string; email: string; gender: string }>) {
    return this.withPerformanceTracking('bulkCreateClients', async () => {
      if (!clientsData?.length || clientsData.length > this.BATCH_SIZE) {
        throw new AppError(`Invalid batch size. Max ${this.BATCH_SIZE} clients allowed`, 400);
      }

      const results = await this.clientRepo.bulkCreate(adminId, clientsData);
      

      
      // Simple logging
      logger.info('Bulk clients created', { adminId, count: results.length });
      
      return { success: true, data: results, count: results.length };
    });
  }

  async getClientStats(adminId: string) {
    return this.withPerformanceTracking('getClientStats', async () => {
      const stats = await this.clientRepo.getStats(adminId);
      
      return { success: true, data: stats };
    });
  }
}

export const clientService = new ClientService(new ClientRepository());