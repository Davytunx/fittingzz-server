import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment validation schema
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(5000),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),



  // Client URL
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default(8),

  // Arcjet
  ARCJET_KEY: z.string().min(1, 'ARCJET_KEY is required'),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Email (SMTP)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default(587),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),

  // Email Verification
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().default('24h'),
});

/**
 * Validate and parse environment variables
 */
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Validated environment variables
 */
export const env = parseEnv();

/**
 * Type-safe environment object
 */
export type Env = z.infer<typeof envSchema>;
