const router = require('express').Router();
const usersController = require('../controllers/users');
const { userValidationRules, validate } = require('../middleware/validate');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.post('/', userValidationRules(), validate, usersController.createUser);
router.put('/:id', userValidationRules(), validate, usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
