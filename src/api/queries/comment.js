const user = require('../../db/user');
const comment = require('../../db/comment');
const errors = require('../../../config/errors');

// Definition of the comment class for GraphQL
const typeDef = `
    type Comment {
        id: String,
        author: String,
        user: User,
        body: String,
        timestamp: Float
    }
`;

// Definition of the comment functions for GraphQL
/**
 * comment: create a new comment and return it
 * removeComment: delete an already existing comment
 * updateComment: edit an existing comment
 * @type {string}
 */
const query = `
    comment(apikey: String!, postid: String!, body: String!): Comment,
    removeComment(apikey: String!, postid: String!, id: String!): Comment,
    updateComment(apikey: String!, postid: String!, id: String!, body: String!): Comment
`;

// Resolver, this resolves GraphQL requests
const resolver = {

    Query: {
        async comment(_, args) {

            // Make sure all required arguments are present
            if (!args.apikey || !args.postid || !args.body) {
                throw errors.missing.some;
            }

            // Perform action and return promise
            return comment.comment(args);
        },

        async removeComment(_, args) {

            // Make sure all required arguments are present
            if (!args.apikey || !args.postid || !args.id) {
                throw errors.missing.some;
            }

            // Perform action and return promise
            return comment.removeComment(args);
        },

        async updateComment(_, args) {

            // Make sure all required arguments are present
            if (!args.apikey || !args.postid || !args.id || !args.body) {
                throw errors.missing.some;
            }

            // Perform action and return promise
            return comment.updateComment(args);
        }
    },

    Comment: {

        // For simplification purposes, users are stored in comments as just their IDs.
        // When a query for a comment user is made, this function is called to resolve it.
        async user(obj) {
            return user.getUser({id: obj.author})
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        }
    }
};

module.exports = {typeDef, query, resolver};
