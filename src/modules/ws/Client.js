import { DisconnectCodes, OPCodes } from '../../util/Constants.js'
import { EventEmitter } from 'events'
import log from '../../util/Log.js'
import WebSocket from 'ws'

/**
 * @typedef {Object} WSCredentials
 * @property {string} credentials.group
 * @property {string} credentials.host
 * @property {number} credentials.port
 * @property {string} credentials.token
 */

export default class WSClient extends EventEmitter {
    /**
     * @param {WSCommunicator} wsCommunicator
     */
    constructor(wsCommunicator) {
        super();

        this._parent = wsCommunicator;
        /**
         * @type {WSCredentials}
         */
        this._credentials = this._parent.auth.credentials.ws;

        this._attemptConnect();
    }

    get connected() {
        return this.state === WebSocket.OPEN;
    }

    get group() {
        return this._credentials.group;
    }

    get state() {
        return this._ws.readyState;
    }

    /**
     * @private
     */
    _attemptConnect() {
        this.authenticated = false;

        this._ws = new WebSocket(`wss://${this._credentials.host}:${this._credentials.port}/`);

        this._ws.on('close', (closeEvt) => this._onClose(closeEvt));
        this._ws.on('error', (error) => this._onError(error));
        this._ws.once('open', () => this._onConnect());
        this._ws.on('message', (message) => this._onMessage(message));
    }

    /**
     * @private
     */
    _identify() {
        this.send({
            op: OPCodes['IDENTIFY'],
            d: {
                group: this._credentials.group,
                token: this._credentials.token
            }
        }, true);
    }

    /**
     * @private
     */
    _onClose(closeCode) {
        log.info('WS_CLIENT', `Connection was closed with code: ${closeCode}`);

        for (const evt of ['close', 'open', 'error', 'message']) {
            this._ws.removeAllListeners(evt);
        }

        if (closeCode !== DisconnectCodes['IDENTIFY_FAILED']) {
            setTimeout(() => {
                this._attemptConnect();
            }, 5e3);

            return;
        }

        log.critical('WS_CLIENT', 'Client identification failed, check the payload for any errors or if the token is invalid.')
    }

    /**
     * @private
     */
    _onConnect() {
        log.info('WS_CLIENT', 'Connected to WS Server.');

        this._identify();
    }

    /**
     * @private
     * @param {Error} error
     */
    _onError(error) {
        log.error('WS_CLIENT', 'An error occured: ', error);
    }

    /**
     * @private
     * @param {string} message
     */
    _onMessage(message) {
        const msg = JSON.parse(message);

        switch (msg.op) {
            case OPCodes['BONJOUR']: {
                this.id = msg.d.uuid;
                this.authenticated = true;


                log.info('WS_CLIENT', `Authenticated and received ID: ${this.id}`);

                this.emit('authenticated', this.id);

                break;
            }
            case OPCodes['EVENT']: {
                this.emit('event', msg.e, msg.d, msg.u);

                break;
            }
            case OPCodes['REPLY']: {
                const id = msg.u;
                if (this[id]) this[id].emit('response', msg);

                break;
            }
            case OPCodes['COMMUNICATION_CLOSE']: {
                const id = msg.d;
                if (this[id]) this[id].emit('close');

                break;
            }
        }
    }

    /**
     * @param {string} id
     */
    _close(id) {
        const eventEmitter = this[id];
        if (!eventEmitter) return false;
        eventEmitter.removeAllListeners();

        return true;
    }

    /**
     * @param {string} id
     */
    _open(id) {
        this[id] = new EventEmitter();

        this[id].close = () => this._close(id);

        return this[id];
    }

    /**
     * @param {JSON} pl The payload to send
     * @returns {boolean} False if the payload wasn't an object or the client isn't connected at present time, true otherwise
     */
    send(pl, allow_unauthorized=false) {
        if (typeof pl !== 'object' || !this.connected || (!this.authenticated && !allow_unauthorized)) return false;

        if (pl.u) this._open(pl.u);

        this._ws.send(JSON.stringify(pl));

        return true;
    }
}
