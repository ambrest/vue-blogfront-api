const post = require('../tools/post-tools');
const user = require('../tools/user-tools');
const config = require('../config');
const auth = require('../tools/auth');

class Comment {
    constructor(author, body) {
        this.author = author;
        this.timestamp = Date.now();
        this.id = auth.uniqueId();
        this.body = body;
    }
}

function comment({apikey, postid, body}) {
    return new Promise(async (resolve, reject) => {
        const thisPost = await post.getPost({id: postid})
            .catch(reject);

        const commentingUser = await user.findUser({apikey})
            .catch(reject);

        if (commentingUser.permissions.includes('comment')) {
            const newComment = new Comment(commentingUser.id, body);

            thisPost.comments.push(newComment);
            thisPost.save();

            resolve(newComment);
        } else {
            reject(config.errors.user.sufficientRights);
        }
    });
}

function removeComment({apikey, postid, id}) {
    return new Promise(async (resolve, reject) => {
        const thisPost = await post.getPost({id: postid})
            .catch(reject);

        const commentingUser = await user.findUser({apikey})
            .catch(reject);

        const commentIndex = thisPost.comments.findIndex(com => com.id === id);

        if(commentIndex !== -1) {
            if (commentingUser.id === thisPost.comments[commentIndex].author || commentingUser.permissions.includes('administrate')) {
                thisPost.comments.splice(commentIndex, 1);

                thisPost.save();

                resolve(commentIndex);
            } else {
                reject(config.errors.user.sufficientRights);
            }
        } else {
            reject(config.errors.comment.notFound);
        }
    });
}

module.exports = {Comment, comment, removeComment};
