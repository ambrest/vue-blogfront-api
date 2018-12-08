const express = require('express');

const graphqlHTTP = require('express-graphql');
const {makeExecutableSchema} = require('graphql-tools');

// API Points
const info = require('./info');
const user = require('./user');
const post = require('./post');

// Create API router
const api = express.Router();

// Base Query
const query = `
    type Query {
        schema: [String],
        
        ${info.query},
        ${user.query},
        ${post.query}
    }
`;

const typeDefs = [query, info.typeDef, user.typeDef, post.typeDef];

const baseResolver = {
    Query: {
        schema() {
            return typeDefs;
        }
    }
};

// Get definitions from all other modules
const schema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: [info.resolver, user.resolver, post.resolver, baseResolver]
});

// Start listening
api.use('/', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

// Export module
module.exports = api;
