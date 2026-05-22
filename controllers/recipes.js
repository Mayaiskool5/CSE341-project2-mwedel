const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all recipes
const getAll = async(req, res) => {
    try {
        const result = await dbConnection.getDb().collection('recipes').find().toArray();
        result.toArray().then(lists => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single recipe by ID
const getSingle = async(req, res) => {
    try {
        const itemId = new ObjectId(req.params.id);
        const result = await dbConnection.getDb().collection('recipes').findOne({ _id: recipeId });
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists[0] || { message: 'Recipe not found' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// POST Create a new recipe
const createRecipe = async(req, res) => {
    try {
        const recipe = {
            title: req.body.title,
            ingredients: req.body.ingredients, // Array of strings
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

// PUT Update Recipe (Placehodler for swagger design-first requirements)
const updateRecipe = async(req, res) => {
    res.status(204).json({ message: "Recipe update placeholder success" });
};


// DELETE Delete Recipe (Placehodler for swagger design-first requirements)
const deleteRecipe = async(req, res) => {
    res.status(200).json({ message: "Recipe delete placeholder success" });
};

module.exports = {
    getAll,
    getSingle,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
