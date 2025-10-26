import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger.js';
import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/response.js';
import config from '../config/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    errorResponse(res, 'Validation failed', 422, errors);
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token expired', 401);
    return;
  }

  // Handle Mongoose/Database errors
  if (err.name === 'CastError') {
    errorResponse(res, 'Invalid ID format', 400);
    return;
  }

  if (err.name === 'MongoServerError' && (err as unknown as { code: number }).code === 11000) {
    errorResponse(res, 'Duplicate field value', 409);
    return;
  }

  // Default error response
  const message = config.app.isProduction ? 'Internal server error' : err.message;
  const stack = config.app.isProduction ? undefined : err.stack;

  errorResponse(res, message, 500, stack ? [{ stack }] : undefined);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
