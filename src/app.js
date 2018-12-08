const express = require('express');
const api = require('./api/api');

// Create app
const app = express();

// Add API module
app.use('/api', api);

// Start
app.listen(4000);
