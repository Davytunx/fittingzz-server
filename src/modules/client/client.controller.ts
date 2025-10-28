import { Request, Response } from 'express';
import { clientService } from './client.service.js';
import { createClientSchema, updateClientSchema, clientParamsSchema } from './client.validation.js';
import { AppError } from '../../utils/errors.js';
import { performance } from 'perf_hooks';
import logger from '../../config/logger.js';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export class ClientController {
  private logRequest(method: string, duration: number, success: boolean, userId?: string): void {
    const level = duration > 300 ? 'warn' : 'info';
    logger[level](`Client ${method}`, {
      duration: `${duration.toFixed(2)}ms`,
      success,
      userId,
      performance: duration <= 200 ? 'excellent' : duration <= 400 ? 'good' : 'slow'
    });
  }

  async createClient(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const validatedData = createClientSchema.parse(req.body);
      const result = await clientService.createClient(adminId, validatedData);

      const duration = performance.now() - start;
      this.logRequest('create', duration, true, adminId);

      return res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: result.data,
        meta: { duration: `${duration.toFixed(2)}ms` }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('create', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors || (error as Error).message,
      });
    }
  }

  async getClients(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;

      const result = await clientService.getClients(adminId, { page, limit, search });

      const duration = performance.now() - start;
      this.logRequest('list', duration, true, adminId);

      return res.json({
        success: true,
        data: result.data,
        meta: {
          duration: `${duration.toFixed(2)}ms`,
          cached: duration < 50
        }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('list', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getClientById(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const result = await clientService.getClientById(id, adminId);

      const duration = performance.now() - start;
      this.logRequest('get', duration, true, adminId);

      return res.json({
        success: true,
        data: result.data,
        meta: { duration: `${duration.toFixed(2)}ms` }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('get', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors || (error as Error).message,
      });
    }
  }

  async updateClient(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const validatedData = updateClientSchema.parse(req.body);
      const result = await clientService.updateClient(id, adminId, validatedData);

      const duration = performance.now() - start;
      this.logRequest('update', duration, true, adminId);

      return res.json({
        success: true,
        message: 'Client updated successfully',
        data: result.data,
        meta: { duration: `${duration.toFixed(2)}ms` }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('update', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors || (error as Error).message,
      });
    }
  }

  async deleteClient(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const result = await clientService.deleteClient(id, adminId);

      const duration = performance.now() - start;
      this.logRequest('delete', duration, true, adminId);

      return res.json({
        success: true,
        message: result.message,
        meta: { duration: `${duration.toFixed(2)}ms` }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('delete', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors || (error as Error).message,
      });
    }
  }

  async getClientStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const start = performance.now();
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const result = await clientService.getClientStats(adminId);

      const duration = performance.now() - start;
      this.logRequest('stats', duration, true, adminId);

      return res.json({
        success: true,
        data: result.data,
        meta: { duration: `${duration.toFixed(2)}ms` }
      });
    } catch (error) {
      const duration = performance.now() - start;
      this.logRequest('stats', duration, false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const clientController = new ClientController();