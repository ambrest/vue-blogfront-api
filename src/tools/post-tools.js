const user = require('./user-tools');
const database = require('./database');
const auth = require('./auth');
const config = require('../config');

class Post {
    constructor() {
        this.id = null;
        this.author = null;
        this.timestamp = null;

        this.title = null;
        this.body = null;

        this.comments = [];
    }

    // PRIVATE

    save() {
        const postFile = new database.postModel({
            id: this.id,
            title: this.title,
            author: this.author.id,
            timestamp: this.timestamp,
            body: this.body
        });

        postFile.save();
    }
}

function updatePost({apikey, id, title, body}) {
    return new Promise(async (resolve, reject) => {
        const post = await getPost({id})
            .catch(reject);

        const postingUser = await user.loginUser({apikey})
            .catch(reject);

        if (post.author === postingUser.id || postingUser.permissions.includes('administrate')) {
            if (title) {
                post.title = title;
            }

            if (body) {
                post.body = body;
            }

            post.save();

            resolve(post);
        } else {
            reject(config.errors.user.sufficientRights);
        }
    });
}

function writePost({apikey, title, body}) {
    return new Promise(async (resolve, reject) => {
        const post = new Post();

        const postingUser = await user.findUser({apikey})
            .catch(reject);

        if (postingUser) {
            if (postingUser.permissions.includes('post')) {
                post.id = auth.uniqueId();
                post.author = postingUser;
                post.timestamp = Date.now();

                post.title = title;
                post.body = body;

                post.save();

                resolve(post);
            } else {
                reject(config.errors.user.sufficientRights);
            }
        } else {
            reject(config.errors.user.notFound);
        }
    });
}

function getPost({id}) {
    return new Promise(async (resolve, reject) => {
        database.postModel.findOne({id}, (error, post) => {
            if (error) {
                return reject(error);
            }

            if (post) {
                resolve(post);
            } else {
                reject(config.errors.post.notFound);
            }
        });
    });
}

function getAllPosts() {
    return new Promise(async (resolve, reject) => {
        database.postModel.find({}, (error, postDocs) => {
            if (error) {
                return reject(error);
            }

            if (postDocs) {
                resolve(postDocs);
            } else {
                reject(config.errors.post.notFound);
            }
        });
    });
}

function getPostRange({timestart, timeend}) {
    return new Promise(async (resolve, reject) => {
        database.postModel.find({timestamp: {$gte: timestart, $lte: timeend}}, (error, postDocs) => {
            if (error) {
                return reject(error);
            }

            if (postDocs) {
                resolve(postDocs);
            } else {
                reject(config.errors.post.notFound);
            }
        });
    });
}

function getPostCount({count}) {
    return new Promise(async (resolve, reject) => {
        database.postModel.find({})
            .limit(count)
            .exec((error, postDocs) => {
                if (error) {
                    return reject(error);
                }

                if (postDocs) {
                    resolve(postDocs);
                } else {
                    reject(config.errors.post.notFound);
                }
            });
    });
}

function removePost({apikey, id}) {
    return new Promise(async (resolve, reject) => {
        const removingPost = await getPost({id})
            .catch(reject);

        const removingUser = await user.findUser({apikey})
            .catch(reject);

        if (removingPost.author === removingUser.id || removingUser.permissions.includes('administrate')) {
            database.postModel.findOneAndDelete({id}, (error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(removingPost);
                }
            });
        } else {
            reject(config.errors.user.sufficientRights);
        }
    });
}

module.exports = {Post, writePost, getPost, updatePost, getAllPosts, getPostRange, getPostCount, removePost};
