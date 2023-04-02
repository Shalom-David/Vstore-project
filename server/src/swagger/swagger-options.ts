import { Options } from 'swagger-jsdoc'

export const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vstore-API',
      version: '1.0.0',
      description: 'Api documentation for Vstore',
    },
    servers: [{ url: `http://localhost:${process.env.APP_PORT}` }],
  },
  apis: [`${__dirname}/open-api.yaml`],
}
