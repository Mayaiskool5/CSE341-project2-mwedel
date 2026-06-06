require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { graphqlHTTP } = require('express-graphql');
const dbClient = require('./config/db');
const initializePassport = require('./config/passport');
const { schema, root } = require('./graphql/schema');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'legos_rule',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', require('./routes/auth'));

app.use('/graphql', graphqlHTTP(req => ({
    schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV !== 'production',
    context: {
        db: dbClient.getDb(),
        user: req.user
    },
    customFormatErrorFn: err => ({ message: err.message })
})));

app.get('/', (req, res) => {
    res.json({
        service: 'Recipe & Meal Planner GraphQL API',
        version: '1.0.0',
        graphql: '/graphql',
        auth: '/auth/google'
    });
});

app.get('/status', (req, res) => {
    res.status(200).json({ status: 'ok', version: '1.0.0' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found.' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
});

const startServer = () => {
    dbClient.initDb((err) => {
        if (err) {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1);
        }
        initializePassport();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
};

startServer();