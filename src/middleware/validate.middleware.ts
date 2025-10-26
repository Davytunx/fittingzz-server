import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware to validate request body, query, or params using Zod schema
 */
export const validate = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validated = schema.parse(data);

      // Replace request data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        errorResponse(res, 'Validation failed', 422, errors);
        return;
      }

      next(error);
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodType) => validate(schema, 'body');

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodType) => validate(schema, 'query');

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ZodType) => validate(schema, 'params');
