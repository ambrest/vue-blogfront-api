const express = require('express');
const api = require('./api/api');
const cors = require('cors');
const compression = require('compression');
const config = require('../config/config');
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const user = require('./tools/user-tools');

// Create app
const app = express();

// Disable powered-by-message
app.disable('x-powered-by');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// G-Zip compression
app.use(compression());

// Allow CORS
app.use(cors());

// GraphQL API Module
app.use('/api', api);

// Serve static
if (process.argv.includes('--docker')) {
    const staticFileMiddleware = express.static('../dist');
    app.use(staticFileMiddleware);
    app.use(history({
        disableDotRule: true,
        verbose: true
    }));
    app.use(staticFileMiddleware);
}

if (process.argv.includes('--configure')) {
    new user.User('admin',
        'Administrator',
        'admin@vue-blog.com',
        ['post', 'comment', 'administrate'],
        'admin');
}

// Start
app.listen(config.server.port);
