const uuidv4 = require('uuid/v4');
const config = require('../config');

class ApiKey {
    constructor() {
        this.key = uuidv4();
        this.expiry = Date.now() + config.auth.apikeyExpiry;
    }
}

function uniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {uniqueId, ApiKey};
