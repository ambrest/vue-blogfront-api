const express = require('express');
const user = require('../db/user');
const config = require('../../config/config');

// Create API router for express
const verify = express.Router();

verify.get('/:apikey', (req, res) => {
    user.verifyUser(req.params.apikey).then(() => {
        res.status(302).redirect(`${config.server.domain}/login`);
    }).catch(() => {
        res.status(302).redirect(`${config.server.domain}/`);
    });
});

module.exports = verify;
