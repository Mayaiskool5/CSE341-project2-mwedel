const dbConnection = require('../config/db');
const { ObjectId } = require('mongodb');

const sanitizeUser = user => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

const getUsers = async (req, res) => {
  try {
    const result = await dbConnection.getDb().collection('users').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const result = await dbConnection.getDb().collection('users').findOne({ _id: userId });
    if (result) {
      res.status(200).json(sanitizeUser(result));
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = {
      displayName: req.body.displayName,
      email: req.body.email,
      provider: req.body.provider,
      providerId: req.body.providerId || null,
      role: req.body.role || 'user',
      picture: req.body.picture || null,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    const response = await dbConnection.getDb().collection('users').insertOne(user);
    if (response.acknowledged) {
      res.status(201).json({ message: 'User created successfully.', userId: response.insertedId });
    } else {
      res.status(500).json({ message: 'Failed to create user.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const updatedUser = {
      displayName: req.body.displayName,
      email: req.body.email,
      provider: req.body.provider,
      providerId: req.body.providerId || null,
      role: req.body.role || 'user',
      picture: req.body.picture || null,
      lastLogin: new Date()
    };
    const response = await dbConnection
      .getDb()
      .collection('users')
      .updateOne({ _id: userId }, { $set: updatedUser });
    if (response.matchedCount > 0) {
      res.status(200).json({ message: 'User updated successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const response = await dbConnection
      .getDb()
      .collection('users')
      .deleteOne({ _id: userId });
    if (response.deletedCount > 0) {
      res.status(200).json({ message: 'User deleted successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
