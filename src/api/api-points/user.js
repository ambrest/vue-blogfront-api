const user = require('../../tools/user-tools');
const config = require('../../config');

// Definition of the post class for GraphQL
const typeDef = `
    type User {
        username: String,
        apikey: String,
        id: String,
        fullname: String,
        permissions: [String],
        email: String,
        
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
 * @type {string}
 */
const query = `
    user(username: String, id: String, apikey: String): User,
    logout(apikey: String!): Boolean,
    updateUser(apikey: String!, id: String!, permissions: [String], password: String, fullname: String, email: String, deactivated: Boolean): User,
    getAllUsers(apikey: String!): [User],
    register(username: String!, password: String!, fullname: String!, email: String!): User,
    login(username: String, password: String, apikey: String): User
`;

const resolver = {
    Query: {
        user(obj, args) {
            // Make sure all required arguments are present
            if (!args.username && !args.id && !args.apikey) {
                throw config.errors.missing.all;
            }

            // Perform action and return promise
            return user.getUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        getAllUsers(_, args) {
            // Perform action and return promise
            return user.getAllUsers(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        register(obj, args) {
            // Make sure all required arguments are present
            if (!args.username || !args.password || !args.fullname || !args.email) {
                throw config.errors.missing.some;
            }

            // Perform action and return promise
            return user.registerUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        login(obj, args) {
            // Make sure all required arguments are present
            if ((!args.username && !args.password) && !args.apikey) {
                throw config.errors.missing.all;
            }

            // Perform action and return promise
            return user.loginUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        updateUser(obj, args) {
            // Make sure all required arguments are present
            if (!args.apikey || !args.id) {
                throw config.errors.missing.some;
            }

            // Perform action and return promise
            return user.updateUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        logout(_, args) {
            // Make sure all required arguments are present
            if (!args.apikey) {
                throw config.errors.missing.all;
            }

            // Perform action and return promise
            return user.logout(args)
                .then(data => data)
                .catch(error => {
                    throw error;
                });
        }
    }
};

module.exports = {typeDef, query, resolver};
