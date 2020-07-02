import BaseModule from '../structures/BaseModule.js'
import log from '../util/Log.js'

import Connection from './ws/Connection.js'

const timeout = 3e4;

export default class WSCommunication extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(WSCommunication, {
            name: 'ws'
        });

        this._tries = 0;
    }

    get connected() {
        return this._conn && this._conn.connected;
    }

    /**
     * @returns {Boolean} True when an active connection was terminated, false when there were none;
     */
    close() {
        if (this.connected) {
            this._conn.destroy();

            this._conn.off('message', this._messageListener);

            this._conn = null;

            return true;
        }
        return false;
    }

    setup() {
        this._reconnect();
    }

    /**
     * @private
     */
    _attemptReconnect() {
        // Remove old listener
        this._conn.off('message', this._messageListener);

        log.warn('WS', 'Lost connection to WS Server, reattempting connect after timeout.');

        const time = Date.now() - timeout;
        if (time >= this._lastAttempt) {
            this._reconnect();

            return;
        }

        setTimeout(() => {
            this._reconnect();
        }, this._lastAttempt - time);
    }

    /**
     * @private
     */
    _bindEvents() {
        this._conn.once('bind', () => this._connected());

        this._conn.on('message', this._messageListener = (socket, message) => this._handleMsg(socket, message));

        this._conn.once('close', () => this._attemptReconnect());

    }

    /**
     * @private
     */
    _connected() {
        log.info('WS', 'Successfully connected.');

        this._tries = 0;
    }

    /**
     * @private
     */
    _reconnect() {
        this._lastAttempt = Date.now();

        this._conn = new Connection(this.auth.credentials.ws);

        this._tries++;

        if (this._tries >= 100) {
            log.critical('WS', `Socket connection still not responding after ${this._tries}`);
        }

        this._bindEvents();
    }
}
