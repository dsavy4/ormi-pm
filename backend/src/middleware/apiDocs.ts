import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ormi Property Management API',
      version: '1.0.0',
      description: 'API documentation for Ormi Property Management System',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export const apiDocsSetup = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}; 