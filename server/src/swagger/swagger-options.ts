import { Options } from 'swagger-jsdoc'

export const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger UI',
      version: '1.0.0',
      description: 'Swagger UI',
    },
    servers: [{ url: `http://localhost:${process.env.APP_PORT}` }],
  },
  apis: [`${__dirname}/open-api.yaml`],
}