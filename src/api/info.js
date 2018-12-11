const config = require('../config');

const typeDef = ``;

const query = `
    author: String,
    version: Int,
    blogTitle: String
`;

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
