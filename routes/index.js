const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    service: 'Recipe & Meal Planner API',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      rest: {
        recipes: '/recipes',
        users: '/users'
      },
      auth: '/auth/google',
      docs: '/api-docs'
    }
  });
});

router.use('/recipes', require('./recipes'));
router.use('/users', require('./users'));
router.use('/auth', require('./auth'));
router.use('/', require('./swagger'));

module.exports = router;