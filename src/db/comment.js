const user = require('./user');
const errors = require('../../config/errors');
const auth = require('../auth');
const {postModel} = require('../db/models');

// Class for constructing new comments
class Comment {
    constructor(author, body) {
        this.author = author;
        this.timestamp = Date.now();
        this.id = auth.uniqueId();
        this.body = body;
    }
}

module.exports = {

    /**
     * Post a new comment
     * @param apikey - apikey of the posting user. Must have 'comment' permission
     * @param postid - id of the post to add a comment to
     * @param body - body of the comment
     * @returns {Promise} - the comment
     */
    async comment({apikey, postid, body}) {

        // Resolve the post and user
        const post = await postModel.findOne({id: postid}).exec();
        const usr = await user.findUser({apikey});

        if (!usr) throw errors.invalid.apikey;
        if (!post) throw errors.post.notFound;

        // Make sure that the user has sufficient privileges to create a comment
        if (usr.permissions.includes('comment')) {
            const newComment = new Comment(usr.id, body.replace(/^[\r\n ]+|[\r\n ]+$/g, ''));

            // Add the new comment to the post and save the post
            post.comments.push(newComment);
            await post.save();

            return newComment;
        } else {
            throw errors.user.sufficientRights;
        }
    },

    /**
     * Removes a comment from a post
     * @param apikey - API key of the user removing the comment. Must either be the original commenter or an admin.
     * @param postid - ID of the post that the comment was written on
     * @param id - the ID of the comment to delete
     * @returns {Promise} - the comment
     */
    async removeComment({apikey, postid, id}) {

        // Resolve the post and user
        const post = await postModel.findOne({id: postid}).exec();
        const usr = await user.findUser({apikey});

        if (!usr) throw errors.invalid.apikey;
        if (!post) throw errors.post.notFound;

        // Find the comment in the post
        const commentIndex = post.comments.findIndex(com => com.id === id);
        const comment = post.comments[commentIndex];

        // Make sure that the comment exists
        if (~commentIndex) {

            // Make sure that the user removing the comment is either its author or an administrator
            if (usr.id === comment.author || usr.permissions.includes('administrate')) {

                // Remove the comment
                post.comments.splice(commentIndex, 1);
                post.save();
                return comment;
            } else {
                throw errors.user.sufficientRights;
            }
        } else {
            throw errors.comment.notFound;
        }
    },

    /**
     * Updates a given comment
     * @param apikey - API key of the user updating the post. Must either be the author or an admin.
     * @param postid - ID of the post which the comment is in
     * @param id - Comment ID
     * @param body - new body for the comment
     * @returns {Promise} - the updated comment
     */
    async updateComment({apikey, postid, id, body}) {

        // Resolve the post and user
        const post = await postModel.findOne({id: postid}).exec();
        const usr = await user.findUser({apikey});

        if (!usr) throw errors.invalid.apikey;
        if (!post) throw errors.post.notFound;

        // Find the comment in the post
        const comment = post.comments.find(com => com.id === id);

        // Make sure that the comment exists
        if (comment) {

            // Make sure that the user removing the comment is either its author or an administrator
            if (usr.id === comment.author || usr.permissions.includes('administrate')) {
                comment.body = body;

                // Save post
                post.save();
                return comment;
            } else {
                throw errors.user.sufficientRights;
            }
        } else {
            throw errors.user.sufficientRights;
        }
    }
};
