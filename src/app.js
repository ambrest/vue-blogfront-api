const express = require('express');
const api = require('./api/api');
const cors = require('cors');
const compression = require('compression');

// Create app
const app = express();

// Add API module
app.use(compression());
app.use(cors());
app.use('/api', api);

// Start
app.listen(4000);
