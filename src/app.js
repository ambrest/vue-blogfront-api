const express = require('express');
const api = require('./api/api');
const cors = require('cors');

// Create app
const app = express();

// Add API module
app.use(cors());
app.use('/api', api);

// Start
app.listen(4000);
