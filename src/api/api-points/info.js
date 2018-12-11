const config = require('../../config');

// No types need to be defined
const typeDef = ``;

// Definition of the info functions for GraphQL
const query = `
    author: String,
    version: Int,
    blogTitle: String
`;

// Resolver, this resolves GraphQL requests
const resolver = {
    Query: {
        author() {
            return config.info.author;
        },

        version() {
            return config.info.version;
        },

        blogTitle() {
            return config.info.blogTitle;
        }
    }
};

module.exports = {typeDef, query, resolver};
