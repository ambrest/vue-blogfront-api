const errors = require('../config/errors');

const tests = {
    username: v => typeof v === 'string' && /^[\w\d]{2,15}$/.test(v),
    password: v => typeof v === 'string' && /^(.){6,36}$/.test(v),
    apikey: v => typeof v === 'string' && /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/.test(v),
    id: v => typeof v === 'string' && /^_[a-z\d]{9}$/.test(v),
    fullname: v => typeof v === 'string' && /^(.){1,20}/.test(v),
    email: v => typeof v === 'string' && /^[\w\d-_]{1,100}@[\w\d-_]{1,100}\.[\w]{2,10}$/.test(v),
    title: v => typeof v === 'string' && /^(.){1,200}$/.test(v),
    body: v => typeof v === 'string' && v.trim().length,
    about: v => typeof v === 'string' && v.length < 200,
    tags: tags => Array.isArray(tags) && tags.every((tag, i) => typeof tag === 'string' && tags.lastIndexOf(tag) === i && tag),
    permissions: perms => Array.isArray(perms) && (!perms.length || perms.every(v => v === 'comment' || v === 'post' || v === 'administrate'))
};

// Middleware function for GraphQL to validate incoming arguments
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
