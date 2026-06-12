const bcrypt = require('bcrypt');
const dbConnection = require('../config/db');

const registerLocal = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;
    const usersCollection = dbConnection.getDb().collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase(), provider: 'local' });
    if (existingUser) {
      return res.status(409).json({ message: 'A local account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      displayName,
      email: email.toLowerCase(),
      provider: 'local',
      providerId: null,
      role: 'user',
      picture: null,
      passwordHash,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const response = await usersCollection.insertOne(user);
    if (response.acknowledged) {
      return res.status(201).json({ message: 'Account created successfully.', userId: response.insertedId });
    }

    return res.status(500).json({ message: 'Failed to create account.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerLocal
};
