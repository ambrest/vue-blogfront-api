const user = require('../tools/user-tools');
const config = require('../config');
const comment = require('../tools/comment-tools');

const typeDef = `
    type Comment {
        id: String,
        author: String,
        user: User,
        body: String,
        timestamp: Float
    }
`;

const query = `
    comment(apikey: String!, postid: String!, body: String!): Comment,
    removeComment(apikey: String!, postid: String!, id: String!): Comment
`;

const resolver = {
    Query: {
        comment(_, args) {
            if (args.apikey && args.postid && args.body) {
                if (!config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }

                if (!config.regexTests.id.test(args.postid)) {
                    throw config.errors.invalid.id;
                }
            } else {
                throw config.errors.missing.all;
            }

            return comment.comment(args)
                .then(commentData => commentData)
                .catch(error => {
                    throw error;
                });
        },

        removeComment(_, args) {
            if (args.apikey && args.postid && args.id) {
                if (!config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }

                if (!config.regexTests.id.test(args.postid)) {
                    throw config.errors.invalid.id;
                }

                if (!config.regexTests.id.test(args.id)) {
                    throw config.errors.invalid.id;
                }
            } else {
                throw config.errors.missing.all;
            }

            return comment.removeComment(args)
                .then(commentData => commentData)
                .catch(error => {
                    throw error;
                });
        }
    },
    Comment: {
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
