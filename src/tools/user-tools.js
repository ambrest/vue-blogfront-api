const database = require('./database');
const auth = require('./auth');
const bcrypt = require('bcrypt');
const config = require('../config');

class User {
    constructor(username, fullname, email, permissions) {
        this.username = username;
        this.apikey = null;
        this.apikeys = [];
        this.id = null;
        this.fullname = fullname;
        this.permissions = permissions;
        this.email = email;
        this.hash = null;

        this.deactivated = false;
    }
}

function updateUser({apikey, id, fullname, permissions, email, password, deactivated}) {
    return new Promise(async (resolve, reject) => {
        findUser({id})
            .then(user => {
                findUser({apikey})
                    .then(updatingUser => {
                        if (user.id === updatingUser.id || updatingUser.permissions.includes('administrate')) {
                            if (permissions) {
                                if (updatingUser.permissions.includes('administrate')) {
                                    user.permissions = permissions;
                                } else {
                                    return reject(config.errors.user.sufficientRights);
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

                            return resolve(user);
                        } else {
                            return reject(config.errors.user.sufficientRights);
                        }
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
}

function findUser({username, id, apikey}) {
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
}

function getUser({username, id, apikey}) {
    return new Promise(async (resolve, reject) => {
        findUser({username, id})
            .then(async user => {
                if (apikey) {
                    const callingUser = await findUser({apikey})
                        .catch(reject);

                    if (!(callingUser.id === user.id || callingUser.permissions.includes('administrate')) || callingUser.deactivated) {
                        return reject(config.errors.user.sufficientRights);
                    }
                } else {
                    user.email = null;
                    user.apikey = null;
                    user.hash = null;
                }

                return resolve(user);
            })
            .catch(reject);
    });
}

function registerUser({username, password, fullname, email}) {
    return new Promise(async (resolve, reject) => {
        findUser({username})
            .then(() => {
                return reject(config.errors.user.alreadyExists);
            })
            .catch(() => {
                // Populate User values
                const user = new User(username, fullname, email, ['comment']);

                user.id = auth.uniqueId();

                const apikey = new auth.ApiKey();

                user.apikey = apikey.key;
                user.apikeys.push(apikey);

                user.hash = bcrypt.hashSync(password, config.auth.saltRounds);

                const userFile = new database.userModel({
                    username: user.username,
                    apikeys: user.apikeys,
                    id: user.id,
                    fullname: user.fullname,
                    permissions: user.permissions,
                    email: user.email,

                    hash: user.hash,

                    deactivated: user.deactivated
                });

                userFile.save();

                return resolve(user);
            });
    });
}

function loginUser({username, password, apikey}) {
    return new Promise(async (resolve, reject) => {
        findUser(apikey ? ({apikey}) : ({username}))
            .then(user => {
                if (!user.deactivated) {
                    // Check password
                    if (!user.apikeys.find(key => (key.key === apikey && key.expiry > Date.now()))) {
                        if (!bcrypt.compareSync(password, user.hash)) {
                            return reject(config.errors.user.wrongPassword);
                        }
                    }

                    if(!apikey) {
                        const newApikey = new auth.ApiKey();

                        user.apikey = newApikey.key;
                        user.apikeys.push(newApikey);

                        user.save();
                    } else {
                        user.apikey = apikey;
                    }

                    return resolve(user);
                } else {
                    return reject(config.errors.user.deactivated);
                }
            })
            .catch(reject);
    });
}

function getAllUsers({apikey}) {
    return new Promise(async (resolve, reject) => {
        findUser({apikey})
            .then(user => {
                if (user.permissions.includes('administrate')) {
                    database.userModel.find({}, (error, userDocs) => {
                        if (error) {
                            return reject(error);
                        }

                        if (userDocs) {
                            userDocs.forEach((doc) => {
                                doc.apikeys = null;
                            });
                            resolve(userDocs);
                        } else {
                            reject(config.errors.post.notFound);
                        }
                    });
                } else {
                    reject(config.errors.user.sufficientRights);
                }
            })
            .catch(reject);
    });
}

function logoutUser({apikey}) {
    // TODO: Implement
}

module.exports = {User, registerUser, loginUser, getUser, updateUser, getAllUsers, findUser, logoutUser};
