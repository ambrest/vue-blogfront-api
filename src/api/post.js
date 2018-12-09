const post = require('../tools/post-tools');
const user = require('../tools/user-tools');
const config = require('../config');

const typeDef = `
    type Post {
        id: String,
        title: String,
        author: String,
        user: User,
        timestamp: Int,
        
        body: String
    }
`;

const query = `
    post(apikey: String!, title: String!, body: String!): Post,
    updatePost(apikey: String!, id: String!, title: String, body: String): Post,
    getPost(id: String!): Post,
    getPostRange(timestart: Int!, timeend: Int!): [Post],
    getPostCount(count: Int!): [Post],
    getAllPosts: [Post]
`;

const resolver = {
    Query: {
        // Get a fresh post object
        post(_, args) {
            if (args.title || args.body || args.apikey) {
                if (args.title && !config.regexTests.title.test(args.title)) {
                    throw config.errors.invalid.title;
                }

                // TODO: Script injection?

                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }
            } else {
                throw config.errors.missing.all;
            }

            return post.writePost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Load one specific post
        getPost(_, args) {
            if (args.id) {
                if (args.id && !config.regexTests.id.test(args.id)) {
                    throw config.errors.invalid.id;
                }
            } else {
                throw config.errors.missing.all;
            }

            return post.getPost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        updatePost(_, args) {
            if (args.title || args.body || args.apikey || args.id) {
                if (args.id && !config.regexTests.id.test(args.id)) {
                    throw config.errors.invalid.id;
                }

                if (args.title && !config.regexTests.title.test(args.title)) {
                    throw config.errors.invalid.title;
                }

                // TODO: Script injection?

                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }
            } else {
                throw config.errors.missing.all;
            }

            return post.updatePost(args)
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
        },

        // Get all posts in date range
        getPostRange(_, args) {

        },

        // Get a specific number of posts
        getPostCount(_, args) {

        },

        // Return all posts
        getAllPosts() {
            return post.getAllPosts()
                .then(postData => postData)
                .catch(error => {
                    throw error;
                });
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
