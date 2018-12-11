const config = require('../config');

// Middleware function for GraphQL to validate ALL incoming arguments
// Simple regex tests are used for most, which can be changed in
// config.js

module.exports = async (resolve, root, args, context, info) => {
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

    if (args.apikey && !config.regexTests.apikey.test(args.apikey)) {
        throw config.errors.invalid.apikey;
    }

    if (args.title && !config.regexTests.title.test(args.title)) {
        throw config.errors.invalid.title;
    }

    if (args.id && !config.regexTests.id.test(args.id)) {
        throw config.errors.invalid.id;
    }

    if (args.permissions && args.permissions.length !== 0) {
        if (!args.permissions.includes('comment')
            && !args.permissions.includes('post')
            && !args.permissions.includes('administrate')) {
            throw config.errors.invalid.permissions;
        }
    }

    return await resolve(root, args, context, info);
};
