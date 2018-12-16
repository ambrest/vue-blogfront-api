const express = require('express');

const graphqlHTTP = require('express-graphql');
const {makeExecutableSchema} = require('graphql-tools');
const {applyMiddleware} = require('graphql-middleware');
const validation = require('../validation/validation');

// API Points
const info = require('./api-points/info');
const user = require('./api-points/user');
const post = require('./api-points/post');
const comment = require('./api-points/comment');

const userTools = require('../tools/user-tools');

// Create an admin if there isn't one
userTools.findUser({username: 'admin'}).catch(() => {
    new userTools.User('admin',
        'Administrator',
        'admin@vue-blog.com',
        ['post', 'administrate', 'comment'],
        'admin',
        false);
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

// Start listening
api.use('/', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

// Export module
module.exports = api;
