const user = require('./user-tools');
const database = require('./database');
const auth = require('./auth');

class Post {
    constructor() {
        this.id = null;
        this.author = null;
        this.timestamp = null;

        this.title = null;
        this.body = null;

        this.comments = null;

        this.error = false;
        this.errorMessage = null;
    }

    // PRIVATE
    postError(message) {
        this.error = true;
        this.errorMessage = message;
    }

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
    return new Promise(async resolve => {
        const post = await getPost({id: id});
        const postingUser = user.loginUser({apikey: apikey});

        if (post.author.apikey === postingUser.apikey || postingUser.canAdministrate()) {
            await database.postModel.findOneAndDelete({'id': id}, () => {});

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

function writePost({apikey, title, body}) {
    return new Promise(async resolve => {

        // Create post
        const post = new Post();

        const postingUser = await user.loginUser({apikey: apikey}).then(userData => userData);

        if (!postingUser.error) {

            if (postingUser.canPost()) {

                post.id = auth.uniqueId();
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

function getPost({id}) {
    return new Promise(async resolve => {
        const post = new Post();

        let postSearch = null;

        await database.postModel.findOne({'id': id}, (error, pst) => postSearch = pst);

        if (postSearch) {
            post.id = postSearch.id;
            post.title = postSearch.title;
            post.author = user.getUser({id: postSearch.author});
            post.timestamp = postSearch.timestamp;
            post.body = postSearch.body;
        } else {
            post.postError('Could not find post!');
        }

        resolve(post);
    });
}

module.exports = {Post, writePost, getPost, updatePost};
