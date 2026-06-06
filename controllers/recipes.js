const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

const normalizeIngredients = ingredients => {
  if (Array.isArray(ingredients)) return ingredients.map(item => item.trim()).filter(Boolean);
  if (typeof ingredients === 'string') return ingredients.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const getAll = async (req, res) => {
  try {
    console.log('GET /recipes called');
    const db = dbConnection.getDb();
    const result = await db.collection('recipes').find().toArray();
    console.log(`Retrieved ${result.length} recipes`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ message: err.message });
  }
};

const getSingle = async (req, res) => {
  try {
    console.log(`GET /recipes/${req.params.id} called`);
    const recipeId = new ObjectId(req.params.id);
    const result = await dbConnection.getDb().collection('recipes').findOne({ _id: recipeId });
    res.setHeader('Content-Type', 'application/json');
    if (result) {
      console.log(`Retrieved recipe: ${result._id}`);
      res.status(200).json(result);
    } else {
      console.log(`Recipe not found: ${req.params.id}`);
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (err) {
    console.error('Error fetching recipe by id:', err);
    res.status(500).json({ message: err.message });
  }
};

const createRecipe = async (req, res) => {
  try {
    console.log('POST /recipes called with body:', req.body);
    const ingredients = normalizeIngredients(req.body.ingredients);
    const recipe = {
      title: req.body.title,
      ingredients,
      prepTimeMinutes: parseInt(req.body.prepTimeMinutes, 10),
      difficulty: req.body.difficulty,
      isVegetarian: req.body.isVegetarian === true || req.body.isVegetarian === 'true',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const response = await dbConnection.getDb().collection('recipes').insertOne(recipe);
    if (response.acknowledged) {
      console.log(`Recipe created successfully with id: ${response.insertedId}`);
      res.status(201).json({ message: 'Recipe created successfully', recipeId: response.insertedId });
    } else {
      console.log('Recipe creation was not acknowledged');
      res.status(500).json({ message: 'Failed to create recipe' });
    }
  } catch (err) {
    console.error('Error creating recipe:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateRecipe = async (req, res) => {
  try {
    console.log(`PUT /recipes/${req.params.id} called with body:`, req.body);
    const recipeId = new ObjectId(req.params.id);
    const ingredients = normalizeIngredients(req.body.ingredients);
    const updatedRecipe = {
      title: req.body.title,
      ingredients,
      prepTimeMinutes: parseInt(req.body.prepTimeMinutes, 10),
      difficulty: req.body.difficulty,
      isVegetarian: req.body.isVegetarian === true || req.body.isVegetarian === 'true',
      updatedAt: new Date()
    };
    const response = await dbConnection
      .getDb()
      .collection('recipes')
      .updateOne({ _id: recipeId }, { $set: updatedRecipe });
    if (response.matchedCount > 0) {
      console.log(`Recipe ${recipeId} updated successfully`);
      res.status(200).json({ message: 'Recipe updated successfully' });
    } else {
      console.log(`Recipe not found for update: ${req.params.id}`);
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (err) {
    console.error('Error updating recipe:', err);
    res.status(500).json({ message: err.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    console.log(`DELETE /recipes/${req.params.id} called`);
    const recipeId = new ObjectId(req.params.id);
    const response = await dbConnection
      .getDb()
      .collection('recipes')
      .deleteOne({ _id: recipeId });
    if (response.deletedCount > 0) {
      console.log(`Recipe ${recipeId} deleted successfully`);
      res.status(200).json({ message: 'Recipe successfully deleted from the database.' });
    } else {
      console.log(`Recipe not found for deletion: ${req.params.id}`);
      res.status(404).json({ message: 'Recipe not found. Nothing was deleted.' });
    }
  } catch (err) {
    console.error('Error deleting recipe:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
