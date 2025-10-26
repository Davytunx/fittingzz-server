import http from 'http';
import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Start server
 */
const startServer = () => {
  server.listen(config.app.port, () => {
    logger.info(`🚀 ${config.app.name} is running`, {
      port: config.app.port,
      environment: config.app.env,
      version: config.app.version,
      nodeVersion: process.version,
    });

    if (config.app.isDevelopment) {
      logger.info(
        `📖 API Documentation: http://localhost:${config.app.port}/api/${config.app.version}`
      );
      logger.info(`🏥 Health Check: http://localhost:${config.app.port}/health`);
    }
  });
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connections, Redis, etc.
    // Add your cleanup logic here

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // In production, you might want to shut down gracefully
  if (config.app.isProduction) {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  // In production, you should shut down gracefully
  if (config.app.isProduction) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

/**
 * Graceful shutdown signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the server
 */
startServer();

export default server;
