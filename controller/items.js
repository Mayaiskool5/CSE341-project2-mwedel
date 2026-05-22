const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

const getAll = async(req, res) => {
    try {
        const result = await dbConnection.getDb().collection('items').find().toArray();
        result.toArray().then(lists => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSingle = async(req, res) => {
    try {
        const itemId = new ObjectId(req.params.id);
        const result = await dbConnection.getDb().collection('items').findOne({ _id: itemId });
        result.toArray().then((lists) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(lists);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createItem = async(req, res) => {
    try {
        const item = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.category
        };
        const response = await dbConnection.getDb().collection('items').insertOne(item);
        if (response.acknowledged) {
            res.status(201).json(response);
        } else {
            res.status(500).json({ message: 'Failed to create item' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateItem = async(req, res) => {
    // Placeholder Logic for swagger design-first requirements
    res.status(204).send();
};

const deleteItem = async(req, res) => {
    // Placeholder Logic for swagger design-first requirements
    res.status(200).send();
};

module.exports = {
    getAll,
    getSingle,
    createItem,
    updateItem,
    deleteItem
};
