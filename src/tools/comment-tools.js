const post = require('../tools/post-tools');
const user = require('../tools/user-tools');
const config = require('../../config/config');
const auth = require('../auth/auth');

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
    comment({apikey, postid, body}) {
        // Post to add the comment to
        let thisPost;

        // Resolve the post
        return post.getPost({id: postid}).then(resolvedPost => {
            thisPost = resolvedPost;

            // Get the user that is commenting
            return user.findUser({apikey});
        }).then(commentingUser => {

            // Make sure that the user has sufficient privileges to create a comment
            if (commentingUser.permissions.includes('comment')) {
                const newComment = new Comment(commentingUser.id, body);

                // Add the new comment to the post and save the post
                thisPost.comments.push(newComment);
                thisPost.save();

                return newComment;
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    },

    /**
     * Removes a comment from a post
     * @param apikey - API key of the user removing the comment. Must either be the original commenter or an admin.
     * @param postid - ID of the post that the comment was written on
     * @param id - the ID of the comment to delete
     * @returns {Promise} - the comment
     */
    removeComment({apikey, postid, id}) {
        // Post to remove comment from
        let thisPost;

        // Resolve the post
        return post.getPost({id: postid}).then(resolvedUser => {
            thisPost = resolvedUser;

            // Get the user removing the comment
            return user.findUser({apikey});
        }).then(commentingUser => {

            // Find the comment in the post
            const commentIndex = thisPost.comments.findIndex(com => com.id === id);

            // Make sure that the comment exists
            if (commentIndex !== -1) {

                // Make sure that the user removing the comment is either its author or an administrator
                if (commentingUser.id === thisPost.comments[commentIndex].author || commentingUser.permissions.includes('administrate')) {

                    // Remove the comment
                    thisPost.comments.splice(commentIndex, 1);

                    thisPost.save();

                    return commentIndex;
                } else {
                    throw config.errors.user.sufficientRights;
                }
            } else {
                throw config.errors.comment.notFound;
            }
        });
    },

    /**
     * Updates a given comment
     * @param apikey - API key of the user updating the post. Must either be the author or an admin.
     * @param postid - ID of the post which the comment is in
     * @param id - Comment ID
     * @param body - new body for the comment
     * @returns {Promise} - the updated comment
     */
    updateComment({apikey, id, title, body}) {

        // Post to update
        let thisPost;

        // Resolve post
        return this.getPost({id}).then(resolvedPost => {
            thisPost = resolvedPost;

            // Resolve the author
            return user.findUser({apikey});
        }).then(commentingUser => {

            // Find the comment in the post
            const comment = thisPost.comments.find(com => com.id === id);

            // Make sure that the comment exists
            if (comment) {

                // Make sure that the user removing the comment is either its author or an administrator
                if (commentingUser.id === comment.author || commentingUser.permissions.includes('administrate')) {

                    comment.body = body;

                    thisPost.save();

                    return comment;
                } else {
                    throw config.errors.user.sufficientRights;
                }
            } else {
                throw config.errors.user.sufficientRights;
            }
        });
    }
};
