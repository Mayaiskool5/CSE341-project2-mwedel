const fs = require('fs');

const doc = {
  swagger: '2.0',
  info: {
    title: 'Recipe & Meal Planner GraphQL API',
    description: 'GraphQL API for recipes and users, plus OAuth authentication flows.',
    version: '1.0.0'
  },
  host: '',
  basePath: '/',
  schemes: ['http', 'https'],
  paths: {
    '/recipes': {
      get: {
        summary: 'Get all recipes',
        description: 'Retrieve a list of all recipes.',
        produces: ['application/json'],
        responses: {
          '200': { description: 'List of recipes.' },
          '500': { description: 'Internal server error.' }
        }
      },
      post: {
        summary: 'Create a new recipe',
        description: 'Add a new recipe to the database.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', example: 'Pasta Carbonara' },
                description: { type: 'string', example: 'Classic Italian pasta' },
                category: { type: 'string', example: 'Italian' },
                difficulty: { type: 'string', example: 'Medium' },
                ingredients: { type: 'array', items: { type: 'string' } },
                instructions: { type: 'string' }
              },
              required: ['title', 'description', 'category', 'difficulty', 'ingredients', 'instructions']
            }
          }
        ],
        responses: {
          '201': { description: 'Recipe created successfully.' },
          '400': { description: 'Validation error.' },
          '500': { description: 'Internal server error.' }
        }
      }
    },
    '/recipes/{id}': {
      get: {
        summary: 'Get a single recipe',
        description: 'Retrieve a recipe by ID.',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          }
        ],
        responses: {
          '200': { description: 'Recipe details.' },
          '404': { description: 'Recipe not found.' },
          '500': { description: 'Internal server error.' }
        }
      },
      put: {
        summary: 'Update a recipe',
        description: 'Update an existing recipe by ID.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                difficulty: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' } },
                instructions: { type: 'string' }
              }
            }
          }
        ],
        responses: {
          '200': { description: 'Recipe updated successfully.' },
          '400': { description: 'Validation error.' },
          '404': { description: 'Recipe not found.' },
          '500': { description: 'Internal server error.' }
        }
      },
      delete: {
        summary: 'Delete a recipe',
        description: 'Delete a recipe by ID.',
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'Recipe ID'
          }
        ],
        responses: {
          '200': { description: 'Recipe deleted successfully.' },
          '404': { description: 'Recipe not found.' },
          '500': { description: 'Internal server error.' }
        }
      }
    },
    '/graphql': {
      post: {
        summary: 'Execute GraphQL operations',
        description: 'Submit a GraphQL query or mutation to the API. Use GraphiQL for interactive exploration in non-production environments.',
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'payload',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  example: 'query { recipes { _id title category difficulty } }'
                },
                variables: {
                  type: 'object'
                }
              }
            }
          }
        ],
        responses: {
          '200': { description: 'GraphQL response object.' },
          '400': { description: 'Bad request or invalid GraphQL syntax.' },
          '500': { description: 'Internal server error.' }
        }
      }
    },
    '/auth/google': {
      get: {
        summary: 'Start Google OAuth login',
        description: 'Redirects the client to Google for OAuth authentication.',
        responses: {
          '302': { description: 'Redirect to Google login.' }
        }
      }
    },
    '/auth/google/callback': {
      get: {
        summary: 'Google OAuth callback',
        description: 'Handles Google OAuth callback and signs the user in.',
        responses: {
          '200': { description: 'Login successful.' },
          '401': { description: 'Authentication failed.' }
        }
      }
    },
    '/auth/logout': {
      get: {
        summary: 'Logout current user',
        description: 'Ends the authenticated session.',
        responses: {
          '200': { description: 'Logout successful.' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current user',
        description: 'Returns the currently authenticated OAuth user.',
        responses: {
          '200': { description: 'Authenticated user object.' },
          '401': { description: 'Authentication required.' }
        }
      }
    },
    '/status': {
      get: {
        summary: 'API status',
        description: 'Returns a simple health check response.',
        produces: ['application/json'],
        responses: {
          '200': { description: 'API is healthy.' }
        }
      }
    }
  },
  definitions: {
    GraphQLRequest: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'query { recipes { _id title } }' },
        variables: { type: 'object' }
      }
    }
  }
};

fs.writeFileSync('./swagger.json', JSON.stringify(doc, null, 2));
console.log('swagger.json generated');