import { ClientRepository } from './client.repository.js';
import { AppError } from '../../utils/errors.js';

export class ClientService {
  constructor(private clientRepo: ClientRepository) {}

  async createClient(adminId: string, clientData: { name: string; phone: string; email: string; gender: string }) {
    if (!adminId || !clientData.name?.trim() || !clientData.email?.trim()) {
      throw new AppError('Invalid client data', 400);
    }

    const client = await this.clientRepo.create({
      ...clientData,
      adminId,
    });

    return { success: true, data: client };
  }

  async getClients(adminId: string, options?: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 50, search } = options || {};
    const offset = (page - 1) * limit;
    
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
  }

  async getClientById(id: string, adminId: string) {
    if (!id || !adminId) {
      throw new AppError('Invalid parameters', 400);
    }

    const client = await this.clientRepo.findById(id, adminId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    
    return { success: true, data: client };
  }

  async updateClient(id: string, adminId: string, updateData: Partial<{ name: string; phone: string; email: string; gender: string }>) {
    if (!id || !adminId || !Object.keys(updateData).length) {
      throw new AppError('Invalid update parameters', 400);
    }

    const client = await this.clientRepo.update(id, adminId, updateData);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    
    return { success: true, data: client };
  }

  async deleteClient(id: string, adminId: string) {
    if (!id || !adminId) {
      throw new AppError('Invalid parameters', 400);
    }

    const client = await this.clientRepo.delete(id, adminId);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    
    return { success: true, message: 'Client deleted successfully' };
  }

  async getClientStats(adminId: string) {
    const stats = await this.clientRepo.getStats(adminId);
    return { success: true, data: stats };
  }
}

export const clientService = new ClientService(new ClientRepository());