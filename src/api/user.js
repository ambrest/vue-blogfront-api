const user = require('../tools/usertools.js');

const typeDef = `
    type User {
        username: String,
        apikey: String,
        userid: String,
        fullname: String,
        permissions: [String],
        email: String,
        canPost: Boolean,
        
        deactivated: Boolean,
        
        error: Boolean,
        errorMessage: String
    }
`;

const query = `
    user(username: String, userid: String, apikey: String): User,
    getAllUsers(apikey: String!): [User],
    register(username: String!, password: String!, fullname: String!, email: String!): User,
    login(username: String, password: String, apikey: String): User
`;

const resolver = {
    Query: {
        user: (obj, args) => {
            return user.getUser(args)
                .then(userData => userData);
        },
        getAllUsers: () => {

        },
        register: (obj, args) => {
            return user.registerUser(args)
                .then(userData => userData)
        },
        login: (obj, args) => {
            return user.loginUser(args)
                .then(userData => userData)
        }
    }
};

module.exports = { typeDef, query, resolver };
