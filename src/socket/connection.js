const
    EventEmitter = require('events'),
    Net = require('net'),

    SocketMessage = require('./message.js');

/**
 * This class handles the socket connection
 * It handles client authentication and client type handshake
 * @category Socket
 * @extends EventEmitter
 */
class Connection extends EventEmitter {
    /**
     * @param {DamonBase} damonBase
     * @param {external:Object} options
     */
    constructor(damonBase, options) {
        super();

        this.db = damonBase;

        /**
         * @type {String}
         */
        this.clientType = options.clientType;
        /**
         * @type {external:String}
         */
        this.host = options.host;
        /**
         * @type {external:Number}
         */
        this.port = options.port;
        /**
         * @type {external:String}
         */
        this.token = options.token;

        /**
         * @type {external:Number}
         * @readonly
         */
        this.try = 0;

        this.connect();
    }

    connect() {
        this.client = Net.createConnection({
            port: this.port,
            host: this.host
        }, () => {
            this.emit('bind');
            this.client.on('data', (data) => this.externalMessage(data));
        });

        this.client.on('error', (error) => this.connectionError(error));
        this.client.once('close', (hadError) => this.emit('close', hadError));
    }

    connectionError(e) {
        if (e.message.includes('connect ECONNREFUSED')) {
            this.db.log('SOCKET', 'WARN', 'Connection refused by socket server, is it running?');

            return;
        }
        this.db.log('SOCKET', 'ERROR', e.stack);
    }

    destroy() {
        if (!this.client.destroyed) {
            this.client.write(JSON.stringify({
                client: this.clientType,
                request: 'disconnect'
            }));

            this.client.destroy();
        }
    }

    /**
     * This method will handle authentication with the socket server if we haven't authenticated yet
     * if authenticated we just forward the message
     * @param {Buffer} data
     */
    externalMessage(data) {
        if (!this.ready) {
            const message = data.toString();
            if (message.includes('authentication_required') || message.includes('invalid_auth')) {
                if (this.try == 2) {
                    throw new Error('Socket Authentication token is not valid!');

                    return;
                }

                this.client.write(`Bearer: ${this.token}`);
                this.try++;

                return;
            }

            if (message.includes('client?')) {
                this.client.write(`Client: ${this.clientType}`);

                return;
            }

            if (message.includes('server_closing')) {
                console.log('Received server close message');

                return;
            }

            if (message.includes('ready')) {
                this.ready = true;

                return;
            }
        }

        try {
            const socketMessage = new SocketMessage(data);
            socketMessage.setTimestamp('target_received');

            this.emit('socket_event', socketMessage.request, socketMessage);
        } catch (e) {
            if (e.message.includes('Unexpected token') && e.message.includes('in JSON at position')) {
                const message = data.toString();

                if (message.includes('server_closing')) {
                    this.db.log('SOCKET', 'WARN', 'Received server close message!');

                    return;
                }
                if (message.includes('authentication_required') || message.includes('invalid_auth')) {
                    this.destroy();

                    return;
                }

                this.db.log('SOCKET', 'INFO', message);
            }
        }
    }

    /**
     * @param {SocketMessage} socketMessage
     */
    send(socketMessage) {
        socketMessage.setTimestamp('target_sent');

        this.client.write(socketMessage.toString());
    }
}

module.exports = Connection;
