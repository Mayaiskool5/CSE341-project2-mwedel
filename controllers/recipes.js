const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all recipes
const getAll = async(req, res) => {
    try {
        const result = await dbConnection.getDb().collection('recipes').find().toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single recipe by ID
const getSingle = async(req, res) => {
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
// POST Create a new recipe
const createRecipe = async(req, res) => {
  try {
    let ingredients = req.body.ingredients;
    if (typeof ingredients === 'string') {
      ingredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
    const recipe = {
      title: req.body.title,
      ingredients,
      prepTimeMinutes: parseInt(req.body.prepTimeMinutes),
      difficulty: req.body.difficulty,
      isVegetarian: req.body.isVegetarian === true || req.body.isVegetarian === 'true'
    };
    const response = await dbConnection.getDb().collection('recipes').insertOne(recipe);
    if (response.acknowledged) {
      res.status(201).json(response);
    } else {
      res.status(500).json({ message: 'Failed to create recipe' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT Update Recipe
const updateRecipe = async (req, res) => {
  try {
    const recipeId = new ObjectId(req.params.id);
    let ingredients = req.body.ingredients;
    if (typeof ingredients === 'string') {
      ingredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
    const updatedRecipe = {
      title: req.body.title,
      ingredients,
      prepTimeMinutes: parseInt(req.body.prepTimeMinutes),
      difficulty: req.body.difficulty,
      isVegetarian: req.body.isVegetarian === true || req.body.isVegetarian === 'true'
    };
    const response = await dbConnection
      .getDb()
      .collection('recipes')
      .replaceOne({ _id: recipeId }, updatedRecipe);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Recipe not found or no changes made.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE Delete Recipe
const deleteRecipe = async (req, res) => {
  try {
    // 1. Convert the URL string ID into a MongoDB ObjectId
    const recipeId = new ObjectId(req.params.id);

    // 2. Execute the removal query matching the target _id
    const response = await dbConnection
      .getDb()
      .collection('recipes')
      .deleteOne({ _id: recipeId });

    // 3. Send appropriate HTTP status codes based on database outcome
    if (response.deletedCount > 0) {
      // 200 OK along with a confirmation message
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
