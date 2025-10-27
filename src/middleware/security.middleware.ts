import { Request, Response, NextFunction } from 'express';
import aj from '../config/arcjet.js';
import logger from '../config/logger.js';
import config from '../config/index.js';
import { slidingWindow } from '@arcjet/node';
import { errorResponse } from '../utils/response.js';

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip rate limiting for docs and health endpoints
    if (req.path.startsWith(`/api/${config.app.version}/docs`) || req.path === '/health' || req.path === '/') {
      next();
      return;
    }

    const role = (req as { user?: { role?: string } }).user?.role || 'guest';

    let limit: number;
    let message: string;

    switch (role) {
      case 'super_admin':
        limit = 100;
        message = 'Super admin request limit exceeded (100 per minute). Slow down';
        break;
      case 'business':
        limit = 50;
        message = 'Business request limit exceeded (50 per minute). Slow down';
        break;
      case 'guest':
        // Higher limit in development for testing
        limit = config.app.isDevelopment ? 50 : 10;
        message = `Guest request limit exceeded (${limit} per minute). Slow down`;
        break;
      default:
        limit = config.app.isDevelopment ? 50 : 10;
        message = `Request limit exceeded (${limit} per minute). Slow down`;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      // Allow bots in development
      if (process.env.NODE_ENV === 'development') {
        logger.info('Bot request allowed in development', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
        });
      } else {
        logger.warn('Bot request blocked', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
        });
        errorResponse(res, 'Automated requests are not allowed', 403);
        return;
      }
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      errorResponse(res, 'Request blocked by security policy', 403);
      return;
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        role,
        limit,
      });
      errorResponse(res, message, 429);
      return;
    }

    next();
  } catch (error) {
    logger.error('Arcjet middleware error:', error);
    // Continue on error to avoid breaking the app
    next();
  }
};

export default securityMiddleware;
