const express = require('express');

const login = express.Router();

login.route('/')
    .post((req, res) => {
        res.send(req);
    });

module.exports = login;
