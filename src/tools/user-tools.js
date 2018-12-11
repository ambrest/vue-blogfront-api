const database = require('./database');
const auth = require('./auth');
const bcrypt = require('bcrypt');
const config = require('../config');

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

        this.deactivated = false;

        const userFile = new database.userModel({
            username: this.username,
            apikeys: this.apikeys,
            id: this.id,
            fullname: this.fullname,
            permissions: this.permissions,
            email: this.email,

            hash: this.hash,

            deactivated: this.deactivated
        });

        userFile.save();
    }
}

module.exports = {
    updateUser({apikey, id, fullname, permissions, email, password, deactivated}) {
        let user;

        return this.findUser({id}).then(resolvedUser => {

            user = resolvedUser;

            return this.findUser({apikey})
        }).then(updatingUser => {
            if (user.id === updatingUser.id || updatingUser.permissions.includes('administrate')) {
                if (permissions) {
                    if (updatingUser.permissions.includes('administrate')) {
                        user.permissions = permissions;
                    } else {
                        throw config.errors.user.sufficientRights
                    }
                }
                if (fullname) {
                    user.fullname = fullname;
                }
                if (email) {
                    user.email = email;
                }
                if (typeof (deactivated) === 'boolean') {
                    user.deactivated = deactivated;
                }
                if (password) {
                    user.hash = bcrypt.hashSync(password, config.auth.saltRounds);
                }

                user.save();

                return user;
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    findUser({username, id, apikey}) {
        return new Promise(async (resolve, reject) => {
            if (username) {
                await database.userModel.findOne({username}, (error, user) => {
                    if (error) {
                        return reject(error);
                    } else {
                        if (user) {
                            return resolve(user);
                        } else {
                            return reject(config.errors.user.notFound);
                        }
                    }
                });
            } else if (apikey) {
                await database.userModel.findOne(
                    {
                        apikeys: {
                            $elemMatch: {
                                key: apikey,
                                expiry: {
                                    $gte: Date.now()
                                }
                            }
                        }
                    }, (error, user) => {
                        if (error) {
                            return reject(error);
                        } else {
                            if (user) {
                                return resolve(user);
                            } else {
                                return reject(config.errors.user.notFound);
                            }
                        }
                    });
            } else if (id) {
                await database.userModel.findOne({id}, (error, user) => {
                    if (error) {
                        return reject(error);
                    } else {
                        if (user) {
                            return resolve(user);
                        } else {
                            return reject(config.errors.user.notFound);
                        }
                    }
                });
            }
        });
    },

    getUser({username, id, apikey}) {
        return this.findUser({username, id}).then(user => {
            if (apikey) {
                this.findUser({apikey}).then(callingUser => {
                    if (!(callingUser.id === user.id || callingUser.permissions.includes('administrate')) || callingUser.deactivated) {
                        throw config.errors.user.sufficientRights;
                    }
                });
            } else {
                user.email = null;
                user.apikey = null;
                user.hash = null;
            }

            return user;
        })
    },

    registerUser({username, password, fullname, email}) {
        return this.findUser({username})
            .then(() => {
                throw config.errors.user.alreadyExists;
            })
            .catch(error => {
                if (error !== config.errors.user.alreadyExists) {
                    return new User(username, fullname, email, ['comment'], password);
                } else {
                    throw error;
                }
            });
    },

    loginUser({username, password, apikey}) {
        return this.findUser(apikey ? ({apikey}) : ({username})).then(user => {
            if (!user.deactivated) {
                // Check password
                if (!user.apikeys.find(key => (key.key === apikey && key.expiry > Date.now()))) {
                    if (!bcrypt.compareSync(password, user.hash)) {
                        throw config.errors.user.wrongPassword;
                    }
                }

                if (!apikey) {
                    const newApikey = new auth.ApiKey();

                    user.apikey = newApikey.key;
                    user.apikeys.push(newApikey);

                    user.save();
                } else {
                    user.apikey = apikey;
                }

                return user
            } else {
                throw config.errors.user.deactivated;
            }
        })
    }
    ,

    getAllUsers({apikey}) {
        return this.findUser({apikey}).then(user => {
            if (user.permissions.includes('administrate')) {
                database.userModel.find({}, (error, userDocs) => {
                    if (error) {
                        throw error;
                    }

                    if (userDocs) {
                        userDocs.forEach((doc) => {
                            doc.apikeys = null;
                        });

                        return userDocs;
                    } else {
                        throw config.errors.post.notFound;
                    }
                });
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    logout({apikey}) {
        // TODO: Implement
    }
}
;
