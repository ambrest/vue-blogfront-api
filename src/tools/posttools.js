const user = require('./usertools.js');
const database = require('./database.js');
const { uniqueId } = require('./auth.js');

class Post {
    constructor() {
        this.postid = null;
        this.title = null;
        this.author = null;
        this.timestamp = null;

        this.body = null;

        this.error = false;
        this.errorMessage = null;
    }

    // PRIVATE
    postError(message) {
        this.error = true;
        this.errorMessage = message;
    }

    save() {
        const postFile = new database.postSchema({
            postid: this.postid,
            title: this.title,
            author: this.author.userid,
            timestamp: this.timestamp,
            body: this.body
        });

        postFile.save();
    }
}

function updatePost({ apikey, postid, title, body }) {
    return new Promise(async (resolve, reject) => {
        const post = await getPost({ postid: postid })
            .then(postData => postData);

        const postingUser = user.loginUser({ apikey: apikey })
            .then(userData => userData);

        if(post.author.apikey === postingUser.apikey || postingUser.canAdministrate()) {
            await database.postSchema.findOneAndDelete({ 'postid': postid }, ()=>{});

            if (title) {
                post.title = title;
            }

            if (body) {
                post.body = body;
            }

            post.save();

            resolve(post);
        } else {
            post.postError('User does not have sufficient rights or does not exist!');
            resolve(post);
        }
    });
}

function writePost({ apikey, title, body }) {
    return new Promise(async (resolve, reject) => {
        // Create post
        const post = new Post();

        const postingUser = await user.loginUser({ apikey: apikey }).then(userData => userData);

        if(!postingUser.error) {

            if(postingUser.canPost()) {

                post.postid = uniqueId();
                post.author = postingUser;
                post.timestamp = Date.now();

                post.title = title;
                post.body = body;

                post.save();

                resolve(post);

            } else {
                post.postError('User does not have sufficient rights to post! The permission <post> is required.');
                resolve(post);
            }
        } else {
            post.postError(postingUser.errorMessage);
            resolve(post);
        }
    });
}

function getPost({ postid }) {
    return new Promise(async (resolve, reject) => {
        const post = new Post();

        let postSearch = null;

        await database.postSchema.findOne({'postid': postid}, (error, pst) => {
            postSearch = pst;
        });

        if(postSearch) {
            post.postid = postSearch.postid;
            post.title = postSearch.title;
            post.author = user.getUser({ userid: postSearch.author });
            post.timestamp = postSearch.timestamp;
            post.body = postSearch.body;

            resolve(post);
        } else {
            post.postError('Could not find post!');
            resolve(post);
        }
    });
}

module.exports = { Post, writePost, getPost, updatePost };
