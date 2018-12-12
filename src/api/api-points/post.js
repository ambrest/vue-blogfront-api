const post = require('../../tools/post-tools');
const user = require('../../tools/user-tools');
const config = require('../../config');

// Definition of the post class for GraphQL
const typeDef = `
    type Post {
        id: String,
        title: String,
        author: String,
        user: User,
        timestamp: Float,
        
        comments: [Comment],
        
        body: String
    }
`;

// Definition of the post functions for GraphQL
/**
 * post: create a new post
 * removePost: remove an existing post
 * updatePost: update an existing post
 * getPost: get an existing post
 * getPostRange: get all posts in a given time range
 * getPostCount: get a certain number of posts
 * getAllPosts: get all posts on the server
 * @type {string}
 */
const query = `
    post(apikey: String!, title: String!, body: String!): Post,
    removePost(apikey: String!, id: String!): Post,
    updatePost(apikey: String!, id: String!, title: String, body: String): Post,
    getPost(id: String!): Post,
    getPostRange(timestart: Float!, timeend: Float!): [Post],
    getPostCount(count: Int!): [Post],
    getAllPosts: [Post]
`;

const resolver = {

    Query: {
        post(_, args) {

            // Make sure all required arguments are present
            if (!args.title || !args.body || !args.apikey) {
                throw config.errors.missing.some;
            }

            // Perform action and return promise
            return post.writePost(args);
        },

        getPost(_, args) {

            // Make sure all required arguments are present
            if (!args.id) {
                throw config.errors.missing.all;
            }

            // Perform action and return promise
            return post.getPost(args);
        },

        updatePost(_, args) {

            // Make sure all required arguments are present
            if (!args.apikey || !args.id) {
                throw config.errors.missing.some;
            }

            // Perform action and return promise
            return post.updatePost(args);
        },

        getPostRange(_, args) {

            // Perform action and return promise
            return post.getPostRange(args);
        },

        getPostCount(_, args) {

            // Perform action and return promise
            return post.getPostCount(args);
        },

        getAllPosts() {

            // Perform action and return promise
            return post.getAllPosts();
        },

        removePost(_, args) {

            // Make sure all required arguments are present
            if (!args.id && !args.apikey) {
                throw config.errors.missing.all;
            }

            // Perform action and return promise
            return post.removePost(args);
        }
    },

    Post: {

        // For simplification purposes, users are stored in posts as just their IDs.
        // When a query for a comment user is made, this function is called to resolve it.
        user(obj) {

            // Perform action and return promise
            return user.getUser({id: obj.author});
        }
    }
};

module.exports = {typeDef, query, resolver};
