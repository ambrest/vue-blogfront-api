const post = require('../../db/post');
const user = require('../../db/user');

// Definition of the post class for GraphQL
const typeDef = `
    type Post {
        id: String,
        title: String,
        author: String,
        totalClaps: Int,
        myClaps: Int,
        user: User,
        timestamp: Float,
        body: String,
        tags: [String],
        comments: [Comment]
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
    post(apikey: String!, title: String!, body: String!, tags: [String!]!): Post,
    removePost(apikey: String!, id: String!): Post,
    updatePost(apikey: String!, id: String!, title: String, body: String, tags: [String!]!): Post,
    getPost(apikey: String, id: String!): Post,
    getPostCountRange(apikey: String, start: Int!, end: Int!): [Post],
    getPostsBy(apikey: String, userid: String!, start: Int!, end: Int!): [Post],
    getPostsWhereClapped(apikey: String, userid: String!, start: Int!, end: Int!): [Post],
    searchPosts(apikey: String, query: String!, start: Int!, end: Int!): [Post],
    incrementClaps(apikey: String!, postId: String!, newClaps: Int!): Post
`;

const resolver = {

    Query: {
        async post(_, args) {

            // Perform action and return promise
            return post.writePost(args);
        },

        async searchPosts(_, args) {

            // Perform action and return promise
            return post.searchPosts(args);
        },

        async getPost(_, args) {

            // Perform action and return promise
            return post.getPost(args);
        },

        async updatePost(_, args) {

            // Perform action and return promise
            return post.updatePost(args);
        },

        async removePost(_, args) {

            // Perform action and return promise
            return post.removePost(args);
        },

        async getPostCountRange(_, args) {

            // Perform action and return promise
            return post.getPostCountRange(args);
        },

        async getPostsBy(_, args) {

            // Perform action and return promise
            return post.getPostsBy(args);
        },

        async incrementClaps(_, args) {

            // Perform action and return promise
            return post.incrementClaps(args);
        },

        async getPostsWhereClapped(_, args){

            // Perform action and return promise
            return post.getPostsWhereClapped(args);
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
