const { buildSchema } = require('graphql');
const { ObjectId } = require('mongodb');

const schema = buildSchema(`
  type Recipe {
    _id: ID!
    title: String!
    ingredients: [String!]!
    prepTimeMinutes: Int!
    difficulty: String!
    isVegetarian: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    displayName: String!
    email: String!
    provider: String!
    providerId: String
    role: String!
    picture: String
    createdAt: String!
    lastLogin: String!
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  input RecipeInput {
    title: String!
    ingredients: [String!]!
    prepTimeMinutes: Int!
    difficulty: String!
    isVegetarian: Boolean!
  }

  input UserInput {
    displayName: String!
    email: String!
    provider: String!
    providerId: String
    role: String
    picture: String
  }

  type Query {
    recipes: [Recipe!]!
    recipe(id: ID!): Recipe
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    addRecipe(input: RecipeInput!): Recipe!
    updateRecipe(id: ID!, input: RecipeInput!): Recipe!
    deleteRecipe(id: ID!): DeleteResponse!
    addUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): DeleteResponse!
  }
`);

const ensureAuthenticated = context => {
  if (!context || !context.user) {
    throw new Error('Authentication required. Please sign in with OAuth.');
  }
};

const normalizeIngredients = ingredients => {
  if (Array.isArray(ingredients)) return ingredients.map(item => item.trim()).filter(Boolean);
  if (typeof ingredients === 'string') return ingredients.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const validateRecipeInput = input => {
  if (!input.title || !input.title.trim()) throw new Error('Recipe title is required.');
  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) throw new Error('Ingredients must be a non-empty array.');
  if (!Number.isInteger(input.prepTimeMinutes) || input.prepTimeMinutes <= 0) throw new Error('prepTimeMinutes must be a positive integer.');
  if (!['easy', 'medium', 'hard'].includes(input.difficulty)) throw new Error('Difficulty must be easy, medium, or hard.');
  return {
    title: input.title.trim(),
    ingredients: normalizeIngredients(input.ingredients),
    prepTimeMinutes: input.prepTimeMinutes,
    difficulty: input.difficulty,
    isVegetarian: input.isVegetarian,
    description: input.description?.trim() || null,
    instructions: input.instructions?.trim() || null,
    cookTimeMinutes: Number.isInteger(input.cookTimeMinutes) ? input.cookTimeMinutes : null,
    servings: Number.isInteger(input.servings) ? input.servings : null,
    category: input.category?.trim() || null
  };
};

const validateUserInput = input => {
  if (!input.displayName || !input.displayName.trim()) throw new Error('Display name is required.');
  if (!input.email || !input.email.trim()) throw new Error('Email is required.');
  if (!input.provider || !input.provider.trim()) throw new Error('Provider is required.');
  return {
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    provider: input.provider.trim(),
    providerId: input.providerId || null,
    role: input.role?.trim() || 'user',
    picture: input.picture || null
  };
};

const toJsonObject = doc => {
  if (!doc) return null;
  const converted = { ...doc };
  if (converted._id) converted._id = converted._id.toString();
  if (converted.createdAt) converted.createdAt = converted.createdAt.toISOString();
  if (converted.updatedAt) converted.updatedAt = converted.updatedAt.toISOString();
  if (converted.lastLogin) converted.lastLogin = converted.lastLogin.toISOString();
  return converted;
};

const root = {
  recipes: async (source, args, context) => {
    const recipes = await context.db.collection('recipes').find().toArray();
    return recipes.map(toJsonObject);
  },

  recipe: async (source, { id }, context) => {
    const recipe = await context.db.collection('recipes').findOne({ _id: new ObjectId(id) });
    return toJsonObject(recipe);
  },

  users: async (source, args, context) => {
    const users = await context.db.collection('users').find().toArray();
    return users.map(toJsonObject);
  },

  user: async (source, { id }, context) => {
    const user = await context.db.collection('users').findOne({ _id: new ObjectId(id) });
    return toJsonObject(user);
  },

  me: async (source, args, context) => {
    return context.user ? toJsonObject(context.user) : null;
  },

  addRecipe: async (source, { input }, context) => {
    ensureAuthenticated(context);
    const recipe = validateRecipeInput(input);
    const now = new Date();
    const document = {
      ...recipe,
      createdAt: now,
      updatedAt: now
    };
    const result = await context.db.collection('recipes').insertOne(document);
    return toJsonObject({ ...document, _id: result.insertedId });
  },

  updateRecipe: async (source, { id, input }, context) => {
    ensureAuthenticated(context);
    const recipe = validateRecipeInput(input);
    const updatedRecipe = {
      ...recipe,
      updatedAt: new Date()
    };
    const result = await context.db.collection('recipes').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedRecipe },
      { returnDocument: 'after' }
    );
    if (!result.value) throw new Error('Recipe not found.');
    return toJsonObject(result.value);
  },

  deleteRecipe: async (source, { id }, context) => {
    ensureAuthenticated(context);
    const result = await context.db.collection('recipes').deleteOne({ _id: new ObjectId(id) });
    return {
      success: result.deletedCount > 0,
      message: result.deletedCount > 0 ? 'Recipe deleted.' : 'Recipe not found.'
    };
  },

  addUser: async (source, { input }, context) => {
    ensureAuthenticated(context);
    const user = validateUserInput(input);
    const now = new Date();
    const document = {
      ...user,
      createdAt: now,
      lastLogin: now
    };
    const result = await context.db.collection('users').insertOne(document);
    return toJsonObject({ ...document, _id: result.insertedId });
  },

  updateUser: async (source, { id, input }, context) => {
    ensureAuthenticated(context);
    const user = validateUserInput(input);
    const updatedUser = {
      ...user,
      lastLogin: new Date()
    };
    const result = await context.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedUser },
      { returnDocument: 'after' }
    );
    if (!result.value) throw new Error('User not found.');
    return toJsonObject(result.value);
  },

  deleteUser: async (source, { id }, context) => {
    ensureAuthenticated(context);
    const result = await context.db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return {
      success: result.deletedCount > 0,
      message: result.deletedCount > 0 ? 'User deleted.' : 'User not found.'
    };
  }
};

module.exports = {
  schema,
  root
};
