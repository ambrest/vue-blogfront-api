const errors = require('../../config/errors');

const tests = {
    username: v => /^[\w\d]{2,15}$/.test(v),
    password: v => /^(.){4,20}$/.test(v),
    apikey: v => /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/.test(v),
    id: v => /^_[a-z\d]{9}$/.test(v),
    fullname: v => /^(.){1,20}/.test(v),
    email: v => /^[\w\d-_]{1,20}@[\w\d-_]{1,20}\.[\w]{2,10}$/.test(v),
    title: v => /^(.){1,200}$/.test(v),
    body: v => v.length > 100,
    tags: tags => tags.every((tag, i) => typeof tag === 'string' && tags.lastIndexOf(tag) === i && tag),
    permissions: perms => !perms.length || perms.every(v => v === 'comment' || v === 'post' || v === 'administrate')
};

// Middleware function for GraphQL to validate ALL incoming arguments
// Simple regex tests are used for most, which can be changed in
// config.json
module.exports = async (resolve, root, args, context, info) => {

    for (const [key, value] of Object.entries(args)) {
        const testFn = tests[key];

        if (testFn && !testFn(value)) {
            const errorMsg = errors.invalid[key];

            if (errorMsg) {
                throw errorMsg;
            } else {

                /* eslint-disable no-console */
                console.warn(`Undefined error message for ${key}`);
                throw 'Unknown error.';
            }
        }
    }

    return await resolve(root, args, context, info);
};
