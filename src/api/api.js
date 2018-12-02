const express = require('express');
const login = require('./login');

const api = express.Router();

api.route('/')
    .get((req, res) => {
        res.json({
            version: 'Ambrest Scalable Blog v1.0',
            author: 'Ambrest Designs'
        });
    });

api.use('/login', login);

module.exports = api;
