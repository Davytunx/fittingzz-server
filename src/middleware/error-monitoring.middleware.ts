import { Request, Response, NextFunction } from 'express';
import { ErrorMonitor } from '../utils/error-monitor.js';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';

interface MonitoredRequest extends Request {
  startTime?: number;
  requestId?: string;
  user?: { id: string; email: string; role: string };
}

export const errorMonitoringMiddleware = (req: MonitoredRequest, res: Response, next: NextFunction) => {
  // Add request tracking
  req.startTime = performance.now();
  req.requestId = uuidv4();

  // Track request start
  const originalSend = res.send;
  res.send = function(data) {
    const duration = performance.now() - (req.startTime || 0);
    
    ErrorMonitor.trackApiCall(
      req.method,
      req.path,
      res.statusCode,
      duration,
      {
        userId: req.user?.id,
        requestId: req.requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        metadata: {
          query: req.query,
          params: req.params
        }
      }
    );

    return originalSend.call(this, data);
  };

  next();
};

export const globalErrorHandler = (error: Error, req: MonitoredRequest, res: Response, next: NextFunction) => {
  const duration = performance.now() - (req.startTime || 0);

  ErrorMonitor.trackError(error, {
    userId: req.user?.id,
    operation: `${req.method} ${req.path}`,
    endpoint: req.path,
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    duration,
    metadata: {
      query: req.query,
      params: req.params,
      body: req.body
    }
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: req.requestId,
    ...(isDevelopment && { 
      error: error.message,
      stack: error.stack 
    })
  });
};