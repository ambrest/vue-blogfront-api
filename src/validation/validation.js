const config = require('../../config/config');
const errors = require('../../config/errors');
const tests = require('../../config/regexTests');

// Middleware function for GraphQL to validate ALL incoming arguments
// Simple regex tests are used for most, which can be changed in
// config.json

module.exports = async (resolve, root, args, context, info) => {
    if (args.username && !tests.username.test(args.username)) {
        throw errors.invalid.username;
    }

    if (args.password && !tests.password.test(args.password)) {
        throw errors.invalid.password;
    }

    if (args.fullname && !tests.fullname.test(args.fullname)) {
        throw errors.invalid.fullname;
    }

    if (args.email && !tests.email.test(args.email)) {
        throw errors.invalid.email;
    }

    if (args.apikey && !tests.apikey.test(args.apikey)) {
        throw errors.invalid.apikey;
    }

    if (args.title && !tests.title.test(args.title)) {
        throw errors.invalid.title;
    }

    if (args.id && !tests.id.test(args.id)) {
        throw errors.invalid.id;
    }

    if (args.permissions && args.permissions.length !== 0) {
        if (!args.permissions.includes('comment')
            && !args.permissions.includes('post')
            && !args.permissions.includes('administrate')) {
            throw errors.invalid.permissions;
        }
    }

    return await resolve(root, args, context, info);
};
