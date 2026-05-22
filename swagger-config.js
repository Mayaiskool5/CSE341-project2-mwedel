const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'CSE 341 Project 2 API)',
        version: '1.0.0',
        description: 'API for managing items in the CSE 341 Project'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        }
    ]
};