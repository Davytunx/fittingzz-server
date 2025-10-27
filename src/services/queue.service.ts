import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../config/index.js';
import logger from '../config/logger.js';

// Create ioredis connection for BullMQ with Upstash-specific config
const redisConnection = new Redis(config.redis.url.replace('https://', 'rediss://'), {
  password: config.redis.token,
  tls: {
    rejectUnauthorized: false,
  },
  connectTimeout: 60000,
  lazyConnect: true,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  family: 4,
});

// Handle Redis connection errors
redisConnection.on('error', (err) => {
  logger.warn('Redis connection error:', err.message);
});

redisConnection.on('connect', () => {
  logger.info('Redis connected successfully');
});

// Job types
export interface EmailJob {
  type: 'welcome' | 'verification' | 'password_reset';
  email: string;
  data: {
    businessName: string;
    verificationCode?: string;
    resetCode?: string;
  };
}

export interface AnalyticsJob {
  type: 'user_registered' | 'user_login';
  userId: string;
  metadata: Record<string, unknown>;
}

// Create queues with error handling
let emailQueue: Queue | null = null;
let analyticsQueue: Queue | null = null;

try {
  emailQueue = new Queue('email', { connection: redisConnection });
  analyticsQueue = new Queue('analytics', { connection: redisConnection });
  logger.info('Queues initialized successfully');
} catch (error) {
  logger.warn('Failed to initialize queues:', error);
}

export { emailQueue, analyticsQueue };

// Workers disabled for now - will be enabled once Redis connection is stable
let emailWorker: Worker | null = null;
let analyticsWorker: Worker | null = null;

// Only create workers if Redis is connected
redisConnection.on('ready', () => {
  try {
    emailWorker = new Worker('email', async (job) => {
      const { type, email, data } = job.data as EmailJob;
      logger.info(`Processing email job: ${type}`, { email });
      
      try {
        const { emailService } = await import('../services/email.service.js');
        
        if (type === 'welcome') {
          await emailService.sendWelcomeEmail(email, data.businessName);
        } else if (type === 'verification' && data.verificationCode) {
          await emailService.sendVerificationEmail(email, data.businessName, data.verificationCode);
        } else if (type === 'password_reset' && data.resetCode) {
          await emailService.sendPasswordResetEmail(email, data.businessName, data.resetCode);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Email sending failed:', { error: errorMessage });
      }
      
      logger.info(`Email processed: ${type}`, { email });
    }, { connection: redisConnection });

    analyticsWorker = new Worker('analytics', async (job) => {
      const { type, userId } = job.data as AnalyticsJob;
      logger.info(`Processing analytics: ${type}`, { userId });
      await new Promise(resolve => setTimeout(resolve, 50));
      logger.info(`Analytics processed: ${type}`, { userId });
    }, { connection: redisConnection });

    logger.info('Workers initialized successfully');
  } catch (error) {
    logger.warn('Failed to initialize workers:', error);
  }
});

export { emailWorker, analyticsWorker };