const post = require('../tools/posttools.js');

const typeDef = `
    type Post {
        postid: String,
        title: String,
        author: User,
        timestamp: Int,
        
        body: String,
        
        error: Boolean,
        errorMessage: String,
    }
`;

const query = `
    post(apikey: String!, title: String!, body: String!): Post,
    updatePost(apikey: String!, postid: String!, title: String, body: String): Post,
    getPost(postid: String!): Post,
    getPostRange(timestart: Int!, timeend: Int!): [Post],
    getPostCount(count: Int!): [Post],
    getAllPosts: [Post]
`;

const resolver = {
    Query: {
        // Get a fresh post object
        post: (obj, args) => {
            return post.writePost(args)
                .then(postData => postData);
        },

        // Load one specific post
        getPost: (obj, args) => {
            return post.getPost(args)
                .then(postData => postData);
        },

        updatePost: (obj, args) => {
            return post.updatePost(args)
                .then(postData => postData);
        },

        // Get all posts in date range
        getPostRange: (obj, { timestart, timeend }) => {

        },

        // Get a specific number of posts
        getPostCount: (obj, { count }) => {

        },

        // Return all posts
        getAllPosts: () => {

        }
    }
};

module.exports = { typeDef, query, resolver };
