const { MongoClient } = require('mongodb');
require('dotenv').config();

let _db;

const initDb = callback => {
    if (_db) {
        return callback(null, _db);
    }
    MongoClient.connect(process.env.MONGODB_URI)
        .then(client => {
            _db = client.db();
            callback(null, _db);
        })
        .catch(err => {
            callback(err, null);
        });
};

const getDb = () => {
    if (!_db) {
        throw new Error('Database not initialized');
    }
    return _db;
};

module.exports = {
    initDb,
    getDb
};