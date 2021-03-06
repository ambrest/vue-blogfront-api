const {userModel} = require('./models');
const profilePictureTransformer = require('./profilePictureTransformer');
const auth = require('../auth');
const bcrypt = require('bcrypt');
const config = require('../../config/config');
const errors = require('../../config/errors');
const mail = require('../mail/mail');

// Class for constructing user objects
class User {
    constructor(username, fullname, email, permissions, password) {
        const key = new auth.ApiKey();

        this.username = username;
        this.apikey = key.key;
        this.apikeys = [key];
        this.id = auth.uniqueId();
        this.fullname = fullname;
        this.permissions = permissions;
        this.email = email;
        this.hash = bcrypt.hashSync(password, config.auth.saltRounds);
        this.emailVerified = false;

        if (config.server.emailVerification) {
            this.deactivated = true;

            mail.sendVerification(this);
        } else {
            this.deactivated = false;
        }

        const userFile = new userModel({
            username: this.username,
            apikeys: this.apikeys,
            id: this.id,
            fullname: this.fullname,
            permissions: this.permissions,
            email: this.email,

            hash: this.hash,

            deactivated: this.deactivated,
            emailVerified: this.emailVerified
        });

        userFile.save();
    }
}

module.exports = {

    /**
     * Updates selected user with the given properties. Only changes what is given.
     * @param apikey - API key of the user updating the selected user. Must either be the same user or an admin.
     * @param id - ID of the user to update
     * @param fullname - OPTIONAL new full name
     * @param permissions - OPTIONAL new permissions. Must be an admin to change this.
     * @param email - OPTIONAL new email
     * @param password - OPTIONAL new password (will automatically be hashed)
     * @param deactivated - OPTIONAL deactivate user
     * @param about - OPTIONAL about text
     * @param profilePicture - OPTIONAL base64 encoded profile picture
     * @returns {Promise} - the updated user
     */
    async updateUser({apikey, id, fullname, permissions, email, password, deactivated, about, profilePicture}) {
        // User to update
        let user;

        // Resolve user
        return this.findUser({id}).then(resolvedUser => {
            user = resolvedUser;

            // Resolve calling user
            return this.findUser({apikey});
        }).then(async updatingUser => {

            // Make sure that the calling user is either the user being updated or an admin
            if (user.id === updatingUser.id || updatingUser.permissions.includes('administrate')) {

                // Check if permissions are being updated
                if (permissions) {
                    user.permissions = permissions;
                }

                // Change name
                if (fullname) {
                    user.fullname = fullname;
                }

                // Change email
                if (email) {
                    user.email = email;
                }

                // Change deactivated. Here, typeof must be used as deactivated is a boolean itself.
                if (typeof deactivated === 'boolean') {
                    user.deactivated = deactivated;
                }

                // Change password
                if (password) {
                    user.hash = bcrypt.hashSync(password, config.auth.saltRounds);
                }

                // Update about
                if (about !== undefined) {
                    user.about = about;
                }

                // Update about
                if (profilePicture) {
                    user.profilePicture = await profilePictureTransformer(profilePicture);
                }

                // Commit changes
                user.save();
                return user;
            } else {
                throw errors.user.sufficientRights;
            }
        });
    },

    /**
     * INTERNAL ONLY! Finds a user from the database and returns ALL user properties.
     * @param username - OPTIONAL gets user by their username
     * @param id - OPTIONAL gets user by their id
     * @param apikey - OPTIONAL gets user by their API key. If the API key is expired, USER NOT FOUND is thrown
     * @param email - OPTIONAL gets user by their VERIFIED email address
     * @returns {Promise} - user that is searched
     */
    async findUser({username, id, apikey, email}) {

        // Use some sweet ES6 trickery to build a query with only given args
        const queryOptions = {
            ...(username ? {username} : {}),
            ...(id ? {id} : {}),
            ...(apikey ? {
                apikeys: {
                    $elemMatch: {
                        key: apikey, // Match key
                        expiry: {
                            $gte: Date.now() // Make sure that the API key is not expired
                        }
                    }
                }
            } : {}),
            ...(email ? {email} : {})
        };

        // Resolve user
        return userModel.findOne(queryOptions).exec().then(user => {
            if (user) {
                return user;
            } else {
                throw errors.user.notFound;
            }
        });
    },

    /**
     * Gets a user by their username or id. One is required.
     * @param username - OPTIONAL username of the user to get
     * @param id - OPTIONAL id of the user to get
     * @param apikey - OPTIONAL API key of the calling user, used to get private information of the user if the calling user
     *                  is the user requested or is an admin.
     * @returns {Promise} - the requested user
     */
    async getUser({username, id, apikey}) {

        // Resolve user being searched
        return this.findUser({username, id}).then(user => {

            // NEVER send the API key or Hash of a user
            user.apikey = null;
            user.hash = null;

            // Check API key if provided
            if (apikey) {

                // Resolve calling user
                return this.findUser({apikey}).then(callingUser => {

                    // Check permissions of calling user
                    if (!(callingUser.id === user.id || callingUser.permissions.includes('administrate')) || callingUser.deactivated) {
                        user.email = null;
                    }

                    return user;
                });

            } else {
                user.email = null;
            }

            return user;
        });
    },

    /**
     * Register a new user on the server
     * @param username - username of the new user
     * @param password - new user's password
     * @param fullname - new user's name
     * @param email - new user's email address
     * @returns {Promise} - the new user
     */
    async registerUser({username, password, fullname, email}) {

        // Check to see if the user already exists and throw error if so
        return this.findUser({username})
            .then(() => {
                throw errors.user.alreadyExists;
            })

            // Register a new user if none is found
            .catch(error => {

                // Make sure that we're not catching the error above
                if (error !== errors.user.alreadyExists) {

                    // Register a new user and return it
                    return new User(username, fullname, email, ['comment'], password);
                } else {
                    throw error;
                }
            });
    },

    /**
     * Log in a user with either username/password or apikey. If username/password is used, a new API key is generated
     * @param username - OPTIONAL username of the user to login
     * @param password - OPTIONAL password of the user to login
     * @param apikey - OPTIONAL API key of the user to login
     * @returns {Promise} - the user
     */
    async loginUser({username, password, apikey}) {

        // Resolve user by either username or API key
        return this.findUser(apikey ? ({apikey}) : ({username})).then(user => {

            // Make sure user isn't deactivated
            if (!user.deactivated) {

                // If not using a valid API key, check password
                if (!user.apikeys.find(key => (key.key === apikey && key.expiry > Date.now()))) {

                    // Compare password hash
                    if (!bcrypt.compareSync(password, user.hash)) {
                        throw errors.user.wrongPassword;
                    }
                }

                // Generate a new API key if one wasn't given
                if (!apikey) {
                    const newApikey = new auth.ApiKey();

                    user.apikey = newApikey.key;
                    user.apikeys.push(newApikey);

                    user.save();
                } else {
                    user.apikey = apikey;
                }

                return user;
            } else {
                throw errors.user.deactivated;
            }
        });
    },

    /**
     * Get all users that have registered. Must be an admin to do this.
     * @param apikey - API key of the admin calling
     * @returns {Promise} - an array of all users EXCEPT the calling user
     */
    async getAllUsers({apikey}) {

        // Resolve calling user
        return this.findUser({apikey}).then(user => {

            // Check user permissions. Must be admin
            if (user.permissions.includes('administrate')) {

                // Resolve all users
                return userModel.find({}).exec().then(userDocs => {
                    if (userDocs) {
                        return userDocs.filter(doc => {
                            delete doc.apikeys;
                            return doc.id !== user.id;
                        });
                    } else {
                        throw errors.post.notFound;
                    }
                });

            } else {
                throw errors.user.sufficientRights;
            }
        });
    },

    /**
     * Set the API key of a user to expire immediately
     * @param apikey - API key of the user to logout
     * @returns {Promise} - boolean always true
     */
    async logout({apikey}) {

        // Resolve calling user
        return this.findUser({apikey}).then(user => {

            // Get their apikey
            const key = user.apikeys.find(key => key.key === apikey);

            // Expire immediately
            key.expiry = Date.now();

            user.save();

            return true;
        });
    },

    /**
     * Validates a user's email address with an API key
     * @param apikey - apikey sent to the user via email
     */
    async verifyUser(apikey) {

        // Resolve user
        return this.findUser({apikey}).then(user => {
            if (!user.emailVerified) {

                // Set user properties
                user.deactivated = false;
                user.emailVerified = true;

                // Save him
                user.save();

                // Invalidate the api key used to verify the email address
                // TODO Does this work?
                this.logout({apikey});
            }
        });
    },

    /**
     * Send user a password recovery email if their email address is verified
     * @param email - email of the user to send recovery to
     */
    async recoverPassword({email}) {

        // Resolve user
        return this.findUser({email}).then(user => {
            if (user.emailVerified && !user.deactivated) {
                user.apikey = new auth.ApiKey();
                user.apikeys.push(user.apikey);

                user.save();

                mail.recoverPassword(user);

                return true;
            } else {
                throw errors.user.deactivated;
            }
        });
    },

    User
};
