module.exports = {
    info: {
        author: 'Ambrest Designs LLC',
        version: 1.0,
        blogTitle: 'Ambrest Blog'
    },

    server: {
        port: 4000,
        startingMessage: 'Server started on port 4000...'
    },

    mongodb: {
        url: 'mongodb://localhost/blog'
    },

    auth: {
        apikeyExpiry: (86400000 * 15), // 15 Days
        saltRounds: 10
    },

    regexTests: {
        username: /^[\w\d]{2,15}$/,
        password: /^(.){4,20}$/,
        apikey: /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/,
        id: /^_[a-z\d]{9}$/,
        fullname: /^[a-zA-Z]{1,20} [a-zA-Z]{1,20}$/,
        email: /^[\w\d]{1,20}@[\w\d]{1,20}\.[\w]{2,10}$/,
        title: /^[\w\d '".,/+\-!?:;]{5,200}$/
    },

    errors: {
        invalid: {
            username: 'Your username is invalid.',
            id: 'Your id is invalid.',
            apikey: 'Your apikey is invalid.',
            password: 'Your password is invalid.',
            fullname: 'Your name is invalid.',
            email: 'Your email address is invalid',
            permission: 'Your permissions are invalid',

            title: 'Your title is invalid.',
            body: 'Your body is invalid.',

            tooManyArgs: 'Too many arguments'
        },

        missing: {
            all: 'You must provide arguments.',
            some: 'You have not provided all required arguments'
        },

        user: {
            sufficientRights: 'User does not have sufficient rights to perform this action.',
            notFound: 'User was not found.',
            alreadyExists: 'User already exists.',
            deactivated: 'User is deactivated.',
            wrongPassword: 'Password is wrong.'
        },

        post: {
            notFound: 'Post was not found.'
        },

        comment: {
            notFound: 'Comment was not found.'
        }
    }
};
