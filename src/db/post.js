const errors = require('../../config/errors');
const config = require('../../config/config');
const {postModel} = require('./models');
const user = require('./user');
const auth = require('../auth');

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

        const post = new postModel({
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

const aggregationPipes = {
    ownClaps: userid => ([

        {
            $addFields: {
                myClaps: {
                    $slice: [{
                        $filter: {
                            input: '$claps',
                            cond: {'$eq': ['$$this.user', userid]}
                        }
                    }, 1]
                }
            }
        },
        {
            $unwind: {
                path: '$myClaps',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                myClaps: '$myClaps.amount'
            }
        }

    ]),
    totalClaps: [
        {
            $addFields: {
                totalClaps: {
                    $reduce: {
                        input: '$claps',
                        initialValue: 0,
                        in: {$add: ['$$this.amount', '$$value']}
                    }
                }
            }
        }
    ]
};

module.exports = {

    /**
     * Updates a given post
     * @param apikey - API key of the user updating the post. Must either be the author or an admin.
     * @param id - ID of the post to be updated.
     * @param title - Optional a new title for the post.
     * @param body - Optional a new body for the post.
     * @param tags - Optional tags
     * @returns {Promise} - the updated post
     */
    async updatePost({apikey, id, title, body, tags}) {

        // Post to update
        let post;

        // Resolve post
        return postModel.findOne({id}).then(resolvedPost => {
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
     * Updates the claps of one post
     * @param apikey - API key of the clapi'n user.
     * @param newClaps - New claps
     * @param postId - Post id
     * @returns {Promise<void>}
     */
    async incrementClaps({apikey, newClaps, postId}) {
        const usr = await user.findUser({apikey});
        const post = await postModel.findOne({id: postId});

        if (!post) {
            throw errors.post.notFound;
        }

        post.claps = Array.isArray(post.claps) ? post.claps : [];
        const existingClapObject = post.claps.find(v => v.user === usr.id);
        const clapObject = existingClapObject ? existingClapObject : {user: usr.id, amount: 0};
        clapObject.amount += newClaps;

        if (clapObject.amount > config.server.maxClaps) {
            clapObject.amount = config.server.maxClaps;
        }

        if (!existingClapObject) {
            post.claps.push(clapObject);
        }

        await post.save();

        return {
            ...post,
            myClaps: clapObject.amount,
            totalClaps: post.claps.reduce((acc, v) => acc + v.amount, 0)
        };
    },

    /**
     * Creates a new post
     * @param apikey - API key of the posting user. Must have 'post' permission.
     * @param title - title of the new post
     * @param body - body of the new post
     * @param tags - Optional tags
     * @returns {Promise} - the new post
     */
    async writePost({apikey, title, body, tags}) {

        // Normalize title because of UTF-8 / 16 support
        title = title.normalize();

        // Check if there is already a post with this title
        if (await postModel.findOne({title})) {
            throw errors.post.titleAlreadyExists;
        }

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
     * @param apikey - Optional apikey to get more informations
     * @param id - ID of the post
     * @returns {Promise} - the post
     */
    async getPost({apikey = null, id}) {
        const usr = apikey && await user.findUser({apikey});

        // Resolve post in the database
        return postModel.aggregate([
            {$match: {id}},

            ...aggregationPipes.totalClaps,
            ...(usr ? aggregationPipes.ownClaps(usr.id) : [])
        ]).exec().then(posts => {
            if (posts.length) {
                return posts[0];
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
        const post = await postModel.findOne({id}).exec();
        const usr = await user.findUser({apikey});

        if (!usr) throw errors.invalid.apikey;
        if (!post) throw errors.post.notFound;

        // Check that user has sufficient rights to remove the post
        if (post.author === usr.id || usr.permissions.includes('administrate')) {

            // Delete the post from the database
            return postModel.findOneAndDelete({id}).exec();
        } else {
            throw errors.user.sufficientRights;
        }
    },

    /**
     * Get all posts in a certain number range
     * @param apikey - Optional apikey to get more informations
     * @param start - most recent post, *1* is the most recent!
     * @param end - oldest post, INCLUSIVE
     * @returns {Promise} - an array of posts
     */
    async getPostCountRange({apikey = null, start, end}) {
        const usr = apikey && await user.findUser({apikey});

        // Resolve post count
        return postModel.aggregate([
            {$sort: {timestamp: -1}},
            {$skip: start},
            {$limit: end},

            ...aggregationPipes.totalClaps,
            ...(usr ? aggregationPipes.ownClaps(usr.id) : [])
        ]).exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Get all posts made by a specific user
     * @param apikey - Optional apikey to get more informations
     * @param userid - the user that made the posts
     * @param start - range start
     * @param end - range end, 5 by default
     * @returns {Promise} - an array of posts
     */
    async getPostsBy({apikey = null, userid, start = 0, end = 5}) {
        const usr = apikey && await user.findUser({apikey});

        // Resolve all posts by the user with the above userid
        return postModel.aggregate([
            {$match: {author: userid}},
            {$sort: {timestamp: -1}},
            {$skip: start},
            {$limit: end},

            ...aggregationPipes.totalClaps,
            ...(usr ? aggregationPipes.ownClaps(usr.id) : [])
        ]).exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    /**
     * Searchs all posts
     * @param apikey - Optional apikey to get more informations
     * @param query Search query
     * @param start - range start
     * @param end - range end, 5 by default
     * @returns {Promise<T | never>}
     */
    async searchPosts({apikey = null, query, start = 0, end = 5}) {
        const usr = apikey && await user.findUser({apikey});

        // Find all posts which match the query
        return postModel.aggregate([
            {$match: {$text: {$search: query}}},
            {$sort: {score: {$meta: 'textScore'}}},
            {$skip: start},
            {$limit: end},

            ...aggregationPipes.totalClaps,
            ...(usr ? aggregationPipes.ownClaps(usr.id) : [])
        ]).exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    },

    async getPostsWhereClapped({apikey = null, userid, start = 0, end = 5}) {
        const usr = apikey && await user.findUser({apikey});

        // Find all posts which match the query
        return postModel.aggregate([
            {$match: {'claps.user': userid}},
            {$skip: start},
            {$limit: end},

            ...aggregationPipes.totalClaps,
            ...(usr ? aggregationPipes.ownClaps(usr.id) : [])
        ]).exec().then(posts => {
            if (posts) {
                return posts;
            } else {
                throw errors.post.notFound;
            }
        });
    }
};
