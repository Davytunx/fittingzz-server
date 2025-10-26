import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';

import config from './config/index.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { successResponse } from './utils/response.js';
import securityMiddleware from './middleware/security.middleware.js';

import authRouter from './routes/auth.route.js';

const app: Express = express();

/**
 * Security middleware
 */
app.use(
  helmet({
    contentSecurityPolicy: config.app.isProduction,
  })
);

/**
 * CORS configuration
 */
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Compression middleware
 */
app.use(compression());

/**
 * HTTP request logging
 */
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

/**
 * Arcjet security protection with role-based rate limiting
 */
app.use(securityMiddleware);

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  successResponse(
    res,
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env,
      version: config.app.version,
    },
    'Service is healthy'
  );
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  successResponse(
    res,
    {
      name: config.app.name,
      version: config.app.version,
      environment: config.app.env,
    },
    'Welcome to Fittingz API'
  );
});

/**
 * Privacy policy endpoint
 */
app.get('/privacy', (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>Privacy Policy - Fittingz</title></head>
      <body>
        <h1>Privacy Policy</h1>
        <p>This is a development application for fashion designers.</p>
        <p>Contact: your-email@example.com</p>
      </body>
    </html>
  `);
});

/**
 * API v1 routes
 */
const API_PREFIX = `/api/${config.app.version}`;

app.get(API_PREFIX, (req: Request, res: Response) => {
  successResponse(res, {
    message: 'API is running',
    version: config.app.version,
  });
});

// Mount route modules
app.use(`${API_PREFIX}/auth`, authRouter);

/**
 * 404 handler - must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler - must be last
 */
app.use(errorHandler);

export default app;
