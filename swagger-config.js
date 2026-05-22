const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'CSE 341 Project 2 API',
    description: 'API Documentation displaying full CRUD pathways.'
  },
  host: '', // Left blank to dynamically adapt to local and production (Render) environments
  schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);