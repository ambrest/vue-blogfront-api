const uuidv4 = require('uuid/v4');
const config = require('../../config/config');

/**
 * Class for storing API-Keys
 * Apikeys are a UUIDs with an expiration data, set in config
 */
class ApiKey {
    constructor() {
        this.key = uuidv4();
        this.expiry = Date.now() + config.auth.apikeyExpiry;
    }
}

/**
 * Generates a unique ID for users, posts, and comments
 * format: _xxxxxxxx
 * @returns {string} unique ID
 */
function uniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {uniqueId, ApiKey};
