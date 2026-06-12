const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes');
const { recipeValidationRules, validate } = require('../middleware/validate');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', recipesController.getAll);
router.get('/:id', recipesController.getSingle);
router.post('/', ensureAuthenticated, recipeValidationRules(), validate, recipesController.createRecipe);
router.put('/:id', ensureAuthenticated, recipeValidationRules(), validate, recipesController.updateRecipe);
router.delete('/:id', ensureAuthenticated, recipesController.deleteRecipe);

module.exports = router;
