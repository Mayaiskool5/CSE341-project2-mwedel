const { body, validationResult } = require('express-validator');


// Validation rules for recipes
const recipeValidationRules = () => {
  return [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be a non-empty array.'),
    body('prepTimeMinutes').isInt({ min: 1 }).withMessage('Preparation time must be a positive integer.'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard.'),
    body('isVegetarian').isBoolean().withMessage('isVegetarian must be a boolean.')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Error handling integration
  return res.status(422).json({
    success: false,
    errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
  });
};

module.exports = {
  recipeValidationRules,
  validate
};
