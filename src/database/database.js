const mongoose = require('mongoose');

const url = process.argv.includes('--docker') ? 'mongodb://mongo:27017/blog' : 'mongodb://localhost/blog';

mongoose.connect(url, {useNewUrlParser: true});

//  MongoDB model for posts
const postModel = mongoose.model('Post', {
    id: String,
    title: String,
    author: String,
    timestamp: Number,
    body: String,

    comments: [{
        author: String,
        id: String,
        postid: String,
        timestamp: Number,
        body: String
    }]
});

// MongoDB model for users
const userModel = mongoose.model('User', {
    username: String,
    apikeys: [{
        key: String,
        expiry: Number
    }],
    id: String,
    fullname: String,
    permissions: [String],
    email: String,

    hash: String,

    deactivated: Boolean,
    emailVerified: Boolean
});

module.exports = {userModel, postModel};
