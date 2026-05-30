const { body, validationResult } = require('express-validator');


// Validation rules for recipes
const recipeValidationRules = () => {
  return [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('ingredients')
      .custom(val => {
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean).length > 0;
        return false;
      })
      .withMessage('Ingredients must be a non-empty array or a comma-separated string.'),
    body('prepTimeMinutes')
      .custom(val => !isNaN(parseInt(val)) && parseInt(val) > 0)
      .withMessage('Preparation time must be a positive integer.'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard.'),
    body('isVegetarian')
      .custom(val => {
        if (typeof val === 'boolean') return true;
        if (typeof val === 'string') return val === 'true' || val === 'false';
        return false;
      })
      .withMessage('isVegetarian must be a boolean or "true"/"false" string.')
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
