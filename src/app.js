global._productionMode = process.argv.includes('--docker');

const express = require('express');
const api = require('./api/api');
const verify = require('./api/verify');
const cors = require('cors');
const compression = require('compression');
const config = require('../config/config');
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');

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

// Email Verification
app.use('/verify', verify);

// GraphQL API Module
app.use('/api', api);

// Serve static
if (_productionMode) {

    // Use maxAge: 0 to force the browser to reload the service-worker
    const staticFileMiddleware = express.static('../dist', {maxAge: 0});
    app.use(staticFileMiddleware);

    app.use(history({
        disableDotRule: true,
        verbose: true
    }));

    app.use(staticFileMiddleware);
}

// Start
app.listen(config.server.port);
