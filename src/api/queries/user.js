const user = require('../../db/user');
const errors = require('../../../config/errors');

// Definition of the post class for GraphQL
const typeDef = `
    type User {
        username: String,
        apikey: String,
        id: String,
        fullname: String,
        permissions: [String],
        profilePicture: String,
        email: String,
        about: String,
        deactivated: Boolean
    }
`;

// Definition of the post functions for GraphQL
/**
 * user: get basic user information
 * logout: delete a user's apikey
 * updateUser: update an existing user
 * getAllUsers: get all existing users
 * register: register a new user
 * login: get a new apikey for a user
 * recoverPassword: send user an email to recover their password
 * @type {string}
 */
const query = `
    user(username: String, id: String, apikey: String): User,
    logout(apikey: String!): Boolean,
    updateUser(apikey: String!, id: String!, permissions: [String], password: String, fullname: String, email: String, deactivated: Boolean, about: String, profilePicture: String): User,
    getAllUsers(apikey: String!): [User],
    register(username: String!, password: String!, fullname: String!, email: String!): User,
    login(username: String, password: String, apikey: String): User,
    recoverPassword(email: String!): Boolean
`;

const resolver = {

    Query: {
        async user(_, args) {

            // Make sure all required arguments are present
            if (!args.username && !args.id && !args.apikey) {
                throw errors.missing.all;
            }

            // Perform action and return promise
            return user.getUser(args);
        },

        async getAllUsers(_, args) {

            // Perform action and return promise
            return user.getAllUsers(args);
        },

        async register(_, args) {

            // Perform action and return promise
            return user.registerUser(args);
        },

        async login(_, args) {

            // Make sure all required arguments are present
            if ((!args.username && !args.password) && !args.apikey) {
                throw errors.missing.all;
            }

            // Perform action and return promise
            return user.loginUser(args);
        },

        async updateUser(_, args) {

            // Perform action and return promise
            return user.updateUser(args);
        },

        async logout(_, args) {

            // Perform action and return promise
            return user.logout(args);
        },

        async recoverPassword(_, args) {

            // Perform action and return promise
            return user.recoverPassword(args);
        }
    }
};

module.exports = {typeDef, query, resolver};
