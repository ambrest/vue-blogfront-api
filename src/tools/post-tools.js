const user = require('./user-tools');
const database = require('../database/database');
const auth = require('../auth/auth');
const config = require('../config');

// Class used to create new posts
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
    /**
     * Updates a given post
     * @param apikey - API key of the user updating the post. Must either be the author or an admin.
     * @param id - ID of the post to be updated.
     * @param title - OPTIONAL a new title for the post.
     * @param body - OPTIONAL a new body for the post.
     * @returns {Promise} - the updated post
     */
    updatePost({apikey, id, title, body}) {
        // Post to update
        let post;

        // Resolve post
        return this.getPost({id}).then(resolvedPost => {
            post = resolvedPost;

            // Resolve the author
            return user.findUser({apikey});
        }).then(postingUser => {

            // Make sure that the user is either the author of the post or an admin.
            if (post.author === postingUser.id || postingUser.permissions.includes('administrate')) {

                // Change the post title
                if (title) {
                    post.title = title;
                }

                // Change the post body
                if (body) {
                    post.body = body;
                }

                // Commit changes
                post.save();

                return post;
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    /**
     * Creates a new post
     * @param apikey - API key of the posting user. Must have 'post' permission.
     * @param title - title of the new post
     * @param body - body of the new post
     * @returns {Promise} - the new post
     */
    writePost({apikey, title, body}) {
        // Resolve user
        return user.findUser({apikey}).then(postingUser => {

            // Make sure that user has sufficient permissions to post
            if (postingUser.permissions.includes('post')) {
                return new Post(title, postingUser.id, body);
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    /**
     * Get a post from its ID
     * @param id - ID of the post
     * @returns {Promise} - the post
     */
    getPost({id}) {
        return new Promise(async (resolve, reject) => {

            // Resolve post in the database
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

    /**
     * Get all posts on the server
     * @returns {Promise} - an array of posts
     */
    getAllPosts() {
        return new Promise(async (resolve, reject) => {

            // Resolve all posts on the server
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

    /**
     * Get all posts in a specific time range
     * @param timestart - the start of the range
     * @param timeend - the end of the range
     * @returns {Promise} - an array of all posts in the given range
     */
    getPostRange({timestart, timeend}) {
        return new Promise(async (resolve, reject) => {

            // Resolve all posts in given timerange from the database
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

    /**
     * Get a specific number of posts from the server. Grabs from newest to oldest
     * @param count - the number of posts to get
     * @returns {Promise} - an array of posts
     */
    getPostCount({count}) {
        return new Promise(async (resolve, reject) => {

            // Resolve Posts
            database.postModel.find({}).limit(count).exec((error, postDocs) => {
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

    /**
     * Removes a post from the server by ID
     * @param apikey - API key of the user that is removing the post. Must be the author or an admin.
     * @param id - ID of the post to remove
     * @returns {Promise} - the removed post
     */
    removePost({apikey, id}) {
        // Post to remove
        let removingPost;

        // Resolve post by ID
        this.getPost({id}).then(post => {
            removingPost = post;

            // Resolve user removing post
            return user.findUser({apikey})
        }).then(async removingUser => {

            // Check that user has sufficient rights to remove the post
            if (removingPost.author === removingUser.id || removingUser.permissions.includes('administrate')) {

                // Delete the post from the database
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
