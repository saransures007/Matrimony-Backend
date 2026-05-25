/**
 * Swagger / OpenAPI configuration
 * Auto-generates API docs from route annotations
 */

import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from 'dotenv';

config();

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

/**
 * OpenAPI 3.0 specification
 * Components include reusable schemas for request/response bodies
 */
const spec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Matrimony API',
      version: '1.0.0',
      description: 'Production-grade Matrimony Backend API',
      contact: {
        name: 'API Support',
        email: 'support@matrimony.com',
      },
    },
    servers: [
      {
        url: BASE_URL,
        description: NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            errors: { type: 'array' },
            requestId: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            requestId: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'User', description: 'User profile endpoints' },
      { name: 'Profile', description: 'Profile management' },
    ],
  },
  // Point to route annotation files (*.yaml or JSDoc comments)
  apis: ['./src/docs/**/*.yaml', './src/modules/**/*.ts', './src/routes/v1/**/*.ts'],
});

/**
 * Swagger UI setup options
 * TryDocuments: allows trying API calls directly from the docs UI
 */
const swaggerUiOptions = {
  swaggerOptions: {
    tryItOutEnabled: NODE_ENV !== 'production',
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
  },
  customSiteTitle: 'Matrimony API Docs',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-size: 2rem }
  `,
};

export const swaggerSpec = spec;
export { swaggerUi, swaggerUiOptions };
