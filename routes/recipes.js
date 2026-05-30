const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes');
const { recipeValidationRules, validate } = require('../middleware/validate');


router.get('/', recipesController.getAll);
router.get('/:id', recipesController.getSingle);
router.post('/', recipeValidationRules(), validate, recipesController.createRecipe);
router.put('/:id', recipeValidationRules(), validate, recipesController.updateRecipe);
router.delete('/:id', recipesController.deleteRecipe);

module.exports = router;