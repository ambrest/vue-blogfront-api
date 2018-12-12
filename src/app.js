const express = require('express');
const api = require('./api/api');
const cors = require('cors');
const compression = require('compression');
const config = require('./config');

// Change server URL for docker
if(process.argv.includes('--docker')) {
    config.mongodb.url = 'mongodb://mongo:27017/blog';
    console.log('Docker configuration loaded');
}

// Create app
const app = express();

// Disable powered-by-message
app.disable('x-powered-by');

// G-Zip compression
app.use(compression());

// Allow CORS
app.use(cors());

// Serve static content
app.use(express.static('../../dist'));

// GraphQL API Module
app.use('/api', api);

// Start
app.listen(config.server.port);
