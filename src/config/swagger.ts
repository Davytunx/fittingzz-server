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
      description: 'Fashion Designer Client Management API'
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api/${config.app.version}`,
        description: 'Development'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            businessName: { type: 'string', example: 'Fashion Studio' },
            email: { type: 'string', format: 'email' },
            contactNumber: { type: 'string' },
            address: { type: 'string' },
            role: { type: 'string', enum: ['business', 'super_admin'] },
            isEmailVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '1234567890' },
            email: { type: 'string', format: 'email' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
            adminId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
      },
    },
    tags: [
      { name: 'User Service', description: 'User authentication and management' },
      { name: 'Client Service', description: 'Client management operations' }
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/modules/*/*.ts',
    './src/app.ts'
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    `/api/${config.app.version}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customSiteTitle: 'Fittingz API'
    })
  );
};

export default specs;