import { Request, Response, NextFunction } from 'express';
import aj from '../config/arcjet.js';
import logger from '../config/logger.js';
import { slidingWindow } from '@arcjet/node';
import { errorResponse } from '../utils/response.js';

/**
 * Rate limiting for verification code requests
 * Max 3 requests per 5 minutes per IP
 */
export const verificationCodeRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '5m',
        max: 3,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Verification code request rate limited', {
        ip: req.ip,
        email: req.body?.email,
        path: req.path,
      });
      errorResponse(res, 'Too many verification requests. Please wait 5 minutes before trying again.', 429);
      return;
    }

    next();
  } catch (error) {
    logger.error('Verification rate limit middleware error:', error);
    next();
  }
};

/**
 * Rate limiting for verification attempts
 * Max 5 attempts per 10 minutes per IP
 */
export const verificationAttemptRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '10m',
        max: 5,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Verification attempt rate limited', {
        ip: req.ip,
        email: req.body?.email,
        path: req.path,
      });
      errorResponse(res, 'Too many verification attempts. Please wait 10 minutes before trying again.', 429);
      return;
    }

    next();
  } catch (error) {
    logger.error('Verification attempt rate limit middleware error:', error);
    next();
  }
};