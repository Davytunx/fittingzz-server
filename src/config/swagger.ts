import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from './index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fittingz API',
      version: '1.0.0',
      description: 'Production-ready REST API for fashion designers to manage their business operations',
      contact: {
        name: 'Fittingz Team',
        email: 'support@fittingz.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api/${config.app.version}`,
        description: 'Development server',
      },
      {
        url: `https://api.fittingz.com/api/${config.app.version}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            businessName: {
              type: 'string',
              description: 'Fashion business name',
              example: 'Elegant Designs Studio',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'designer@example.com',
            },
            contactNumber: {
              type: 'string',
              description: 'Business contact number',
              example: '+1234567890',
            },
            address: {
              type: 'string',
              description: 'Business address',
              example: '123 Fashion Street, Design City',
            },
            role: {
              type: 'string',
              enum: ['business', 'super_admin'],
              description: 'User role',
              example: 'business',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true,
            },
            isActive: {
              type: 'boolean',
              description: 'Account active status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field with error',
                  },
                  message: {
                    type: 'string',
                    description: 'Error description',
                  },
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Email Verification',
        description: 'Email verification system',
      },
      {
        name: 'Password Reset',
        description: 'Password reset functionality',
      },
      {
        name: 'User Profile',
        description: 'User profile management',
      },
      {
        name: 'System',
        description: 'System health and information',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/modules/*/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    `/api/${config.app.version}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Fittingz API Documentation',
    })
  );
};

export default specs;