const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

const normalizeIngredients = ingredients => {
  if (Array.isArray(ingredients)) return ingredients.map(item => item.trim()).filter(Boolean);
  if (typeof ingredients === 'string') return ingredients.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const getAll = async (req, res) => {
  try {
    const result = await dbConnection.getDb().collection('recipes').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const recipeId = new ObjectId(req.params.id);
    const result = await dbConnection.getDb().collection('recipes').findOne({ _id: recipeId });
    res.setHeader('Content-Type', 'application/json');
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRecipe = async (req, res) => {
  try {
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
      res.status(201).json({ message: 'Recipe created successfully', recipeId: response.insertedId });
    } else {
      res.status(500).json({ message: 'Failed to create recipe' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRecipe = async (req, res) => {
  try {
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
      res.status(200).json({ message: 'Recipe updated successfully' });
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipeId = new ObjectId(req.params.id);
    const response = await dbConnection
      .getDb()
      .collection('recipes')
      .deleteOne({ _id: recipeId });
    if (response.deletedCount > 0) {
      res.status(200).json({ message: 'Recipe successfully deleted from the database.' });
    } else {
      res.status(404).json({ message: 'Recipe not found. Nothing was deleted.' });
    }
  } catch (err) {
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
