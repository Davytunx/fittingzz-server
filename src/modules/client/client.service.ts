import { ClientRepository } from './client.repository.js';
import { AppError } from '../../utils/errors.js';
import logger from '../../config/logger.js';
import { cache } from '../../config/cache.js';
import { analyticsQueue } from '../../services/queue.service.js';
import { performance } from 'perf_hooks';
import { ErrorMonitor } from '../../utils/error-monitor.js';

export class ClientService {
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly BATCH_SIZE = 100;
  
  constructor(private clientRepo: ClientRepository) {}

  private getCacheKey(type: string, ...params: string[]): string {
    return `client:${type}:${params.join(':')}`;
  }

  private async withPerformanceTracking<T>(
    operation: string,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      ErrorMonitor.trackPerformance(operation, duration, { userId, operation });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      ErrorMonitor.trackError(error as Error, {
        userId,
        operation,
        duration,
        metadata: { operation }
      });
      
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

      // Invalidate related caches efficiently
      const cacheKeys = [
        this.getCacheKey('list', adminId),
        this.getCacheKey('count', adminId)
      ];
      cacheKeys.forEach(key => cache.delete(key));

      // Non-blocking background operations
      process.nextTick(() => {
        analyticsQueue?.add('client-created', {
          type: 'client_created',
          adminId,
          clientId: client.id,
          metadata: { timestamp: new Date(), source: 'api' }
        }, { priority: 5 });
      });

      return { success: true, data: client };
    });
  }

  async getClients(adminId: string, options?: { page?: number; limit?: number; search?: string }) {
    return this.withPerformanceTracking('getClients', async () => {
      const { page = 1, limit = 50, search } = options || {};
      const offset = (page - 1) * limit;
      
      const cacheKey = this.getCacheKey('list', adminId, String(page), String(limit), search || '');
      let result = cache.get(cacheKey);
      
      if (!result) {
      
        const [clients, total] = await Promise.all([
          this.clientRepo.findByAdminId(adminId, { offset, limit, search }),
          this.clientRepo.countByAdminId(adminId, search)
        ]);
        
        result = {
          clients,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        };
        
        // Cache for future requests
        cache.set(cacheKey, result, this.CACHE_TTL);
      }
      
      return { success: true, data: result };
    });
  }

  async getClientById(id: string, adminId: string) {
    return this.withPerformanceTracking('getClientById', async () => {
      if (!id || !adminId) {
        throw new AppError('Invalid parameters', 400);
      }

      const cacheKey = this.getCacheKey('single', id, adminId);
      const cachedClient = cache.get(cacheKey);
      
      if (cachedClient) {
        return { success: true, data: cachedClient };
      }
      
      const client = await this.clientRepo.findById(id, adminId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      
      cache.set(cacheKey, client, this.CACHE_TTL);
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
      
      // Efficient cache invalidation
      const cachePatterns = [
        this.getCacheKey('single', id, adminId),
        this.getCacheKey('list', adminId),
        this.getCacheKey('count', adminId)
      ];
      cachePatterns.forEach(pattern => {
        // Clear all cache entries matching pattern
        cache.delete(pattern);
      });
      
      // Update cache with new data
      cache.set(this.getCacheKey('single', id, adminId), client, this.CACHE_TTL);
      
      // Background analytics
      process.nextTick(() => {
        analyticsQueue?.add('client-updated', {
          type: 'client_updated',
          adminId,
          clientId: id,
          changes: Object.keys(updateData),
          metadata: { timestamp: new Date() }
        }, { priority: 3 });
      });
      
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
      
      // Comprehensive cache cleanup
      const cachePatterns = [
        this.getCacheKey('single', id, adminId),
        this.getCacheKey('list', adminId),
        this.getCacheKey('count', adminId)
      ];
      cachePatterns.forEach(pattern => cache.delete(pattern));
      
      // High-priority background cleanup
      process.nextTick(() => {
        analyticsQueue?.add('client-deleted', {
          type: 'client_deleted',
          adminId,
          clientId: id,
          clientData: { name: client.name, email: client.email },
          metadata: { timestamp: new Date(), deletedBy: adminId }
        }, { priority: 1 });
      });
      
      return { success: true, message: 'Client deleted successfully' };
    });
  }

  async bulkCreateClients(adminId: string, clientsData: Array<{ name: string; phone: string; email: string; gender: string }>) {
    return this.withPerformanceTracking('bulkCreateClients', async () => {
      if (!clientsData?.length || clientsData.length > this.BATCH_SIZE) {
        throw new AppError(`Invalid batch size. Max ${this.BATCH_SIZE} clients allowed`, 400);
      }

      const results = await this.clientRepo.bulkCreate(adminId, clientsData);
      
      // Clear relevant caches
      cache.delete(this.getCacheKey('list', adminId));
      cache.delete(this.getCacheKey('count', adminId));
      
      // Background analytics
      process.nextTick(() => {
        analyticsQueue?.add('clients-bulk-created', {
          type: 'clients_bulk_created',
          adminId,
          count: results.length,
          metadata: { timestamp: new Date() }
        });
      });
      
      return { success: true, data: results, count: results.length };
    });
  }

  async getClientStats(adminId: string) {
    return this.withPerformanceTracking('getClientStats', async () => {
      const cacheKey = this.getCacheKey('stats', adminId);
      let stats = cache.get(cacheKey);
      
      if (!stats) {
        stats = await this.clientRepo.getStats(adminId);
        cache.set(cacheKey, stats, this.CACHE_TTL);
      }
      
      return { success: true, data: stats };
    });
  }
}

export const clientService = new ClientService(new ClientRepository());