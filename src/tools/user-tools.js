const database = require('./database');
const auth = require('./auth');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const config = require('../config');

class User {
    constructor() {
        this.username = null;
        this.apikey = null;
        this.id = null;
        this.fullname = null;
        this.permissions = null;
        this.email = null;
        this.hash = null;

        this.deactivated = false;
    }

    // PRIVATE

    save() {
        const userFile = new database.userModel({
            username: this.username,
            apikey: this.apikey,
            id: this.id,
            fullname: this.fullname,
            permissions: this.permissions,
            email: this.email,

            hash: this.hash,

            deactivated: this.deactivated
        });

        userFile.save();
    }

    // PUBLIC

    // Returns true if user has sufficient privilege, false if not
    canPost() {
        return this.permissions.includes('post');
    }

    canAdministrate() {
        return this.permissions.includes('administrate');
    }

    canComment() {
        return this.permissions.includes('comment');
    }
}

function updateUser({apikey, id, fullname, permissions, email, password, deactivated}) {
    return new Promise(async (resolve, reject) => {
        const user = await findUser({id})
            .catch(reject);

        const updatingUser = await loginUser({apikey})
            .catch(reject);

        if (user.apikey === updatingUser.apikey || updatingUser.canAdministrate()) {
            if (fullname) {
                user.fullname = fullname;
            }
            if (permissions) {
                user.permissions = permissions;
            }
            if (email) {
                user.email = email;
            }
            if (deactivated) {
                user.deactivated = deactivated;
            }
            if (password) {
                user.hash = bcrypt.hashSync(password, 10);
            }

            user.save();

            resolve(user);
        } else {
            reject(config.errors.user.sufficientRights);
        }
    });
}

function findUser({username, id, apikey}) {
    return new Promise(async (resolve, reject) => {
        let user = new User();

        if (username) {
            await database.userModel.findOne({username}, (error, usr) => user = usr);
        } else if (apikey) {
            await database.userModel.findOne({apikey}, (error, usr) => user = usr);
        } else if (id) {
            await database.userModel.findOne({id}, (error, usr) => user = usr);
        }

        // Was the user found?
        if (!user || !user.id) {
            reject(config.errors.user.notFound);
        } else {
            resolve(user);
        }
    });
}

function getUser({username, id, apikey}) {
    return new Promise(async (resolve, reject) => {
        let user = await findUser({username, id})
            .catch(reject);

        if (user) {
            if (apikey) {
                const callingUser = await loginUser({apikey})
                    .catch(reject);

                if (!(apikey === callingUser.apikey || callingUser.canAdministrate()) || callingUser.deactivated) {
                    reject(config.errors.user.sufficientRights);
                }
            } else {
                user.email = null;
                user.apikey = null;
                user.hash = null;
            }

            resolve(user);
        } else {
            reject(config.errors.user.notFound);
        }
    });
}

function registerUser({username, password, fullname, email}) {
    return new Promise(async (resolve, reject) => {
        const user = new User();

        await findUser({username})
            .then(() => {
                reject(config.errors.user.alreadyExists);
            })
            .catch(() => {
                // Populate User values
                user.username = username;
                user.fullname = fullname;
                user.email = email;

                user.permissions = ['comment'];

                user.id = auth.uniqueId();
                user.apikey = uuidv4();

                user.hash = bcrypt.hashSync(password, 10);

                user.save();

                resolve(user);
            });
    });
}

function loginUser({username, password, apikey}) {
    return new Promise(async (resolve, reject) => {
        const user = new User();

        const userSearch = await findUser(apikey ? {apikey} : {username})
            .catch(reject);

        if (userSearch) {
            if (!userSearch.deactivated) {
                // Check password
                if (userSearch.apikey !== apikey) {
                    if (!bcrypt.compareSync(password, userSearch.hash)) {
                        reject(config.errors.user.wrongPassword);
                    }
                }

                // Populate User values
                user.username = userSearch.username;
                user.fullname = userSearch.fullname;
                user.email = userSearch.email;

                user.id = userSearch.id;
                user.apikey = userSearch.apikey;

                user.permissions = userSearch.permissions;

                resolve(user);
            } else {
                reject(config.errors.user.deactivated);
            }
        } else {
            reject(config.errors.user.notFound);
        }
    });
}

module.exports = {User, registerUser, loginUser, getUser, updateUser};
