const express = require('express');

const api = require('./api/api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', api);

app.listen(4000);
