const post = require('../tools/post-tools');
const user = require('../tools/user-tools');
const config = require('../config');

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
        // Get a fresh post object
        post(_, args) {
            if (!args.title || !args.body || !args.apikey) {
                throw config.errors.missing.some;
            }

            return post.writePost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Load one specific post
        getPost(_, args) {
            if (!args.id) {
                throw config.errors.missing.all;
            }

            return post.getPost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        updatePost(_, args) {
            if (!args.apikey || !args.id) {
                throw config.errors.missing.some;
            }

            return post.updatePost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Get all posts in date range
        getPostRange(_, args) {
            return post.getPostRange(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Get a specific number of posts
        getPostCount(_, args) {
            return post.getPostCount(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Return all posts
        getAllPosts() {
            return post.getAllPosts()
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        removePost(_, args) {
            if (!args.id && !args.apikey) {
                throw config.errors.missing.all;
            }

            return post.removePost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                })
        }
    },
    Post: {
        user(obj) {
            return user.getUser({id: obj.author})
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        }
    }
};

module.exports = {typeDef, query, resolver};
