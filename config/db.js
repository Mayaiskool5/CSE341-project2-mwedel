const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'cse341_project2';

let _db;

const initDb = callback => {
    if (_db) {
        return callback(null, _db);
    }
    MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(client => {
            _db = client.db(DB_NAME);
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