import logger from '../config/logger.js';

interface ErrorContext {
  userId?: string;
  operation?: string;
  endpoint?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export class ErrorMonitor {
  static trackError(error: Error, context: ErrorContext = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      ...context,
      severity: this.getSeverity(error),
      fingerprint: this.generateFingerprint(error)
    };

    logger.error('Application Error', errorData);

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorData);
    }
  }

  static trackPerformance(operation: string, duration: number, context: ErrorContext = {}) {
    const performanceData = {
      operation,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ...context,
      level: duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug'
    };

    if (duration > 1000) {
      logger.warn('Slow Operation', performanceData);
    } else if (duration > 500) {
      logger.info('Performance Alert', performanceData);
    }
  }

  static trackApiCall(method: string, endpoint: string, statusCode: number, duration: number, context: ErrorContext = {}) {
    const apiData = {
      method,
      endpoint,
      statusCode,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ...context
    };

    if (statusCode >= 500) {
      logger.error('API Error', apiData);
    } else if (statusCode >= 400) {
      logger.warn('API Warning', apiData);
    } else {
      logger.info('API Call', apiData);
    }
  }

  private static getSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.name === 'ValidationError') return 'low';
    if (error.name === 'UnauthorizedError') return 'medium';
    if (error.name === 'DatabaseError') return 'high';
    if (error.message.includes('ECONNREFUSED')) return 'critical';
    return 'medium';
  }

  private static generateFingerprint(error: Error): string {
    const key = `${error.name}:${error.message}:${error.stack?.split('\n')[1] || ''}`;
    return Buffer.from(key).toString('base64').slice(0, 16);
  }

  private static sendToMonitoringService(errorData: any) {
    // Implement external service integration (Sentry, DataDog, etc.)
    // For now, just log that it would be sent
    logger.info('Would send to monitoring service', { fingerprint: errorData.fingerprint });
  }
}