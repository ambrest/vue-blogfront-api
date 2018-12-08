const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true });

// Schema for a post
const postSchema = mongoose.model('Post', {
    postid: String,
    title: String,
    author: String,
    timestamp: Number,
    body: String
});

// User Schema
const userSchema = mongoose.model('User', {
    username: String,
    apikey: String,
    userid: String,
    fullname: String,
    permissions: [String],
    email: String,

    hash: String,

    deactivated: Boolean
});


module.exports = { userSchema, postSchema };
