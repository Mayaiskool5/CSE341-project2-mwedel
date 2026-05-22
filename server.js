const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('./config/db');


const app = express();
const PORT = process.env.PORT || 8080;

app
    .use(cors())
    .use(bodyParser.json())
    .use('/', require('./routes'));

mongodb.initDb((err) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});