const express = require('express');
const api = require('./api/api');
const cors = require('cors');
const compression = require('compression');
const config = require('./config');

// Create app
const app = express();

// Disable powered-by-message
app.disable('x-powered-by');

// G-Zip compression
app.use(compression());

// Allow CORS
app.use(cors());

// GraphQL API Module
app.use('/api', api);

// Serve static
app.use('*', express.static('../dist/index.html'));

// Start
app.listen(config.server.port);
