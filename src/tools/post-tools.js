const user = require('./user-tools');
const database = require('./database');
const auth = require('./auth');
const config = require('../config');

class Post {
    constructor(title, author, body) {
        this.id = auth.uniqueId();
        this.author = author;
        this.timestamp = Date.now();

        this.title = title;
        this.body = body;

        this.comments = [];

        const post = new database.postModel({
            id: this.id,
            title: this.title,
            author: this.author,
            timestamp: this.timestamp,
            body: this.body
        });

        post.save();
    }
}

module.exports = {
    updatePost({apikey, id, title, body}) {
        let post;

        return this.getPost({id}).then(resolvedPost => {
            post = resolvedPost;

            return user.findUser({apikey});
        }).then(postingUser => {
            if (post.author === postingUser.id || postingUser.permissions.includes('administrate')) {
                if (title) {
                    post.title = title;
                }

                if (body) {
                    post.body = body;
                }

                post.save();

                return post;
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    writePost({apikey, title, body}) {
        return user.findUser({apikey}).then(postingUser => {
            if (postingUser.permissions.includes('post')) {
                return new Post(title, postingUser.id, body);
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    getPost({id}) {
        return new Promise(async (resolve, reject) => {
            database.postModel.findOne({id}, (error, post) => {
                if (error) {
                    return reject(error);
                }

                if (post) {
                    return resolve(post);
                } else {
                    return reject(config.errors.post.notFound);
                }
            });
        });
    },

    getAllPosts() {
        return new Promise(async (resolve, reject) => {
            database.postModel.find({}, (error, postDocs) => {
                if (error) {
                    return reject(error);
                }

                if (postDocs) {
                    return resolve(postDocs);
                } else {
                    return reject(config.errors.post.notFound);
                }
            });
        });
    },

    getPostRange({timestart, timeend}) {
        return new Promise(async (resolve, reject) => {
            database.postModel.find({timestamp: {$gte: timestart, $lte: timeend}}, (error, postDocs) => {
                if (error) {
                    return reject(error);
                }

                if (postDocs) {
                    return resolve(postDocs);
                } else {
                    return reject(config.errors.post.notFound);
                }
            });
        });
    },

    getPostCount({count}) {
        return new Promise(async (resolve, reject) => {
            database.postModel.find({})
                .limit(count)
                .exec((error, postDocs) => {
                    if (error) {
                        return reject(error);
                    }

                    if (postDocs) {
                        return resolve(postDocs);
                    } else {
                        return reject(config.errors.post.notFound);
                    }
                });
        });
    },

    removePost({apikey, id}) {
        let removingPost;

        this.getPost({id}).then(post => {
            removingPost = post;

            return user.findUser({apikey})
        }).then(async removingUser => {

            if (removingPost.author === removingUser.id || removingUser.permissions.includes('administrate')) {
                return await database.postModel.findOneAndDelete({id}, (error) => {
                    if (error) {
                        throw error;
                    } else {
                        return removingPost;
                    }
                });
            } else {
                throw config.errors.user.sufficientRights;
            }

        });
    }
};
