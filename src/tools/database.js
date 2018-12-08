const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog', {useNewUrlParser: true});

// Schema for a post
const postModel = mongoose.model('Post', {
    id: String,
    title: String,
    author: String,
    timestamp: Number,
    body: String
});

// User Schema
const userModel = mongoose.model('User', {
    username: String,
    apikey: String,
    id: String,
    fullname: String,
    permissions: [String],
    email: String,

    hash: String,

    deactivated: Boolean
});

module.exports = {userModel, postModel};
