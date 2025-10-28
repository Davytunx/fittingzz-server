import { Request, Response } from 'express';
import { clientService } from './client.service.js';
import { createClientSchema, updateClientSchema, clientParamsSchema } from './client.validation.js';
import { AppError } from '../../utils/errors.js';

import logger from '../../config/logger.js';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export class ClientController {
  private logRequest(method: string, success: boolean, userId?: string) {
    logger.info(`Client ${method}`, { success, userId });
  }

  async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const validatedData = createClientSchema.parse(req.body);
      const result = await clientService.createClient(adminId, validatedData);

      this.logRequest('create', true, adminId);

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: result.data
      });
    } catch (error) {
      this.logRequest('create', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors || error.message,
      });
    }
  }

  async getClients(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;

      const result = await clientService.getClients(adminId, { page, limit, search });

      this.logRequest('list', true, adminId);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      this.logRequest('list', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getClientById(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const result = await clientService.getClientById(id, adminId);

      this.logRequest('get', true, adminId);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      this.logRequest('get', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors || error.message,
      });
    }
  }

  async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const validatedData = updateClientSchema.parse(req.body);
      const result = await clientService.updateClient(id, adminId, validatedData);

      this.logRequest('update', true, adminId);

      res.json({
        success: true,
        message: 'Client updated successfully',
        data: result.data
      });
    } catch (error) {
      this.logRequest('update', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors || error.message,
      });
    }
  }

  async deleteClient(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = clientParamsSchema.parse(req.params);
      const result = await clientService.deleteClient(id, adminId);

      this.logRequest('delete', true, adminId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      this.logRequest('delete', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors || error.message,
      });
    }
  }

  async getClientStats(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError('Unauthorized', 401);
      }

      const result = await clientService.getClientStats(adminId);

      this.logRequest('stats', true, adminId);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      this.logRequest('stats', false, req.user?.id);

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const clientController = new ClientController();