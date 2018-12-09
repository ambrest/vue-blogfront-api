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
    updateUser(apikey: String!, id: String!, permissions: [String], password: String, fullname: String, email: String): User,
    getAllUsers(apikey: String!): [User],
    register(username: String!, password: String!, fullname: String!, email: String!): User,
    login(username: String, password: String, apikey: String): User
`;

const resolver = {
    Query: {
        user(obj, args) {
            if (args.username || args.id || args.apikey) {
                if (args.username && !config.regexTests.username.test(args.username)) {
                    throw config.errors.invalid.username;
                }

                if (args.id && !config.regexTests.id.test(args.id)) {
                    throw config.errors.invalid.id;
                }

                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }
            } else {
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
            if (args.username || args.password || args.fullname || args.email) {
                if (args.username && !config.regexTests.username.test(args.username)) {
                    throw config.errors.invalid.username;
                }

                if (args.password && !config.regexTests.password.test(args.password)) {
                    throw config.errors.invalid.password;
                }

                if (args.fullname && !config.regexTests.fullname.test(args.fullname)) {
                    throw config.errors.invalid.fullname;
                }

                if (args.email && !config.regexTests.email.test(args.email)) {
                    throw config.errors.invalid.email;
                }
            } else {
                throw config.errors.missing.all;
            }

            return user.registerUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },
        login(obj, args) {
            if (args.username || args.password || args.apikey) {
                if (args.username && !config.regexTests.username.test(args.username)) {
                    throw config.errors.invalid.username;
                }

                if (args.password && !config.regexTests.password.test(args.password)) {
                    throw config.errors.invalid.password;
                }

                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }

                if (args.username && args.apikey) {
                    throw config.errors.invalid.tooManyArgs;
                }
            } else {
                throw config.errors.missing.all;
            }

            return user.loginUser(args)
                .then(userData => userData)
                .catch(error => {
                    throw error;
                });
        },
        updateUser(obj, args) {
            if (args.apikey || args.id || args.fullname || args.email || args.password || args.permissions) {
                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }

                if (args.permissions && args.permissions.length !== 0) {
                    if (!args.permissions.includes('comment')
                        && !args.permissions.includes('post')
                        && !args.permissions.includes('administrate'))
                        throw config.errors.invalid.permissions;
                }

                if (args.id && !config.regexTests.id.test(args.id)) {
                    throw config.errors.invalid.id;
                }

                if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
                    throw config.errors.invalid.apikey;
                }

                if (args.password && !config.regexTests.password.test(args.password)) {
                    throw config.errors.invalid.password;
                }

                if (args.fullname && !config.regexTests.fullname.test(args.fullname)) {
                    throw config.errors.invalid.fullname;
                }

                if (args.email && !config.regexTests.email.test(args.email)) {
                    throw config.errors.invalid.email;
                }
            } else {
                throw config.errors.missing.all;
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
