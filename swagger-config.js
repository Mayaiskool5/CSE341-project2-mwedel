const fs = require('fs');

const doc = {
  swagger: '2.0',
  info: {
    title: 'Recipe & Meal Planner GraphQL API',
    description: 'GraphQL API for recipes and users, plus OAuth authentication flows.',
    version: '1.0.0'
  },
  host: process.env.SWAGGER_HOST || 'cse341-project2-mwedel.onrender.com',
  basePath: '/',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
  securityDefinitions: {
    cookieAuth: {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
      description: 'Session cookie for authenticated routes.'
    },
    googleOAuth: {
      type: 'oauth2',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
      flow: 'implicit',
      scopes: {
        profile: 'Access user profile information',
        email: 'Access user email address'
      }
    }
  },
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
        description: 'Add a new recipe to the database. Requires authentication via session cookie.',
        security: [{ cookieAuth: [] }],
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
        description: 'Update an existing recipe by ID. Requires authentication via session cookie.',
        security: [{ cookieAuth: [] }],
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
        description: 'Delete a recipe by ID. Requires authentication via session cookie.',
        security: [{ cookieAuth: [] }],
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
        description: 'Submit a GraphQL query or mutation to the API. Mutations that change data require authentication via session cookie.',
        security: [{ cookieAuth: [] }],
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
    '/auth/login': {
      post: {
        summary: 'Local login',
        description: 'Authenticate using email and password. Stores a session cookie on success.',
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
                email: { type: 'string', example: 'student@example.com' },
                password: { type: 'string', example: 'securePass123' }
              },
              required: ['email', 'password']
            }
          }
        ],
        responses: {
          '200': { description: 'Login successful.' },
          '401': { description: 'Authentication failed.' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Local user registration',
        description: 'Create a new local account with hashed password storage.',
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
                displayName: { type: 'string', example: 'Maya Wedel' },
                email: { type: 'string', example: 'student@example.com' },
                password: { type: 'string', example: 'securePass123' }
              },
              required: ['displayName', 'email', 'password']
            }
          }
        ],
        responses: {
          '201': { description: 'Account created successfully.' },
          '409': { description: 'Email already registered.' },
          '422': { description: 'Validation failed.' }
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
        description: 'Returns the currently authenticated user via session cookie.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user object.' },
          '401': { description: 'Authentication required.' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Get all users',
        description: 'Returns all registered users. Requires authentication.',
        security: [{ cookieAuth: [] }],
        produces: ['application/json'],
        responses: {
          '200': { description: 'List of users.' },
          '401': { description: 'Authentication required.' },
          '500': { description: 'Internal server error.' }
        }
      },
      post: {
        summary: 'Create a new user',
        description: 'Create a new user record. Requires authentication.',
        security: [{ cookieAuth: [] }],
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
                displayName: { type: 'string' },
                email: { type: 'string' },
                provider: { type: 'string' },
                providerId: { type: 'string' },
                role: { type: 'string' },
                picture: { type: 'string' }
              }
            }
          }
        ],
        responses: {
          '201': { description: 'User created successfully.' },
          '401': { description: 'Authentication required.' },
          '500': { description: 'Internal server error.' }
        }
      }
    },
    '/users/{id}': {
      get: {
        summary: 'Get a user by ID',
        description: 'Returns a user by ID. Requires authentication.',
        security: [{ cookieAuth: [] }],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          }
        ],
        responses: {
          '200': { description: 'User details.' },
          '401': { description: 'Authentication required.' },
          '404': { description: 'User not found.' },
          '500': { description: 'Internal server error.' }
        }
      },
      put: {
        summary: 'Update a user',
        description: 'Update a user record by ID. Requires authentication.',
        security: [{ cookieAuth: [] }],
        consumes: ['application/json'],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          },
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: {
                displayName: { type: 'string' },
                email: { type: 'string' },
                provider: { type: 'string' },
                providerId: { type: 'string' },
                role: { type: 'string' },
                picture: { type: 'string' }
              }
            }
          }
        ],
        responses: {
          '200': { description: 'User updated successfully.' },
          '401': { description: 'Authentication required.' },
          '404': { description: 'User not found.' },
          '500': { description: 'Internal server error.' }
        }
      },
      delete: {
        summary: 'Delete a user',
        description: 'Delete a user by ID. Requires authentication.',
        security: [{ cookieAuth: [] }],
        produces: ['application/json'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            type: 'string',
            description: 'User ID'
          }
        ],
        responses: {
          '200': { description: 'User deleted successfully.' },
          '401': { description: 'Authentication required.' },
          '404': { description: 'User not found.' },
          '500': { description: 'Internal server error.' }
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