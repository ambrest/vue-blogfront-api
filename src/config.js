module.exports = {
    regexTests: {
        username: /^[\w\d]{2,15}$/,
        password: /^(.){4,20}$/,
        apikey: /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/,
        id: /^_[a-z\d]{9}$/,
        fullname: /^[a-zA-Z]{1,20} [a-zA-Z]{1,20}$/,
        email: /^[\w\d]{1,20}@[\w\d]{1,20}\.[\w]{2,10}$/,
        title: /^[\w\d .,/+\-!?:;]{5,50}$/
    },

    errors: {
        invalid: {
            username: "Your username is invalid.",
            id: "Your id is invalid.",
            apikey: "Your apikey is invalid.",
            password: "Your password is invalid.",
            fullname: "Your name is invalid.",
            email: "Your email address is invalid",
            permission: "Your permissions are invalid",

            title: "Your title is invalid.",
            body: "Your body is invalid.",

            tooManyArgs: "Too many arguments"
        },

        missing: {
            all: "You must provide arguments."
        },

        user: {
            sufficientRights: "User does not have sufficient rights to perform this action.",
            notFound: "User was not found.",
            alreadyExists: "User already exists.",
            deactivated: "User is deactivated.",
            wrongPassword: "Password is wrong."
        },

        post: {
            notFound: "Post was not found."
        }
    }
};
