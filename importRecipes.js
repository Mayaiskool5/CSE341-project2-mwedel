const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function importRecipes() {
    // Read recipes.json
    const filePath = path.join(__dirname, 'recipes.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    let recipes = JSON.parse(data);

    // If recipes is an object with a property, extract the array
    if (!Array.isArray(recipes)) {
        recipes = recipes.recipes || Object.values(recipes)[0] || [];
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection('recipes');
        const result = await collection.insertMany(recipes);
        console.log(`${result.insertedCount} recipes inserted.`);
    } catch (err) {
        console.error('Error inserting recipes:', err);
    } finally {
        await client.close();
    }
}

importRecipes();
