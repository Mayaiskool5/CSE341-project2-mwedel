const express = require('express');
const router = express.Router();
const itemsController = require('../controller/items');

router.get('/items', itemsController.getAll);
router.get('/items/:id', itemsController.getSingle);
router.post('/items', itemsController.createItem);
router.put('/items/:id', itemsController.updateItem);
router.delete('/items/:id', itemsController.deleteItem);

module.exports = router;