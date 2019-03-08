const user = require('./user-tools');
const database = require('../database/database');
const auth = require('../auth/auth');
const errors = require('../../config/errors');

// Class used to create new posts
class Post {
    constructor(title, author, body, tags) {
        this.id = auth.uniqueId();
        this.author = author;
        this.timestamp = Date.now();

        this.title = title;
        this.body = body;
        this.tags = tags;

        this.comments = [];

        const post = new database.postModel({
            id: this.id,
            title: this.title,
            author: this.author,
            timestamp: this.timestamp,
            body: this.body,
            tags: tags || []
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
    async updatePost({apikey, id, title, body, tags}) {

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

                // TODO: Add validation
                // Change the post title
                if (title) {
                    post.title = title;
                }

                // Change the post body
                if (body) {
                    post.body = body;
                }

                if (tags) {
                    post.tags = tags;
                }

                // Commit changes
                post.save();

                return post;
            } else {
                throw errors.user.sufficientRights;
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
    async writePost({apikey, title, body, tags}) {

        // Resolve user
        return user.findUser({apikey}).then(postingUser => {

            // Make sure that user has sufficient permissions to post
            if (postingUser.permissions.includes('post')) {
                return new Post(title, postingUser.id, body, tags);
            } else {
                throw errors.user.sufficientRights;
            }
        });
    },

    /**
     * Get a post from its ID
     * @param id - ID of the post
     * @returns {Promise} - the post
     */
    async getPost({id}) {
        // Resolve post in the database
        return database.postModel.findOne({id}).exec().then(post => {
            if (post) {
                return post;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Get all posts on the server
     * @returns {Promise} - an array of posts
     */
    async getAllPosts() {

        // Resolve all posts on the server
        return database.postModel.find({}).sort('-timestamp').exec().then(postDocs => {
            if (postDocs) {
                return postDocs;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Get all posts in a specific time range
     * @param timestart - the start of the range
     * @param timeend - the end of the range
     * @returns {Promise} - an array of all posts in the given range
     */
    async getPostRange({timestart, timeend}) {

        // Resolve all posts in given timerange from the database
        return database.postModel.find({
            timestamp: {
                $gte: timestart,
                $lte: timeend
            }
        }).sort('-timestamp').exec().then(postDocs => {
            if (postDocs) {
                return postDocs;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Get a specific number of posts from the server. Grabs from newest to oldest
     * @param count - the number of posts to get
     * @returns {Promise} - an array of posts
     */
    async getPostCount({count}) {

        // Resolve post count
        return database.postModel.find({}).sort('-timestamp').limit(count).exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Removes a post from the server by ID
     * @param apikey - API key of the user that is removing the post. Must be the author or an admin.
     * @param id - ID of the post to remove
     * @returns {Promise} - the removed post
     */
    async removePost({apikey, id}) {

        // Post to remove
        let removingPost;

        // Resolve post by ID
        this.getPost({id}).then(post => {
            removingPost = post;

            // Resolve user removing post
            return user.findUser({apikey});
        }).then(removingUser => {

            // Check that user has sufficient rights to remove the post
            if (removingPost.author === removingUser.id || removingUser.permissions.includes('administrate')) {

                // Delete the post from the database
                return database.postModel.findOneAndDelete({id}).exec();
            } else {
                throw errors.user.sufficientRights;
            }
        });
    },

    /**
     * Get all posts in a certain number range
     * @param start - most recent post, *1* is the most recent!
     * @param end - oldest post, INCLUSIVE
     * @returns {Promise} - an array of posts
     */
    async getPostCountRange({start, end}) {

        // Resolve post count
        return database.postModel.find({})
            .sort('-timestamp')
            .skip(start)
            .limit(end)
            .exec()
            .then(posts => {
                if (posts) {
                    return posts;
                } else {
                    throw errors.post.notFound;
                }
            });
    },

    /**
     * Get all posts made by a specific user
     * @param userid - the user that made the posts
     * @returns {Promise} - an array of posts
     */
    async getPostsBy({userid}) {

        // Resolve all posts by the user with the above userid
        return database.postModel.find({author: userid}).sort('-timestamp').exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    }
};
