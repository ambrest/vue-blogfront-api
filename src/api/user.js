const user = require('../tools/user-tools');
const config = require('../config');

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

const query = `
    user(username: String, id: String, apikey: String): User,
    logout(apikey: String!): User,
    updateUser(apikey: String!, id: String!, permissions: [String], password: String, fullname: String, email: String, deactivated: Boolean): User,
    getAllUsers(apikey: String!): [User],
    register(username: String!, password: String!, fullname: String!, email: String!): User,
    login(username: String, password: String, apikey: String): User
`;

const resolver = {
    Query: {
        user(obj, args) {
            if (!args.username && !args.id && !args.apikey) {
                throw config.errors.missing.all;
            }

            return user.getUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        getAllUsers(_, args) {
            return user.getAllUsers(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        register(obj, args) {
            if (!args.username || !args.password || !args.fullname || !args.email) {
                throw config.errors.missing.some;
            }

            return user.registerUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        login(obj, args) {
            if ((!args.username && !args.password) && !args.apikey) {
                throw config.errors.missing.all;
            }

            return user.loginUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },

        updateUser(obj, args) {
            if (!args.apikey || !args.id) {
                throw config.errors.missing.some;
            }

            return user.updateUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error
                });
        }
    }
};

module.exports = {typeDef, query, resolver};
