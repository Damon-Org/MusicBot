import WebSocket from 'ws'

/**
 * @typedef {Object} WSCredentials
 * @property {string} credentials.client
 * @property {string} credentials.host
 * @property {number} credentials.port
 * @property {string} credentials.token
 */

export default class WSConnection {
    /**
     * @param {WSCredentials} credentials
     */
    constructor(credentials) {
        this._credentials = credentials;

        this.client = new WebSocket(`wss://${credentials.host}:${credentials.port}/`);
    }
}
