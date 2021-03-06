const express = require('express');

const graphqlHTTP = require('express-graphql');
const {makeExecutableSchema} = require('graphql-tools');
const {applyMiddleware} = require('graphql-middleware');
const validation = require('../validation');
const verify = require('./verify');

// API Points
const info = require('./queries/info');
const user = require('./queries/user');
const post = require('./queries/post');
const comment = require('./queries/comment');

const userTools = require('../db/user');

// Create an admin if there isn't one
userTools.findUser({username: 'admin'}).catch(() => {
    new userTools.User('admin',
        'Administrator',
        'admin@vue-blog.com',
        ['post', 'administrate', 'comment'],
        'admin'
    );
});

// Create API router for express
const api = express.Router();

// Base Query, creates one collective query for all of the API Points
// The API Points are all separate modules located in /src/api/api-points
const query = `
    type Query {
        schema: [String],
        
        ${info.query},
        ${user.query},
        ${post.query},
        ${comment.query}
    }
`;

// Get types defined types and resolvers from all API modules
const typeDefs = [query, info.typeDef, user.typeDef, post.typeDef, comment.typeDef];
const resolvers = [info.resolver, user.resolver, post.resolver, comment.resolver];

// Combine all API modules into one and apply validation middleware to validate incoming arguments
const schema = applyMiddleware(makeExecutableSchema({typeDefs, resolvers}), validation);

// Add Verification route
api.use('/verify', verify);

// Start listening
api.use('/', graphqlHTTP({
    schema: schema,
    graphiql: !_productionMode
}));

// Export module
module.exports = api;
